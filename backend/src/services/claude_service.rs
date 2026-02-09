use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::domain::{Domain, DomainAttribute};
use crate::models::requirement::{Requirement, RequirementStep};
use crate::models::test_case::TestCase;

const ANTHROPIC_API_URL: &str = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION: &str = "2023-06-01";

#[derive(Debug, Serialize)]
struct ClaudeRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<ClaudeMessage>,
}

#[derive(Debug, Serialize)]
struct ClaudeMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct ClaudeResponse {
    content: Vec<ClaudeContent>,
}

#[derive(Debug, Deserialize)]
struct ClaudeContent {
    #[serde(rename = "type")]
    content_type: String,
    text: String,
}

pub struct ClaudeService {
    client: Client,
    api_key: String,
}

impl ClaudeService {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }

    /// Generate a software specification using Claude API
    pub async fn generate_specification(
        &self,
        model: &str,
        domains: Vec<Domain>,
        domain_attributes: Vec<DomainAttribute>,
        requirements: Vec<Requirement>,
        requirement_steps: Vec<RequirementStep>,
        test_cases: Vec<TestCase>,
    ) -> Result<String, AppError> {
        let prompt = self.build_prompt(
            domains,
            domain_attributes,
            requirements,
            requirement_steps,
            test_cases,
        );

        let request = ClaudeRequest {
            model: model.to_string(),
            max_tokens: 8000,
            messages: vec![ClaudeMessage {
                role: "user".to_string(),
                content: prompt,
            }],
        };

        let response = self
            .client
            .post(ANTHROPIC_API_URL)
            .header("x-api-key", &self.api_key)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Failed to call Claude API: {}", e);
                AppError::InternalServer(format!("Failed to call Claude API: {}", e))
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text: String = response.text().await.unwrap_or_default();
            tracing::error!("Claude API error: {} - {}", status, error_text);
            return Err(AppError::InternalServer(format!(
                "Claude API error: {} - {}",
                status, error_text
            )));
        }

        let claude_response: ClaudeResponse = response.json().await.map_err(|e| {
            tracing::error!("Failed to parse Claude API response: {}", e);
            AppError::InternalServer(format!("Failed to parse Claude API response: {}", e))
        })?;

        if let Some(content) = claude_response.content.first() {
            Ok(content.text.clone())
        } else {
            Err(AppError::InternalServer(
                "Claude API returned empty response".to_string(),
            ))
        }
    }

    /// Build a comprehensive prompt for Claude from project data
    fn build_prompt(
        &self,
        domains: Vec<Domain>,
        domain_attributes: Vec<DomainAttribute>,
        requirements: Vec<Requirement>,
        requirement_steps: Vec<RequirementStep>,
        test_cases: Vec<TestCase>,
    ) -> String {
        let mut prompt = String::new();

        // Introduction
        prompt.push_str("You are a software architect tasked with generating a comprehensive software specification based on the following business requirements.\n\n");

        // Domains section
        prompt.push_str("# Business Domains\n\n");
        if domains.is_empty() {
            prompt.push_str("No domains defined.\n\n");
        } else {
            for domain in &domains {
                prompt.push_str(&format!("## {}\n", domain.name));
                if let Some(desc) = &domain.description {
                    prompt.push_str(&format!("{}\n", desc));
                }

                // Find attributes for this domain
                let attrs: Vec<_> = domain_attributes
                    .iter()
                    .filter(|a| a.domain_id == domain.id)
                    .collect();

                if !attrs.is_empty() {
                    prompt.push_str("\n**Attributes:**\n");
                    for attr in attrs {
                        prompt.push_str(&format!(
                            "- `{}` ({}){}{}\n",
                            attr.name,
                            attr.data_type,
                            if attr.is_required { ", required" } else { "" },
                            attr.validation_rules
                                .as_ref()
                                .map(|v| format!(", validation: {}", v))
                                .unwrap_or_default()
                        ));
                    }
                }
                prompt.push_str("\n");
            }
        }

        // Requirements section
        prompt.push_str("# Functional Requirements\n\n");
        if requirements.is_empty() {
            prompt.push_str("No requirements defined.\n\n");
        } else {
            for req in &requirements {
                prompt.push_str(&format!("## {}\n", req.title));
                if let Some(desc) = &req.description {
                    prompt.push_str(&format!("{}\n\n", desc));
                }

                // Find steps for this requirement
                let steps: Vec<_> = requirement_steps
                    .iter()
                    .filter(|s| s.requirement_id == req.id)
                    .collect();

                if !steps.is_empty() {
                    prompt.push_str("```gherkin\n");
                    for step in steps {
                        prompt.push_str(&format!("{} {}\n", step.step_type, step.step_text));
                    }
                    prompt.push_str("```\n\n");
                }

                // Find test cases for this requirement
                let tests: Vec<_> = test_cases
                    .iter()
                    .filter(|t| t.requirement_id == req.id)
                    .collect();

                if !tests.is_empty() {
                    prompt.push_str("**Test Cases:**\n");
                    for test in tests {
                        prompt.push_str(&format!("- {}\n", test.name));
                        if let Some(desc) = &test.description {
                            prompt.push_str(&format!("  {}\n", desc));
                        }
                        if let Some(expected) = &test.expected_outcome {
                            prompt.push_str(&format!("  Expected: {}\n", expected));
                        }
                    }
                    prompt.push_str("\n");
                }
            }
        }

        // Instructions for Claude
        prompt.push_str("# Task\n\n");
        prompt.push_str("Based on the above business domains and functional requirements, please generate a comprehensive software specification that includes:\n\n");
        prompt.push_str("1. **System Overview**: High-level description of the system\n");
        prompt.push_str("2. **Architecture**: Recommended architecture and design patterns\n");
        prompt.push_str("3. **Technical Requirements**: Technology stack, frameworks, and tools\n");
        prompt.push_str("4. **Data Models**: Detailed data models based on the domains\n");
        prompt.push_str("5. **API Specifications**: Recommended API endpoints and their contracts\n");
        prompt.push_str("6. **Business Logic**: Key algorithms and business rules\n");
        prompt.push_str("7. **Security Considerations**: Authentication, authorization, and data protection\n");
        prompt.push_str("8. **Testing Strategy**: Unit, integration, and end-to-end testing approach\n");
        prompt.push_str("9. **Deployment**: Recommended deployment strategy\n");
        prompt.push_str("10. **Implementation Notes**: Key considerations for developers\n\n");
        prompt.push_str("Please provide the specification in well-structured Markdown format with clear sections and subsections.\n");

        prompt
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_build_prompt_with_empty_data() {
        let service = ClaudeService::new("test-key".to_string());
        let prompt = service.build_prompt(vec![], vec![], vec![], vec![], vec![]);

        assert!(prompt.contains("Business Domains"));
        assert!(prompt.contains("Functional Requirements"));
        assert!(prompt.contains("No domains defined"));
        assert!(prompt.contains("No requirements defined"));
    }

    #[test]
    fn test_build_prompt_with_domain() {
        let service = ClaudeService::new("test-key".to_string());
        let domain = Domain {
            id: Uuid::new_v4(),
            project_id: Uuid::new_v4(),
            name: "User".to_string(),
            description: Some("User entity".to_string()),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        let attr = DomainAttribute {
            id: Uuid::new_v4(),
            domain_id: domain.id,
            name: "email".to_string(),
            data_type: "email".to_string(),
            is_required: true,
            default_value: None,
            validation_rules: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        let prompt = service.build_prompt(vec![domain], vec![attr], vec![], vec![], vec![]);

        assert!(prompt.contains("## User"));
        assert!(prompt.contains("User entity"));
        assert!(prompt.contains("email"));
        assert!(prompt.contains("required"));
    }

    #[test]
    fn test_build_prompt_with_requirement() {
        let service = ClaudeService::new("test-key".to_string());
        let req = Requirement {
            id: Uuid::new_v4(),
            project_id: Uuid::new_v4(),
            title: "User Login".to_string(),
            description: Some("User can login".to_string()),
            gherkin_scenario: "Given a user\nWhen they login\nThen they see dashboard".to_string(),
            position_x: Some(0.0),
            position_y: Some(0.0),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        let step = RequirementStep {
            id: Uuid::new_v4(),
            requirement_id: req.id,
            step_type: "Given".to_string(),
            step_order: 0,
            step_text: "a user exists".to_string(),
            domain_references: None,
            created_at: Utc::now(),
        };

        let prompt = service.build_prompt(vec![], vec![], vec![req], vec![step], vec![]);

        assert!(prompt.contains("## User Login"));
        assert!(prompt.contains("User can login"));
        assert!(prompt.contains("```gherkin"));
        assert!(prompt.contains("Given a user exists"));
    }
}
