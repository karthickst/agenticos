use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateRequirementRequest {
    #[validate(length(min = 1, max = 255))]
    pub title: String,
    pub description: Option<String>,
    #[validate(length(min = 1))]
    pub gherkin_scenario: String,
    pub position_x: Option<f64>,
    pub position_y: Option<f64>,
}

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdateRequirementRequest {
    #[validate(length(min = 1, max = 255))]
    pub title: Option<String>,
    pub description: Option<String>,
    pub gherkin_scenario: Option<String>,
    pub position_x: Option<f64>,
    pub position_y: Option<f64>,
}

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateStepRequest {
    #[validate(length(min = 1, max = 10))]
    pub step_type: String,
    pub step_order: i32,
    #[validate(length(min = 1))]
    pub step_text: String,
    pub domain_references: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateConnectionRequest {
    pub source_requirement_id: String,
    pub target_requirement_id: String,
    pub connection_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DomainReference {
    pub domain_id: String,
    pub attribute_id: String,
    pub reference_text: String,
}
