mod handlers;
mod middleware;
mod models;
mod utils;

use axum::{
    http::Method,
    middleware as axum_middleware,
    routing::{get, post},
    Router,
};
use handlers::*;
use middleware::*;
use sqlx::sqlite::SqlitePoolOptions;
use std::env;
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 加载环境变量
    dotenv::dotenv().ok();

    // 初始化日志
    tracing_subscriber::fmt::init();

    // 数据库连接
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:notification.db".to_string());
    let pool = SqlitePoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await?;

    // 运行数据库迁移
    sqlx::migrate!("./migrations").run(&pool).await?;

    // 创建默认管理员用户
    let admin_password = bcrypt::hash("admin123", bcrypt::DEFAULT_COST)?;
    sqlx::query!(
        "INSERT OR IGNORE INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)",
        "admin",
        admin_password,
        true
    )
    .execute(&pool)
    .await?;

    // CORS配置
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any)
        .allow_origin(Any);

    // 构建路由
    let app = Router::new()
        .route("/health", get(health_check))
        // 认证路由
        .route("/api/auth/login", post(login))
        .route("/api/auth/register", post(register))
        .route(
            "/api/auth/me",
            get(get_current_user).layer(axum_middleware::from_fn(auth_middleware)),
        )
        // 公开通知路由
        .route("/api/notifications", get(get_notifications))
        .route("/api/notifications/:id", get(get_notification))
        // 管理员通知路由
        .route(
            "/api/admin/notifications",
            post(create_notification).layer(axum_middleware::from_fn(auth_middleware)),
        )
        // 2FA路由
        .route(
            "/api/2fa/setup",
            post(setup_2fa).layer(axum_middleware::from_fn(auth_middleware)),
        )
        .route(
            "/api/2fa/enable",
            post(enable_2fa).layer(axum_middleware::from_fn(auth_middleware)),
        )
        .route(
            "/api/2fa/disable",
            post(disable_2fa).layer(axum_middleware::from_fn(auth_middleware)),
        )
        // 添加CORS和状态
        .layer(
            ServiceBuilder::new()
                .layer(cors)
        )
        .with_state(pool);

    // 服务器配置
    let port = env::var("PORT").unwrap_or_else(|_| "5001".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    info!("🚀 Notification Backend Server starting on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn health_check() -> axum::response::Json<serde_json::Value> {
    axum::response::Json(serde_json::json!({
        "status": "OK",
        "timestamp": chrono::Utc::now(),
        "version": "1.0.0"
    }))
}


use handlers::totp::{setup_2fa, enable_2fa, disable_2fa};

