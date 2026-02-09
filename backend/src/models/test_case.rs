use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct TestCase {
    pub id: Uuid,
    pub requirement_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub test_data: Option<serde_json::Value>,
    pub expected_outcome: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestCaseWithRequirement {
    pub test_case: TestCase,
    pub requirement_title: String,
}
