use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::requirement::{Requirement, RequirementConnection, RequirementStep};

// Requirement operations
pub async fn create_requirement(
    pool: &PgPool,
    project_id: Uuid,
    title: &str,
    description: Option<&str>,
    gherkin_scenario: &str,
    position_x: Option<f64>,
    position_y: Option<f64>,
) -> Result<Requirement, AppError> {
    let requirement = sqlx::query_as::<_, Requirement>(
        r#"
        INSERT INTO requirements (project_id, title, description, gherkin_scenario, position_x, position_y)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, project_id, title, description, gherkin_scenario, position_x, position_y, created_at, updated_at
        "#,
    )
    .bind(project_id)
    .bind(title)
    .bind(description)
    .bind(gherkin_scenario)
    .bind(position_x)
    .bind(position_y)
    .fetch_one(pool)
    .await?;

    Ok(requirement)
}

pub async fn find_requirements_by_project(
    pool: &PgPool,
    project_id: Uuid,
) -> Result<Vec<Requirement>, AppError> {
    let requirements = sqlx::query_as::<_, Requirement>(
        r#"
        SELECT id, project_id, title, description, gherkin_scenario, position_x, position_y, created_at, updated_at
        FROM requirements
        WHERE project_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(project_id)
    .fetch_all(pool)
    .await?;

    Ok(requirements)
}

pub async fn find_requirement_by_id(
    pool: &PgPool,
    requirement_id: Uuid,
) -> Result<Option<Requirement>, AppError> {
    let requirement = sqlx::query_as::<_, Requirement>(
        r#"
        SELECT id, project_id, title, description, gherkin_scenario, position_x, position_y, created_at, updated_at
        FROM requirements
        WHERE id = $1
        "#,
    )
    .bind(requirement_id)
    .fetch_optional(pool)
    .await?;

    Ok(requirement)
}

pub async fn update_requirement(
    pool: &PgPool,
    requirement_id: Uuid,
    title: Option<&str>,
    description: Option<&str>,
    gherkin_scenario: Option<&str>,
    position_x: Option<f64>,
    position_y: Option<f64>,
) -> Result<Requirement, AppError> {
    let requirement = sqlx::query_as::<_, Requirement>(
        r#"
        UPDATE requirements
        SET title = COALESCE($2, title),
            description = COALESCE($3, description),
            gherkin_scenario = COALESCE($4, gherkin_scenario),
            position_x = COALESCE($5, position_x),
            position_y = COALESCE($6, position_y),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, project_id, title, description, gherkin_scenario, position_x, position_y, created_at, updated_at
        "#,
    )
    .bind(requirement_id)
    .bind(title)
    .bind(description)
    .bind(gherkin_scenario)
    .bind(position_x)
    .bind(position_y)
    .fetch_one(pool)
    .await?;

    Ok(requirement)
}

pub async fn delete_requirement(pool: &PgPool, requirement_id: Uuid) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM requirements
        WHERE id = $1
        "#,
    )
    .bind(requirement_id)
    .execute(pool)
    .await?;

    Ok(())
}

// Requirement Step operations
pub async fn create_step(
    pool: &PgPool,
    requirement_id: Uuid,
    step_type: &str,
    step_order: i32,
    step_text: &str,
    domain_references: Option<&serde_json::Value>,
) -> Result<RequirementStep, AppError> {
    let step = sqlx::query_as::<_, RequirementStep>(
        r#"
        INSERT INTO requirement_steps (requirement_id, step_type, step_order, step_text, domain_references)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, requirement_id, step_type, step_order, step_text, domain_references, created_at
        "#,
    )
    .bind(requirement_id)
    .bind(step_type)
    .bind(step_order)
    .bind(step_text)
    .bind(domain_references)
    .fetch_one(pool)
    .await?;

    Ok(step)
}

pub async fn find_steps_by_requirement(
    pool: &PgPool,
    requirement_id: Uuid,
) -> Result<Vec<RequirementStep>, AppError> {
    let steps = sqlx::query_as::<_, RequirementStep>(
        r#"
        SELECT id, requirement_id, step_type, step_order, step_text, domain_references, created_at
        FROM requirement_steps
        WHERE requirement_id = $1
        ORDER BY step_order ASC
        "#,
    )
    .bind(requirement_id)
    .fetch_all(pool)
    .await?;

    Ok(steps)
}

pub async fn delete_steps_by_requirement(
    pool: &PgPool,
    requirement_id: Uuid,
) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM requirement_steps
        WHERE requirement_id = $1
        "#,
    )
    .bind(requirement_id)
    .execute(pool)
    .await?;

    Ok(())
}

// Requirement Connection operations
pub async fn create_connection(
    pool: &PgPool,
    project_id: Uuid,
    source_requirement_id: Uuid,
    target_requirement_id: Uuid,
    connection_type: Option<&str>,
) -> Result<RequirementConnection, AppError> {
    let connection = sqlx::query_as::<_, RequirementConnection>(
        r#"
        INSERT INTO requirement_connections (project_id, source_requirement_id, target_requirement_id, connection_type)
        VALUES ($1, $2, $3, $4)
        RETURNING id, project_id, source_requirement_id, target_requirement_id, connection_type, created_at
        "#,
    )
    .bind(project_id)
    .bind(source_requirement_id)
    .bind(target_requirement_id)
    .bind(connection_type)
    .fetch_one(pool)
    .await?;

    Ok(connection)
}

pub async fn find_connections_by_project(
    pool: &PgPool,
    project_id: Uuid,
) -> Result<Vec<RequirementConnection>, AppError> {
    let connections = sqlx::query_as::<_, RequirementConnection>(
        r#"
        SELECT id, project_id, source_requirement_id, target_requirement_id, connection_type, created_at
        FROM requirement_connections
        WHERE project_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(project_id)
    .fetch_all(pool)
    .await?;

    Ok(connections)
}

pub async fn delete_connection(pool: &PgPool, connection_id: Uuid) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM requirement_connections
        WHERE id = $1
        "#,
    )
    .bind(connection_id)
    .execute(pool)
    .await?;

    Ok(())
}
