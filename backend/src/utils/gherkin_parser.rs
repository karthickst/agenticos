use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedStep {
    pub step_type: String,
    pub step_order: i32,
    pub step_text: String,
    pub domain_references: Vec<String>,
}

pub struct GherkinParser;

impl GherkinParser {
    /// Parse Gherkin text into structured steps
    pub fn parse(gherkin_text: &str) -> Vec<ParsedStep> {
        let mut steps = Vec::new();
        let mut order = 0;

        for line in gherkin_text.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            // Match step keywords
            if let Some(step) = Self::parse_line(trimmed, order) {
                steps.push(step);
                order += 1;
            }
        }

        steps
    }

    fn parse_line(line: &str, order: i32) -> Option<ParsedStep> {
        let keywords = ["Given", "When", "Then", "And", "But"];

        // Convert line to lowercase for case-insensitive comparison
        let line_lower = line.to_lowercase();

        for keyword in &keywords {
            let keyword_lower = keyword.to_lowercase();

            if line_lower.starts_with(&keyword_lower) {
                // Use the original keyword length to extract step text from original line
                let step_text = line[keyword.len()..].trim().to_string();
                let domain_references = Self::extract_domain_references(&step_text);

                return Some(ParsedStep {
                    step_type: keyword.to_lowercase(),
                    step_order: order,
                    step_text,
                    domain_references,
                });
            }
        }

        None
    }

    /// Extract domain references like ${Domain.attribute}
    pub fn extract_domain_references(text: &str) -> Vec<String> {
        let re = Regex::new(r"\$\{([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\}").unwrap();
        let mut references = Vec::new();

        for cap in re.captures_iter(text) {
            if let (Some(domain), Some(attr)) = (cap.get(1), cap.get(2)) {
                references.push(format!("{}.{}", domain.as_str(), attr.as_str()));
            }
        }

        references
    }

    /// Format steps back to Gherkin text
    pub fn format(steps: &[ParsedStep]) -> String {
        steps
            .iter()
            .map(|step| {
                let keyword = match step.step_type.as_str() {
                    "given" => "Given",
                    "when" => "When",
                    "then" => "Then",
                    "and" => "And",
                    "but" => "But",
                    _ => "Given",
                };
                format!("{} {}", keyword, step.step_text)
            })
            .collect::<Vec<_>>()
            .join("\n")
    }

    /// Validate Gherkin syntax
    pub fn validate(gherkin_text: &str) -> Result<(), String> {
        let steps = Self::parse(gherkin_text);

        if steps.is_empty() {
            return Err("No valid Gherkin steps found. Please use Given/When/Then/And/But keywords.".to_string());
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_gherkin() {
        let gherkin = "Given a user exists\nWhen they log in\nThen they see the dashboard";
        let steps = GherkinParser::parse(gherkin);

        assert_eq!(steps.len(), 3);
        assert_eq!(steps[0].step_type, "given");
        assert_eq!(steps[1].step_type, "when");
        assert_eq!(steps[2].step_type, "then");
    }

    #[test]
    fn test_extract_domain_references() {
        let text = "User with email ${User.email} and name ${User.name}";
        let refs = GherkinParser::extract_domain_references(text);

        assert_eq!(refs.len(), 2);
        assert_eq!(refs[0], "User.email");
        assert_eq!(refs[1], "User.name");
    }

    #[test]
    fn test_format() {
        let steps = vec![
            ParsedStep {
                step_type: "given".to_string(),
                step_order: 0,
                step_text: "a user exists".to_string(),
                domain_references: vec![],
            },
            ParsedStep {
                step_type: "when".to_string(),
                step_order: 1,
                step_text: "they log in".to_string(),
                domain_references: vec![],
            },
        ];

        let formatted = GherkinParser::format(&steps);
        assert!(formatted.contains("Given a user exists"));
        assert!(formatted.contains("When they log in"));
    }

    #[test]
    fn test_case_insensitive_parsing() {
        // Test lowercase keywords
        let gherkin_lower = "given a user exists\nwhen they log in\nthen they see dashboard";
        let steps_lower = GherkinParser::parse(gherkin_lower);
        assert_eq!(steps_lower.len(), 3);

        // Test mixed case
        let gherkin_mixed = "GIVEN a user\nWhen they act\ntHen result";
        let steps_mixed = GherkinParser::parse(gherkin_mixed);
        assert_eq!(steps_mixed.len(), 3);

        // Test that validation passes with lowercase
        assert!(GherkinParser::validate(gherkin_lower).is_ok());
        assert!(GherkinParser::validate(gherkin_mixed).is_ok());
    }
}
