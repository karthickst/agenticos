use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct GenerateSpecificationRequest {
    #[validate(length(min = 1))]
    pub claude_model: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateSpecificationResponse {
    pub job_id: String,
    pub status: String,
}
