use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    response::Json,
};
use serde_json::{json, Value};
use sqlx::{Row, SqlitePool};

use crate::{
    models::{
        CreateNotificationRequest, Notification, NotificationListResponse, NotificationQuery,
        NotificationResponse, UpdateNotificationRequest, User,
    },
    utils::Claims,
};

pub async fn get_notifications(
    State(pool): State<SqlitePool>,
    Query(query): Query<NotificationQuery>,
) -> Result<Json<NotificationListResponse>, (StatusCode, Json<Value>)> {
    let page = query.page.unwrap_or(1);
    let per_page = query.per_page.unwrap_or(10).min(100);
    let offset = (page - 1) * per_page;

    // 获取总数
    let total = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM notifications WHERE is_published = true")
        .fetch_one(&pool)
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"message": "数据库错误"})),
            )
        })?;

    // 获取通知列表
    let rows = sqlx::query(
        "SELECT n.id, n.title, n.content, n.priority, n.author_id, n.is_published, 
                n.created_at, n.updated_at, u.username as author_username
         FROM notifications n 
         LEFT JOIN users u ON n.author_id = u.id 
         WHERE n.is_published = true
         ORDER BY n.created_at DESC 
         LIMIT ? OFFSET ?"
    )
    .bind(per_page as i64)
    .bind(offset as i64)
    .fetch_all(&pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "数据库错误"})),
        )
    })?;

    let mut notifications = Vec::new();
    for row in rows {
        let notification = NotificationResponse {
            id: row.get("id"),
            title: row.get("title"),
            content: row.get("content"),
            priority: row.get("priority"),
            author_id: row.get("author_id"),
            author_username: row.get("author_username"),
            is_published: row.get("is_published"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            attachments: vec![],
        };
        notifications.push(notification);
    }

    let total_pages = ((total as f64) / (per_page as f64)).ceil() as u32;

    let response = NotificationListResponse {
        notifications,
        total,
        pages: total_pages,
        current_page: page,
        per_page,
    };

    Ok(Json(response))
}

pub async fn get_notification(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<Json<NotificationResponse>, (StatusCode, Json<Value>)> {
    let row = sqlx::query(
        "SELECT n.id, n.title, n.content, n.priority, n.author_id, n.is_published, 
                n.created_at, n.updated_at, u.username as author_username
         FROM notifications n 
         LEFT JOIN users u ON n.author_id = u.id 
         WHERE n.id = ? AND n.is_published = true"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "数据库错误"})),
        )
    })?;

    let row = row.ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({"message": "通知不存在"})),
        )
    })?;

    let notification = NotificationResponse {
        id: row.get("id"),
        title: row.get("title"),
        content: row.get("content"),
        priority: row.get("priority"),
        author_id: row.get("author_id"),
        author_username: row.get("author_username"),
        is_published: row.get("is_published"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
        attachments: vec![],
    };

    Ok(Json(notification))
}

pub async fn create_notification(
    State(pool): State<SqlitePool>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateNotificationRequest>,
) -> Result<Json<NotificationResponse>, (StatusCode, Json<Value>)> {
    let user_id: i64 = claims.sub.parse().map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(json!({"message": "无效的用户ID"})),
        )
    })?;

    // 检查用户是否为管理员
    let user = sqlx::query_as::<_, User>(
        "SELECT id, username, password_hash, is_admin, created_at, updated_at FROM users WHERE id = ?"
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

    if !user.is_admin {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({"message": "需要管理员权限"})),
        ));
    }

    // 创建通知
    let notification_id = sqlx::query_scalar::<_, i64>(
        "INSERT INTO notifications (title, content, priority, author_id, is_published, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
         RETURNING id"
    )
    .bind(&payload.title)
    .bind(&payload.content)
    .bind(payload.priority.unwrap_or_else(|| "medium".to_string()))
    .bind(user_id)
    .bind(payload.is_published.unwrap_or(true))
    .fetch_one(&pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "通知创建失败"})),
        )
    })?;

    // 获取创建的通知
    let row = sqlx::query(
        "SELECT n.id, n.title, n.content, n.priority, n.author_id, n.is_published, 
                n.created_at, n.updated_at, u.username as author_username
         FROM notifications n 
         LEFT JOIN users u ON n.author_id = u.id 
         WHERE n.id = ?"
    )
    .bind(notification_id)
    .fetch_one(&pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"message": "获取通知失败"})),
        )
    })?;

    let notification = NotificationResponse {
        id: row.get("id"),
        title: row.get("title"),
        content: row.get("content"),
        priority: row.get("priority"),
        author_id: row.get("author_id"),
        author_username: row.get("author_username"),
        is_published: row.get("is_published"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
        attachments: vec![],
    };

    Ok(Json(notification))
}

