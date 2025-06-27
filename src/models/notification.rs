use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Notification {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub priority: String,
    pub author_id: i64,
    pub is_published: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateNotificationRequest {
    pub title: String,
    pub content: String,
    pub priority: Option<String>,
    pub is_published: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNotificationRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub priority: Option<String>,
    pub is_published: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct NotificationResponse {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub priority: String,
    pub author_id: i64,
    pub author_username: Option<String>,
    pub is_published: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub attachments: Vec<super::attachment::AttachmentResponse>,
}

#[derive(Debug, Deserialize)]
pub struct NotificationQuery {
    pub page: Option<u32>,
    pub per_page: Option<u32>,
    pub priority: Option<String>,
    pub search: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct NotificationListResponse {
    pub notifications: Vec<NotificationResponse>,
    pub total: i64,
    pub pages: u32,
    pub current_page: u32,
    pub per_page: u32,
}

