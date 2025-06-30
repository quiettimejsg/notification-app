mod handlers;
mod middleware;
mod models;
mod utils;

use axum::{
    http::Method,
    middleware as axum_middleware,
    routing::{delete, get, post, put},
    Router,
};
use dotenv::dotenv;
use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool};
use std::env;
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber;

use handlers::*;
use middleware::*;
use utils::*;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 加载环境变量
    dotenv().ok();

    // 初始化日志
    tracing_subscriber::fmt::init();

    // 数据库配置
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:./database.sqlite".to_string());
    
    // 创建数据库（如果不存在）
    if !Sqlite::database_exists(&database_url).await.unwrap_or(false) {
        info!("创建数据库: {}", database_url);
        match Sqlite::create_database(&database_url).await {
            Ok(_) => info!("数据库创建成功"),
            Err(error) => panic!("数据库创建失败: {}", error),
        }
    }

    // 连接数据库
    let pool = SqlitePool::connect(&database_url).await?;

    // 运行数据库迁移
    sqlx::migrate!("./migrations").run(&pool).await?;

    // 创建默认管理员用户
    create_default_admin(&pool).await?;

    // CORS配置
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    // 构建路由
    let app = Router::new()
        // 健康检查
        .route("/health", get(health_check))
        // 认证路由
        .route("/api/auth/login", post(login))
        .route("/api/auth/register", post(register))
        .route("/api/auth/logout", post(logout))
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
        // 添加CORS和状态
        .layer(
            ServiceBuilder::new()
                .layer(cors)
        )
        .with_state(pool);

    // 服务器配置
    let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "5001".to_string());
    let addr = format!("{}:{}", host, port);

    info!("服务器启动在: {}", addr);

    // 启动服务器
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn health_check() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "OK",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "version": "1.0.0"
    }))
}

async fn create_default_admin(pool: &SqlitePool) -> anyhow::Result<()> {
    // 检查是否存在管理员用户
    let admin_count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users WHERE username = 'admin'")
        .fetch_one(pool)
        .await?;

    if admin_count == 0 {
        let password_hash = hash_password("admin123")?;
        
        sqlx::query(
            "INSERT INTO users (username, password_hash, is_admin, created_at, updated_at) 
             VALUES ('admin', ?, true, datetime('now'), datetime('now'))"
        )
        .bind(&password_hash)
        .execute(pool)
        .await?;

        info!("创建默认管理员用户: admin / admin123");
    }

    Ok(())
}

