use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::project::Project;

pub async fn create_project(
    pool: &PgPool,
    user_id: Uuid,
    name: &str,
    description: Option<&str>,
) -> Result<Project, AppError> {
    let project = sqlx::query_as::<_, Project>(
        r#"
        INSERT INTO projects (user_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, name, description, created_at, updated_at
        "#,
    )
    .bind(user_id)
    .bind(name)
    .bind(description)
    .fetch_one(pool)
    .await?;

    Ok(project)
}

pub async fn find_projects_by_user(
    pool: &PgPool,
    user_id: Uuid,
) -> Result<Vec<Project>, AppError> {
    let projects = sqlx::query_as::<_, Project>(
        r#"
        SELECT id, user_id, name, description, created_at, updated_at
        FROM projects
        WHERE user_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    Ok(projects)
}

pub async fn find_project_by_id(
    pool: &PgPool,
    project_id: Uuid,
    user_id: Uuid,
) -> Result<Option<Project>, AppError> {
    let project = sqlx::query_as::<_, Project>(
        r#"
        SELECT id, user_id, name, description, created_at, updated_at
        FROM projects
        WHERE id = $1 AND user_id = $2
        "#,
    )
    .bind(project_id)
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    Ok(project)
}

pub async fn update_project(
    pool: &PgPool,
    project_id: Uuid,
    user_id: Uuid,
    name: Option<&str>,
    description: Option<&str>,
) -> Result<Project, AppError> {
    let project = sqlx::query_as::<_, Project>(
        r#"
        UPDATE projects
        SET name = COALESCE($3, name),
            description = COALESCE($4, description),
            updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING id, user_id, name, description, created_at, updated_at
        "#,
    )
    .bind(project_id)
    .bind(user_id)
    .bind(name)
    .bind(description)
    .fetch_one(pool)
    .await?;

    Ok(project)
}

pub async fn delete_project(
    pool: &PgPool,
    project_id: Uuid,
    user_id: Uuid,
) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM projects
        WHERE id = $1 AND user_id = $2
        "#,
    )
    .bind(project_id)
    .bind(user_id)
    .execute(pool)
    .await?;

    Ok(())
}
