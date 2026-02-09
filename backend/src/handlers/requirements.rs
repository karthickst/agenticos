use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::dto::requirement_dto::{
    CreateConnectionRequest, CreateRequirementRequest, CreateStepRequest, UpdateRequirementRequest,
};
use crate::errors::AppError;
use crate::models::requirement::RequirementWithSteps;
use crate::repositories::requirement_repo;
use crate::utils::gherkin_parser::GherkinParser;

// Requirement handlers
pub async fn create_requirement(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateRequirementRequest>,
) -> Result<impl IntoResponse, AppError> {
    tracing::info!(
        project_id = %project_id,
        title = %payload.title,
        "Creating new requirement"
    );
    tracing::debug!(
        payload = ?payload,
        "Requirement payload received"
    );

    payload
        .validate()
        .map_err(|e| {
            tracing::error!(
                error = %e,
                payload = ?payload,
                "Validation failed for requirement"
            );
            AppError::Validation(e.to_string())
        })?;

    tracing::debug!("Validating Gherkin syntax");
    // Validate Gherkin syntax
    GherkinParser::validate(&payload.gherkin_scenario)
        .map_err(|e| {
            tracing::error!(
                error = %e,
                gherkin = %payload.gherkin_scenario,
                "Gherkin validation failed"
            );
            AppError::Validation(format!("Invalid Gherkin: {}", e))
        })?;

    tracing::debug!("Creating requirement in database");
    // Create requirement
    let requirement = requirement_repo::create_requirement(
        &pool,
        project_id,
        &payload.title,
        payload.description.as_deref(),
        &payload.gherkin_scenario,
        payload.position_x,
        payload.position_y,
    )
    .await
    .map_err(|e| {
        tracing::error!(
            error = ?e,
            project_id = %project_id,
            title = %payload.title,
            "Failed to create requirement in database"
        );
        e
    })?;

    tracing::info!(
        requirement_id = %requirement.id,
        "Requirement created successfully"
    );

    // Parse Gherkin and create steps
    tracing::debug!("Parsing Gherkin scenario into steps");
    let parsed_steps = GherkinParser::parse(&payload.gherkin_scenario);
    tracing::debug!(
        step_count = parsed_steps.len(),
        "Parsed {} steps from Gherkin",
        parsed_steps.len()
    );

    for (idx, step) in parsed_steps.iter().enumerate() {
        tracing::debug!(
            step_index = idx,
            step_type = %step.step_type,
            step_text = %step.step_text,
            "Creating step"
        );

        let domain_refs = if step.domain_references.is_empty() {
            None
        } else {
            Some(serde_json::to_value(&step.domain_references).unwrap())
        };

        requirement_repo::create_step(
            &pool,
            requirement.id,
            &step.step_type,
            step.step_order,
            &step.step_text,
            domain_refs.as_ref(),
        )
        .await
        .map_err(|e| {
            tracing::error!(
                error = ?e,
                requirement_id = %requirement.id,
                step_index = idx,
                "Failed to create step"
            );
            e
        })?;
    }

    tracing::info!(
        requirement_id = %requirement.id,
        step_count = parsed_steps.len(),
        "Successfully created requirement with all steps"
    );

    Ok((StatusCode::CREATED, Json(requirement)))
}

pub async fn list_requirements(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let requirements = requirement_repo::find_requirements_by_project(&pool, project_id).await?;

    // Fetch steps for each requirement
    let mut requirements_with_steps = Vec::new();
    for requirement in requirements {
        let steps = requirement_repo::find_steps_by_requirement(&pool, requirement.id).await?;
        requirements_with_steps.push(RequirementWithSteps { requirement, steps });
    }

    Ok(Json(requirements_with_steps))
}

pub async fn get_requirement(
    State(pool): State<PgPool>,
    Path(requirement_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let requirement = requirement_repo::find_requirement_by_id(&pool, requirement_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Requirement not found".to_string()))?;

    let steps = requirement_repo::find_steps_by_requirement(&pool, requirement_id).await?;

    Ok(Json(RequirementWithSteps { requirement, steps }))
}

pub async fn update_requirement(
    State(pool): State<PgPool>,
    Path(requirement_id): Path<Uuid>,
    Json(payload): Json<UpdateRequirementRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Validate Gherkin if provided
    if let Some(ref gherkin) = payload.gherkin_scenario {
        GherkinParser::validate(gherkin)
            .map_err(|e| AppError::Validation(format!("Invalid Gherkin: {}", e)))?;
    }

    // Update requirement
    let requirement = requirement_repo::update_requirement(
        &pool,
        requirement_id,
        payload.title.as_deref(),
        payload.description.as_deref(),
        payload.gherkin_scenario.as_deref(),
        payload.position_x,
        payload.position_y,
    )
    .await?;

    // If Gherkin was updated, recreate steps
    if let Some(gherkin) = payload.gherkin_scenario {
        // Delete existing steps
        requirement_repo::delete_steps_by_requirement(&pool, requirement_id).await?;

        // Parse and create new steps
        let parsed_steps = GherkinParser::parse(&gherkin);
        for step in parsed_steps {
            let domain_refs = if step.domain_references.is_empty() {
                None
            } else {
                Some(serde_json::to_value(&step.domain_references).unwrap())
            };

            requirement_repo::create_step(
                &pool,
                requirement_id,
                &step.step_type,
                step.step_order,
                &step.step_text,
                domain_refs.as_ref(),
            )
            .await?;
        }
    }

    Ok(Json(requirement))
}

pub async fn delete_requirement(
    State(pool): State<PgPool>,
    Path(requirement_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    requirement_repo::delete_requirement(&pool, requirement_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

// Connection handlers
pub async fn create_connection(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateConnectionRequest>,
) -> Result<impl IntoResponse, AppError> {
    let source_id = Uuid::parse_str(&payload.source_requirement_id)
        .map_err(|_| AppError::BadRequest("Invalid source requirement ID".to_string()))?;
    let target_id = Uuid::parse_str(&payload.target_requirement_id)
        .map_err(|_| AppError::BadRequest("Invalid target requirement ID".to_string()))?;

    let connection = requirement_repo::create_connection(
        &pool,
        project_id,
        source_id,
        target_id,
        payload.connection_type.as_deref(),
    )
    .await?;

    Ok((StatusCode::CREATED, Json(connection)))
}

pub async fn list_connections(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let connections = requirement_repo::find_connections_by_project(&pool, project_id).await?;

    Ok(Json(connections))
}

pub async fn delete_connection(
    State(pool): State<PgPool>,
    Path(connection_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    requirement_repo::delete_connection(&pool, connection_id).await?;

    Ok(StatusCode::NO_CONTENT)
}
