use axum::{
    extract::{Extension, State},
    http::StatusCode,
    response::Json,
};
use serde_json::{json, Value};
use sqlx::SqlitePool;

use crate::utils::Claims;
use crate::utils::{generate_totp_secret, verify_totp_code, generate_backup_codes, TotpSetup, TotpVerification};

// 设置2FA
pub async fn setup_2fa(
    Extension(claims): Extension<Claims>,
    State(pool): State<SqlitePool>,
) -> Result<Json<Value>, StatusCode> {
    let user_id = claims.sub.parse::<i64>().map_err(|_| StatusCode::BAD_REQUEST)?;
    
    // 检查用户是否存在
    let user = sqlx::query!("SELECT username FROM users WHERE id = ?", user_id)
        .fetch_optional(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let user = user.ok_or(StatusCode::NOT_FOUND)?;
    
    // 生成TOTP密钥和二维码
    let totp_setup = generate_totp_secret(&user.username, "Notification App")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // 生成备用代码
    let backup_codes = generate_backup_codes();
    let backup_codes_json = serde_json::to_string(&backup_codes)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // 保存到数据库（暂时未启用）
    sqlx::query!(
        "UPDATE users SET totp_secret = ?, backup_codes = ?, totp_enabled = 0 WHERE id = ?",
        totp_setup.secret,
        backup_codes_json,
        user_id
    )
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(json!({
        "qr_code": totp_setup.qr_code,
        "manual_entry_key": totp_setup.manual_entry_key,
        "backup_codes": backup_codes,
        "message": "请使用Google Authenticator等应用扫描二维码，然后输入验证码完成设置"
    })))
}

// 启用2FA
pub async fn enable_2fa(
    Extension(claims): Extension<Claims>,
    State(pool): State<SqlitePool>,
    Json(verification): Json<TotpVerification>,
) -> Result<Json<Value>, StatusCode> {
    let user_id = claims.sub.parse::<i64>().map_err(|_| StatusCode::BAD_REQUEST)?;
    
    // 获取用户的TOTP密钥
    let user = sqlx::query!("SELECT totp_secret FROM users WHERE id = ?", user_id)
        .fetch_optional(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let user = user.ok_or(StatusCode::NOT_FOUND)?;
    let totp_secret = user.totp_secret.ok_or(StatusCode::BAD_REQUEST)?;
    
    // 验证TOTP代码
    let is_valid = verify_totp_code(&totp_secret, &verification.code)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if !is_valid {
        return Ok(Json(json!({
            "success": false,
            "message": "验证码无效，请重试"
        })));
    }
    
    // 启用2FA
    sqlx::query!("UPDATE users SET totp_enabled = 1 WHERE id = ?", user_id)
        .execute(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(json!({
        "success": true,
        "message": "2FA已成功启用"
    })))
}

// 禁用2FA
pub async fn disable_2fa(
    Extension(claims): Extension<Claims>,
    State(pool): State<SqlitePool>,
    Json(verification): Json<TotpVerification>,
) -> Result<Json<Value>, StatusCode> {
    let user_id = claims.sub.parse::<i64>().map_err(|_| StatusCode::BAD_REQUEST)?;
    
    // 获取用户的TOTP密钥
    let user = sqlx::query!("SELECT totp_secret, totp_enabled FROM users WHERE id = ?", user_id)
        .fetch_optional(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let user = user.ok_or(StatusCode::NOT_FOUND)?;
    
    if user.totp_enabled != 1 {
        return Ok(Json(json!({
            "success": false,
            "message": "2FA未启用"
        })));
    }
    
    let totp_secret = user.totp_secret.ok_or(StatusCode::BAD_REQUEST)?;
    
    // 验证TOTP代码
    let is_valid = verify_totp_code(&totp_secret, &verification.code)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if !is_valid {
        return Ok(Json(json!({
            "success": false,
            "message": "验证码无效，请重试"
        })));
    }
    
    // 禁用2FA并清除相关数据
    sqlx::query!(
        "UPDATE users SET totp_enabled = 0, totp_secret = NULL, backup_codes = NULL WHERE id = ?",
        user_id
    )
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    Ok(Json(json!({
        "success": true,
        "message": "2FA已禁用"
    })))
}

// 获取2FA状态
pub async fn get_2fa_status(
    Extension(claims): Extension<Claims>,
    State(pool): State<SqlitePool>,
) -> Result<Json<Value>, StatusCode> {
    let user_id = claims.sub.parse::<i64>().map_err(|_| StatusCode::BAD_REQUEST)?;
    
    let user = sqlx::query!("SELECT totp_enabled FROM users WHERE id = ?", user_id)
        .fetch_optional(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let user = user.ok_or(StatusCode::NOT_FOUND)?;
    
    Ok(Json(json!({
        "enabled": user.totp_enabled == 1
    })))
}

