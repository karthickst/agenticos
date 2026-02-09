use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::dto::data_bag_dto::{CreateDataBagRequest, ImportDataRequest, LinkDataBagRequest, UpdateDataBagRequest};
use crate::errors::AppError;
use crate::models::data_bag::DataBagWithItems;
use crate::repositories::data_bag_repo;

// Data Bag handlers
pub async fn create_data_bag(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
    Json(payload): Json<CreateDataBagRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let data_bag = data_bag_repo::create_data_bag(
        &pool,
        project_id,
        &payload.name,
        payload.description.as_deref(),
        payload.data_schema.as_ref(),
    )
    .await?;

    Ok((StatusCode::CREATED, Json(data_bag)))
}

pub async fn list_data_bags(
    State(pool): State<PgPool>,
    Path(project_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let data_bags = data_bag_repo::find_data_bags_by_project(&pool, project_id).await?;

    // Fetch items for each data bag
    let mut data_bags_with_items = Vec::new();
    for data_bag in data_bags {
        let items = data_bag_repo::find_items_by_data_bag(&pool, data_bag.id).await?;
        data_bags_with_items.push(DataBagWithItems { data_bag, items });
    }

    Ok(Json(data_bags_with_items))
}

pub async fn get_data_bag(
    State(pool): State<PgPool>,
    Path(data_bag_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let data_bag = data_bag_repo::find_data_bag_by_id(&pool, data_bag_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Data bag not found".to_string()))?;

    let items = data_bag_repo::find_items_by_data_bag(&pool, data_bag_id).await?;

    Ok(Json(DataBagWithItems { data_bag, items }))
}

pub async fn update_data_bag(
    State(pool): State<PgPool>,
    Path(data_bag_id): Path<Uuid>,
    Json(payload): Json<UpdateDataBagRequest>,
) -> Result<impl IntoResponse, AppError> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let data_bag = data_bag_repo::update_data_bag(
        &pool,
        data_bag_id,
        payload.name.as_deref(),
        payload.description.as_deref(),
        payload.data_schema.as_ref(),
    )
    .await?;

    Ok(Json(data_bag))
}

pub async fn delete_data_bag(
    State(pool): State<PgPool>,
    Path(data_bag_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    data_bag_repo::delete_data_bag(&pool, data_bag_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

// Data Bag Item handlers
pub async fn import_data(
    State(pool): State<PgPool>,
    Path(data_bag_id): Path<Uuid>,
    Json(payload): Json<ImportDataRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Verify data bag exists
    data_bag_repo::find_data_bag_by_id(&pool, data_bag_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Data bag not found".to_string()))?;

    // Create items
    let mut created_items = Vec::new();
    for item_data in payload.items {
        let item = data_bag_repo::create_data_bag_item(&pool, data_bag_id, &item_data).await?;
        created_items.push(item);
    }

    Ok((StatusCode::CREATED, Json(created_items)))
}

pub async fn list_items(
    State(pool): State<PgPool>,
    Path(data_bag_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let items = data_bag_repo::find_items_by_data_bag(&pool, data_bag_id).await?;

    Ok(Json(items))
}

pub async fn delete_item(
    State(pool): State<PgPool>,
    Path(item_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    data_bag_repo::delete_data_bag_item(&pool, item_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

// Link handlers
pub async fn link_data_bag_to_requirement(
    State(pool): State<PgPool>,
    Path(requirement_id): Path<Uuid>,
    Json(payload): Json<LinkDataBagRequest>,
) -> Result<impl IntoResponse, AppError> {
    let data_bag_id = Uuid::parse_str(&payload.data_bag_id)
        .map_err(|_| AppError::BadRequest("Invalid data bag ID".to_string()))?;

    let data_bag_item_id = if let Some(ref item_id_str) = payload.data_bag_item_id {
        Some(
            Uuid::parse_str(item_id_str)
                .map_err(|_| AppError::BadRequest("Invalid data bag item ID".to_string()))?,
        )
    } else {
        None
    };

    let link = data_bag_repo::create_link(&pool, requirement_id, data_bag_id, data_bag_item_id).await?;

    Ok((StatusCode::CREATED, Json(link)))
}

pub async fn list_requirement_links(
    State(pool): State<PgPool>,
    Path(requirement_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let links = data_bag_repo::find_links_by_requirement(&pool, requirement_id).await?;

    Ok(Json(links))
}

pub async fn delete_link(
    State(pool): State<PgPool>,
    Path(link_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    data_bag_repo::delete_link(&pool, link_id).await?;

    Ok(StatusCode::NO_CONTENT)
}
