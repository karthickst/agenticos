use axum::{
    extract::{Path, State, Extension},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::dto::project_dto::{CreateProjectRequest, UpdateProjectRequest};
use crate::errors::AppError;
use crate::repositories::project_repo;

pub async fn create_project(
    State(pool): State<PgPool>,
    Extension(user_id): Extension<Uuid>,
    Json(payload): Json<CreateProjectRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let project = project_repo::create_project(
        &pool,
        user_id,
        &payload.name,
        payload.description.as_deref(),
    )
    .await?;

    Ok((StatusCode::CREATED, Json(project)))
}

pub async fn list_projects(
    State(pool): State<PgPool>,
    Extension(user_id): Extension<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let projects = project_repo::find_projects_by_user(&pool, user_id).await?;

    Ok(Json(projects))
}

pub async fn get_project(
    State(pool): State<PgPool>,
    Extension(user_id): Extension<Uuid>,
    Path(project_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let project = project_repo::find_project_by_id(&pool, project_id, user_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Project not found".to_string()))?;

    Ok(Json(project))
}

pub async fn update_project(
    State(pool): State<PgPool>,
    Extension(user_id): Extension<Uuid>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<UpdateProjectRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let project = project_repo::update_project(
        &pool,
        project_id,
        user_id,
        payload.name.as_deref(),
        payload.description.as_deref(),
    )
    .await?;

    Ok(Json(project))
}

pub async fn delete_project(
    State(pool): State<PgPool>,
    Extension(user_id): Extension<Uuid>,
    Path(project_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    project_repo::delete_project(&pool, project_id, user_id).await?;

    Ok(StatusCode::NO_CONTENT)
}
