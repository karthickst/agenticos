use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::dto::domain_dto::{
    CreateAttributeRequest, CreateDomainRequest, UpdateAttributeRequest, UpdateDomainRequest,
};
use crate::errors::AppError;
use crate::models::domain::DomainWithAttributes;
use crate::repositories::domain_repo;

// Domain handlers
pub async fn create_domain(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateDomainRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let domain = domain_repo::create_domain(
        &pool,
        project_id,
        &payload.name,
        payload.description.as_deref(),
    )
    .await?;

    Ok((StatusCode::CREATED, Json(domain)))
}

pub async fn list_domains(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let domains = domain_repo::find_domains_by_project(&pool, project_id).await?;

    // Fetch attributes for each domain
    let mut domains_with_attrs = Vec::new();
    for domain in domains {
        let attributes = domain_repo::find_attributes_by_domain(&pool, domain.id).await?;
        domains_with_attrs.push(DomainWithAttributes { domain, attributes });
    }

    Ok(Json(domains_with_attrs))
}

pub async fn get_domain(
    State(pool): State<PgPool>,
    Path(domain_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let domain = domain_repo::find_domain_by_id(&pool, domain_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Domain not found".to_string()))?;

    let attributes = domain_repo::find_attributes_by_domain(&pool, domain_id).await?;

    Ok(Json(DomainWithAttributes { domain, attributes }))
}

pub async fn update_domain(
    State(pool): State<PgPool>,
    Path(domain_id): Path<Uuid>,
    Json(payload): Json<UpdateDomainRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let domain = domain_repo::update_domain(
        &pool,
        domain_id,
        payload.name.as_deref(),
        payload.description.as_deref(),
    )
    .await?;

    Ok(Json(domain))
}

pub async fn delete_domain(
    State(pool): State<PgPool>,
    Path(domain_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    domain_repo::delete_domain(&pool, domain_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

// Attribute handlers
pub async fn create_attribute(
    State(pool): State<PgPool>,
    Path(domain_id): Path<Uuid>,
    Json(payload): Json<CreateAttributeRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let attribute = domain_repo::create_attribute(
        &pool,
        domain_id,
        &payload.name,
        &payload.data_type,
        payload.is_required.unwrap_or(false),
        payload.default_value.as_deref(),
        payload.validation_rules.as_ref(),
    )
    .await?;

    Ok((StatusCode::CREATED, Json(attribute)))
}

pub async fn list_attributes(
    State(pool): State<PgPool>,
    Path(domain_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let attributes = domain_repo::find_attributes_by_domain(&pool, domain_id).await?;

    Ok(Json(attributes))
}

pub async fn get_attribute(
    State(pool): State<PgPool>,
    Path(attribute_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let attribute = domain_repo::find_attribute_by_id(&pool, attribute_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Attribute not found".to_string()))?;

    Ok(Json(attribute))
}

pub async fn update_attribute(
    State(pool): State<PgPool>,
    Path(attribute_id): Path<Uuid>,
    Json(payload): Json<UpdateAttributeRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let attribute = domain_repo::update_attribute(
        &pool,
        attribute_id,
        payload.name.as_deref(),
        payload.data_type.as_deref(),
        payload.is_required,
        payload.default_value.as_deref(),
        payload.validation_rules.as_ref(),
    )
    .await?;

    Ok(Json(attribute))
}

pub async fn delete_attribute(
    State(pool): State<PgPool>,
    Path(attribute_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    domain_repo::delete_attribute(&pool, attribute_id).await?;

    Ok(StatusCode::NO_CONTENT)
}
