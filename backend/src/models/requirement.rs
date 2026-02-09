use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Requirement {
    pub id: Uuid,
    pub project_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub gherkin_scenario: String,
    pub position_x: Option<f64>,
    pub position_y: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct RequirementStep {
    pub id: Uuid,
    pub requirement_id: Uuid,
    pub step_type: String,
    pub step_order: i32,
    pub step_text: String,
    pub domain_references: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct RequirementConnection {
    pub id: Uuid,
    pub project_id: Uuid,
    pub source_requirement_id: Uuid,
    pub target_requirement_id: Uuid,
    pub connection_type: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequirementWithSteps {
    pub requirement: Requirement,
    pub steps: Vec<RequirementStep>,
}
