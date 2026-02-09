use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::dto::test_case_dto::{CreateTestCaseRequest, UpdateTestCaseRequest};
use crate::errors::AppError;
use crate::repositories::test_case_repo;

pub async fn create_test_case(
    State(pool): State<PgPool>,
    Path(requirement_id): Path<Uuid>,
    Json(payload): Json<CreateTestCaseRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let test_case = test_case_repo::create_test_case(
        &pool,
        requirement_id,
        &payload.name,
        payload.description.as_deref(),
        payload.test_data.as_ref(),
        payload.expected_outcome.as_deref(),
    )
    .await?;

    Ok((StatusCode::CREATED, Json(test_case)))
}

pub async fn list_test_cases(
    State(pool): State<PgPool>,
    Path(requirement_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let test_cases = test_case_repo::find_test_cases_by_requirement(&pool, requirement_id).await?;

    Ok(Json(test_cases))
}

pub async fn get_test_case(
    State(pool): State<PgPool>,
    Path(test_case_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let test_case = test_case_repo::find_test_case_by_id(&pool, test_case_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Test case not found".to_string()))?;

    Ok(Json(test_case))
}

pub async fn update_test_case(
    State(pool): State<PgPool>,
    Path(test_case_id): Path<Uuid>,
    Json(payload): Json<UpdateTestCaseRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let test_case = test_case_repo::update_test_case(
        &pool,
        test_case_id,
        payload.name.as_deref(),
        payload.description.as_deref(),
        payload.test_data.as_ref(),
        payload.expected_outcome.as_deref(),
        payload.status.as_deref(),
    )
    .await?;

    Ok(Json(test_case))
}

pub async fn delete_test_case(
    State(pool): State<PgPool>,
    Path(test_case_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    test_case_repo::delete_test_case(&pool, test_case_id).await?;

    Ok(StatusCode::NO_CONTENT)
}
