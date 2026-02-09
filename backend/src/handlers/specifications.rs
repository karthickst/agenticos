use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::dto::specification_dto::GenerateSpecificationRequest;
use crate::errors::AppError;
use crate::repositories::{
    domain_repo, requirement_repo, specification_repo, test_case_repo,
};
use crate::services::claude_service::ClaudeService;

/// Generate a specification for a project (async job)
pub async fn generate_specification(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<GenerateSpecificationRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Create a job record
    let job = specification_repo::create_job(&pool, project_id, &payload.claude_model).await?;

    // Get API key from environment
    let api_key = std::env::var("ANTHROPIC_API_KEY")
        .map_err(|_| AppError::InternalServer("ANTHROPIC_API_KEY not set".to_string()))?;

    // Spawn a background task to generate the specification
    let job_id = job.id;
    let claude_model = payload.claude_model.clone();
    tokio::spawn(async move {
        if let Err(e) = process_specification_generation(
            pool,
            job_id,
            project_id,
            &claude_model,
            api_key,
        )
        .await
        {
            tracing::error!("Failed to generate specification: {}", e);
        }
    });

    Ok((
        StatusCode::ACCEPTED,
        Json(serde_json::json!({
            "job_id": job.id,
            "status": job.status,
        })),
    ))
}

/// Background task to process specification generation
async fn process_specification_generation(
    pool: PgPool,
    job_id: Uuid,
    project_id: Uuid,
    claude_model: &str,
    api_key: String,
) -> Result<(), AppError> {
    // Update job status to processing
    specification_repo::update_job_status(&pool, job_id, "processing", None).await?;

    // Fetch all project data
    let domains = domain_repo::find_domains_by_project(&pool, project_id).await?;
    let mut domain_attributes = Vec::new();
    for domain in &domains {
        let attrs = domain_repo::find_attributes_by_domain(&pool, domain.id).await?;
        domain_attributes.extend(attrs);
    }

    let requirements = requirement_repo::find_requirements_by_project(&pool, project_id).await?;
    let mut requirement_steps = Vec::new();
    for requirement in &requirements {
        let steps = requirement_repo::find_steps_by_requirement(&pool, requirement.id).await?;
        requirement_steps.extend(steps);
    }

    let mut test_cases = Vec::new();
    for requirement in &requirements {
        let cases = test_case_repo::find_test_cases_by_requirement(&pool, requirement.id).await?;
        test_cases.extend(cases);
    }

    // Generate specification using Claude
    let claude_service = ClaudeService::new(api_key);
    let result = claude_service
        .generate_specification(
            claude_model,
            domains,
            domain_attributes,
            requirements,
            requirement_steps,
            test_cases,
        )
        .await;

    match result {
        Ok(specification_text) => {
            // Create the specification record
            let metadata = serde_json::json!({
                "job_id": job_id,
                "model": claude_model,
            });

            match specification_repo::create_specification(
                &pool,
                project_id,
                claude_model,
                &specification_text,
                Some(&metadata),
            )
            .await
            {
                Ok(_) => {
                    // Update job status to completed
                    specification_repo::update_job_status(&pool, job_id, "completed", None)
                        .await?;
                }
                Err(e) => {
                    let error_message = format!("Failed to save specification: {}", e);
                    specification_repo::update_job_status(&pool, job_id, "failed", Some(&error_message))
                        .await?;
                }
            }
        }
        Err(e) => {
            let error_message = format!("Failed to generate specification: {}", e);
            specification_repo::update_job_status(&pool, job_id, "failed", Some(&error_message))
                .await?;
        }
    }

    Ok(())
}

/// List all specifications for a project
pub async fn list_specifications(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let specifications = specification_repo::find_specifications_by_project(&pool, project_id).await?;

    Ok(Json(specifications))
}

/// Get a specific specification by ID
pub async fn get_specification(
    State(pool): State<PgPool>,
    Path(specification_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let specification = specification_repo::find_specification_by_id(&pool, specification_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Specification not found".to_string()))?;

    Ok(Json(specification))
}

/// Get job status
pub async fn get_job_status(
    State(pool): State<PgPool>,
    Path(job_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let job = specification_repo::find_job_by_id(&pool, job_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Job not found".to_string()))?;

    Ok(Json(job))
}
