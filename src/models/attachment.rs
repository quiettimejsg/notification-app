use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Attachment {
    pub id: i64,
    pub notification_id: Option<i64>,
    pub filename: String,
    pub original_filename: String,
    pub file_path: String,
    pub file_size: i64,
    pub mime_type: String,
    pub uploaded_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct AttachmentResponse {
    pub id: i64,
    pub notification_id: Option<i64>,
    pub filename: String,
    pub original_filename: String,
    pub file_size: i64,
    pub mime_type: String,
    pub uploaded_at: DateTime<Utc>,
}

impl From<Attachment> for AttachmentResponse {
    fn from(attachment: Attachment) -> Self {
        Self {
            id: attachment.id,
            notification_id: attachment.notification_id,
            filename: attachment.filename,
            original_filename: attachment.original_filename,
            file_size: attachment.file_size,
            mime_type: attachment.mime_type,
            uploaded_at: attachment.uploaded_at,
        }
    }
}

