use axum::{
    extract::{Extension, State},
    http::StatusCode,
    response::Json,
};
use serde_json::{json, Value};
use sqlx::SqlitePool;

use crate::{
    models::{CreateUserRequest, LoginRequest, LoginResponse, User, UserResponse},
    utils::{hash_password, verify_password, Claims, JwtUtils},
};

pub async fn login(
    State(pool): State<SqlitePool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, (StatusCode, Json<Value>)> {
    // 查找用户
    let user = sqlx::query_as::<_, User>(
        "SELECT id, username, password_hash, is_admin, created_at, updated_at FROM users WHERE username = ?",
    )
    .bind(&payload.username)
    .fetch_optional(&pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "数据库错误"})),
        )
    })?;

    let user = user.ok_or_else(|| {
        (
            StatusCode::UNAUTHORIZED,
            Json(json!({"message": "用户名或密码错误"})),
        )
    })?;

    // 验证密码
    let is_valid = verify_password(&payload.password, &user.password_hash).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "密码验证失败"})),
        )
    })?;

    if !is_valid {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({"message": "用户名或密码错误"})),
        ));
    }

    // 生成JWT令牌
    let token = JwtUtils::generate_token(user.id, &user.username).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "令牌生成失败"})),
        )
    })?;

    let response = LoginResponse {
        access_token: token,
        user: user.into(),
    };

    Ok(Json(response))
}

pub async fn register(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    // 检查用户名是否已存在
    let existing_user = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users WHERE username = ?")
        .bind(&payload.username)
        .fetch_one(&pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"message": "数据库错误"})),
            )
        })?;

    if existing_user > 0 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({"message": "用户名已存在"})),
        ));
    }

    // 哈希密码
    let password_hash = hash_password(&payload.password).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "密码哈希失败"})),
        )
    })?;

    // 创建用户
    let user_id = sqlx::query_scalar::<_, i64>(
        "INSERT INTO users (username, password_hash, is_admin, created_at, updated_at) 
         VALUES (?, ?, ?, datetime('now'), datetime('now')) 
         RETURNING id",
    )
    .bind(&payload.username)
    .bind(&password_hash)
    .bind(payload.is_admin.unwrap_or(false))
    .fetch_one(&pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "用户创建失败"})),
        )
    })?;

    // 获取创建的用户信息
    let user = sqlx::query_as::<_, User>(
        "SELECT id, username, password_hash, is_admin, created_at, updated_at FROM users WHERE id = ?",
    )
    .bind(user_id)
    .fetch_one(&pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "获取用户信息失败"})),
        )
    })?;

    Ok(Json(json!({
        "message": "注册成功",
        "user": UserResponse::from(user)
    })))
}

pub async fn get_current_user(
    State(pool): State<SqlitePool>,
    Extension(claims): Extension<Claims>,
) -> Result<Json<UserResponse>, (StatusCode, Json<Value>)> {
    let user_id: i64 = claims.sub.parse().map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(json!({"message": "无效的用户ID"})),
        )
    })?;

    let user = sqlx::query_as::<_, User>(
        "SELECT id, username, password_hash, is_admin, created_at, updated_at FROM users WHERE id = ?",
    )
    .bind(user_id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "数据库错误"})),
        )
    })?;

    let user = user.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({"message": "用户不存在"})),
        )
    })?;

    Ok(Json(user.into()))
}

pub async fn logout() -> Json<Value> {
    Json(json!({"message": "登出成功"}))
}

