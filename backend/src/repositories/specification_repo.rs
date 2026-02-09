use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::specification::{Specification, SpecificationJob};

// Specification operations
pub async fn create_specification(
    pool: &PgPool,
    project_id: Uuid,
    claude_model: &str,
    specification_text: &str,
    metadata: Option<&serde_json::Value>,
) -> Result<Specification, AppError> {
    // Get the next version number
    let version: i32 = sqlx::query_scalar(
        r#"
        SELECT COALESCE(MAX(version), 0) + 1
        FROM specifications
        WHERE project_id = $1
        "#,
    )
    .bind(project_id)
    .fetch_one(pool)
    .await?;

    let specification = sqlx::query_as::<_, Specification>(
        r#"
        INSERT INTO specifications (project_id, claude_model, specification_text, metadata, version)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, project_id, claude_model, specification_text, metadata, version, created_at
        "#,
    )
    .bind(project_id)
    .bind(claude_model)
    .bind(specification_text)
    .bind(metadata)
    .bind(version)
    .fetch_one(pool)
    .await?;

    Ok(specification)
}

pub async fn find_specifications_by_project(
    pool: &PgPool,
    project_id: Uuid,
) -> Result<Vec<Specification>, AppError> {
    let specifications = sqlx::query_as::<_, Specification>(
        r#"
        SELECT id, project_id, claude_model, specification_text, metadata, version, created_at
        FROM specifications
        WHERE project_id = $1
        ORDER BY version DESC
        "#,
    )
    .bind(project_id)
    .fetch_all(pool)
    .await?;

    Ok(specifications)
}

pub async fn find_specification_by_id(
    pool: &PgPool,
    specification_id: Uuid,
) -> Result<Option<Specification>, AppError> {
    let specification = sqlx::query_as::<_, Specification>(
        r#"
        SELECT id, project_id, claude_model, specification_text, metadata, version, created_at
        FROM specifications
        WHERE id = $1
        "#,
    )
    .bind(specification_id)
    .fetch_optional(pool)
    .await?;

    Ok(specification)
}

// Job operations
pub async fn create_job(
    pool: &PgPool,
    project_id: Uuid,
    claude_model: &str,
) -> Result<SpecificationJob, AppError> {
    let job = sqlx::query_as::<_, SpecificationJob>(
        r#"
        INSERT INTO specification_jobs (project_id, claude_model)
        VALUES ($1, $2)
        RETURNING id, project_id, status, claude_model, error_message, created_at, completed_at
        "#,
    )
    .bind(project_id)
    .bind(claude_model)
    .fetch_one(pool)
    .await?;

    Ok(job)
}

pub async fn update_job_status(
    pool: &PgPool,
    job_id: Uuid,
    status: &str,
    error_message: Option<&str>,
) -> Result<(), AppError> {
    sqlx::query(
        r#"
        UPDATE specification_jobs
        SET status = $2,
            error_message = $3,
            completed_at = CASE WHEN $2 IN ('completed', 'failed') THEN NOW() ELSE completed_at END
        WHERE id = $1
        "#,
    )
    .bind(job_id)
    .bind(status)
    .bind(error_message)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn find_job_by_id(
    pool: &PgPool,
    job_id: Uuid,
) -> Result<Option<SpecificationJob>, AppError> {
    let job = sqlx::query_as::<_, SpecificationJob>(
        r#"
        SELECT id, project_id, status, claude_model, error_message, created_at, completed_at
        FROM specification_jobs
        WHERE id = $1
        "#,
    )
    .bind(job_id)
    .fetch_optional(pool)
    .await?;

    Ok(job)
}
