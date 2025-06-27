use axum::{
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};
use serde_json::json;

use crate::utils::JwtUtils;

pub async fn auth_middleware(
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = headers
        .get("authorization")
        .and_then(|header| header.to_str().ok());

    if let Some(auth_header) = auth_header {
        if let Some(token) = auth_header.strip_prefix("Bearer ") {
            match JwtUtils::verify_token(token) {
                Ok(token_data) => {
                    // 将用户信息添加到请求扩展中
                    request.extensions_mut().insert(token_data.claims);
                    return Ok(next.run(request).await);
                }
                Err(_) => {
                    return Err(StatusCode::UNAUTHORIZED);
                }
            }
        }
    }

    Err(StatusCode::UNAUTHORIZED)
}

pub async fn admin_middleware(
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = headers
        .get("authorization")
        .and_then(|header| header.to_str().ok());

    if let Some(auth_header) = auth_header {
        if let Some(token) = auth_header.strip_prefix("Bearer ") {
            match JwtUtils::verify_token(token) {
                Ok(token_data) => {
                    // 这里需要从数据库检查用户是否为管理员
                    // 暂时先添加到请求扩展中，在处理器中检查
                    request.extensions_mut().insert(token_data.claims);
                    return Ok(next.run(request).await);
                }
                Err(_) => {
                    return Err(StatusCode::UNAUTHORIZED);
                }
            }
        }
    }

    Err(StatusCode::UNAUTHORIZED)
}

