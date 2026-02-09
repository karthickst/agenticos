use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Specification {
    pub id: Uuid,
    pub project_id: Uuid,
    pub claude_model: String,
    pub specification_text: String,
    pub metadata: Option<serde_json::Value>,
    pub version: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct SpecificationJob {
    pub id: Uuid,
    pub project_id: Uuid,
    pub status: String,
    pub claude_model: String,
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}
