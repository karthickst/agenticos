use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::data_bag::{DataBag, DataBagItem, RequirementDataBagLink};

// Data Bag operations
pub async fn create_data_bag(
    pool: &PgPool,
    project_id: Uuid,
    name: &str,
    description: Option<&str>,
    data_schema: Option<&serde_json::Value>,
) -> Result<DataBag, AppError> {
    let data_bag = sqlx::query_as::<_, DataBag>(
        r#"
        INSERT INTO data_bags (project_id, name, description, data_schema)
        VALUES ($1, $2, $3, $4)
        RETURNING id, project_id, name, description, data_schema, created_at, updated_at
        "#,
    )
    .bind(project_id)
    .bind(name)
    .bind(description)
    .bind(data_schema)
    .fetch_one(pool)
    .await?;

    Ok(data_bag)
}

pub async fn find_data_bags_by_project(
    pool: &PgPool,
    project_id: Uuid,
) -> Result<Vec<DataBag>, AppError> {
    let data_bags = sqlx::query_as::<_, DataBag>(
        r#"
        SELECT id, project_id, name, description, data_schema, created_at, updated_at
        FROM data_bags
        WHERE project_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(project_id)
    .fetch_all(pool)
    .await?;

    Ok(data_bags)
}

pub async fn find_data_bag_by_id(
    pool: &PgPool,
    data_bag_id: Uuid,
) -> Result<Option<DataBag>, AppError> {
    let data_bag = sqlx::query_as::<_, DataBag>(
        r#"
        SELECT id, project_id, name, description, data_schema, created_at, updated_at
        FROM data_bags
        WHERE id = $1
        "#,
    )
    .bind(data_bag_id)
    .fetch_optional(pool)
    .await?;

    Ok(data_bag)
}

pub async fn update_data_bag(
    pool: &PgPool,
    data_bag_id: Uuid,
    name: Option<&str>,
    description: Option<&str>,
    data_schema: Option<&serde_json::Value>,
) -> Result<DataBag, AppError> {
    let data_bag = sqlx::query_as::<_, DataBag>(
        r#"
        UPDATE data_bags
        SET name = COALESCE($2, name),
            description = COALESCE($3, description),
            data_schema = COALESCE($4, data_schema),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, project_id, name, description, data_schema, created_at, updated_at
        "#,
    )
    .bind(data_bag_id)
    .bind(name)
    .bind(description)
    .bind(data_schema)
    .fetch_one(pool)
    .await?;

    Ok(data_bag)
}

pub async fn delete_data_bag(pool: &PgPool, data_bag_id: Uuid) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM data_bags
        WHERE id = $1
        "#,
    )
    .bind(data_bag_id)
    .execute(pool)
    .await?;

    Ok(())
}

// Data Bag Item operations
pub async fn create_data_bag_item(
    pool: &PgPool,
    data_bag_id: Uuid,
    data: &serde_json::Value,
) -> Result<DataBagItem, AppError> {
    let item = sqlx::query_as::<_, DataBagItem>(
        r#"
        INSERT INTO data_bag_items (data_bag_id, data)
        VALUES ($1, $2)
        RETURNING id, data_bag_id, data, created_at
        "#,
    )
    .bind(data_bag_id)
    .bind(data)
    .fetch_one(pool)
    .await?;

    Ok(item)
}

pub async fn find_items_by_data_bag(
    pool: &PgPool,
    data_bag_id: Uuid,
) -> Result<Vec<DataBagItem>, AppError> {
    let items = sqlx::query_as::<_, DataBagItem>(
        r#"
        SELECT id, data_bag_id, data, created_at
        FROM data_bag_items
        WHERE data_bag_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(data_bag_id)
    .fetch_all(pool)
    .await?;

    Ok(items)
}

pub async fn delete_data_bag_item(pool: &PgPool, item_id: Uuid) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM data_bag_items
        WHERE id = $1
        "#,
    )
    .bind(item_id)
    .execute(pool)
    .await?;

    Ok(())
}

// Requirement Data Bag Link operations
pub async fn create_link(
    pool: &PgPool,
    requirement_id: Uuid,
    data_bag_id: Uuid,
    data_bag_item_id: Option<Uuid>,
) -> Result<RequirementDataBagLink, AppError> {
    let link = sqlx::query_as::<_, RequirementDataBagLink>(
        r#"
        INSERT INTO requirement_data_bag_links (requirement_id, data_bag_id, data_bag_item_id)
        VALUES ($1, $2, $3)
        RETURNING id, requirement_id, data_bag_id, data_bag_item_id, created_at
        "#,
    )
    .bind(requirement_id)
    .bind(data_bag_id)
    .bind(data_bag_item_id)
    .fetch_one(pool)
    .await?;

    Ok(link)
}

pub async fn find_links_by_requirement(
    pool: &PgPool,
    requirement_id: Uuid,
) -> Result<Vec<RequirementDataBagLink>, AppError> {
    let links = sqlx::query_as::<_, RequirementDataBagLink>(
        r#"
        SELECT id, requirement_id, data_bag_id, data_bag_item_id, created_at
        FROM requirement_data_bag_links
        WHERE requirement_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(requirement_id)
    .fetch_all(pool)
    .await?;

    Ok(links)
}

pub async fn delete_link(pool: &PgPool, link_id: Uuid) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM requirement_data_bag_links
        WHERE id = $1
        "#,
    )
    .bind(link_id)
    .execute(pool)
    .await?;

    Ok(())
}
