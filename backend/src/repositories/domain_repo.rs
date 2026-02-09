use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::domain::{Domain, DomainAttribute};

// Domain operations
pub async fn create_domain(
    pool: &PgPool,
    project_id: Uuid,
    name: &str,
    description: Option<&str>,
) -> Result<Domain, AppError> {
    let domain = sqlx::query_as::<_, Domain>(
        r#"
        INSERT INTO domains (project_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING id, project_id, name, description, created_at, updated_at
        "#,
    )
    .bind(project_id)
    .bind(name)
    .bind(description)
    .fetch_one(pool)
    .await?;

    Ok(domain)
}

pub async fn find_domains_by_project(
    pool: &PgPool,
    project_id: Uuid,
) -> Result<Vec<Domain>, AppError> {
    let domains = sqlx::query_as::<_, Domain>(
        r#"
        SELECT id, project_id, name, description, created_at, updated_at
        FROM domains
        WHERE project_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(project_id)
    .fetch_all(pool)
    .await?;

    Ok(domains)
}

pub async fn find_domain_by_id(
    pool: &PgPool,
    domain_id: Uuid,
) -> Result<Option<Domain>, AppError> {
    let domain = sqlx::query_as::<_, Domain>(
        r#"
        SELECT id, project_id, name, description, created_at, updated_at
        FROM domains
        WHERE id = $1
        "#,
    )
    .bind(domain_id)
    .fetch_optional(pool)
    .await?;

    Ok(domain)
}

pub async fn update_domain(
    pool: &PgPool,
    domain_id: Uuid,
    name: Option<&str>,
    description: Option<&str>,
) -> Result<Domain, AppError> {
    let domain = sqlx::query_as::<_, Domain>(
        r#"
        UPDATE domains
        SET name = COALESCE($2, name),
            description = COALESCE($3, description),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, project_id, name, description, created_at, updated_at
        "#,
    )
    .bind(domain_id)
    .bind(name)
    .bind(description)
    .fetch_one(pool)
    .await?;

    Ok(domain)
}

pub async fn delete_domain(pool: &PgPool, domain_id: Uuid) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM domains
        WHERE id = $1
        "#,
    )
    .bind(domain_id)
    .execute(pool)
    .await?;

    Ok(())
}

// Domain Attribute operations
pub async fn create_attribute(
    pool: &PgPool,
    domain_id: Uuid,
    name: &str,
    data_type: &str,
    is_required: bool,
    default_value: Option<&str>,
    validation_rules: Option<&serde_json::Value>,
) -> Result<DomainAttribute, AppError> {
    let attribute = sqlx::query_as::<_, DomainAttribute>(
        r#"
        INSERT INTO domain_attributes (domain_id, name, data_type, is_required, default_value, validation_rules)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, domain_id, name, data_type, is_required, default_value, validation_rules, created_at, updated_at
        "#,
    )
    .bind(domain_id)
    .bind(name)
    .bind(data_type)
    .bind(is_required)
    .bind(default_value)
    .bind(validation_rules)
    .fetch_one(pool)
    .await?;

    Ok(attribute)
}

pub async fn find_attributes_by_domain(
    pool: &PgPool,
    domain_id: Uuid,
) -> Result<Vec<DomainAttribute>, AppError> {
    let attributes = sqlx::query_as::<_, DomainAttribute>(
        r#"
        SELECT id, domain_id, name, data_type, is_required, default_value, validation_rules, created_at, updated_at
        FROM domain_attributes
        WHERE domain_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(domain_id)
    .fetch_all(pool)
    .await?;

    Ok(attributes)
}

pub async fn find_attribute_by_id(
    pool: &PgPool,
    attribute_id: Uuid,
) -> Result<Option<DomainAttribute>, AppError> {
    let attribute = sqlx::query_as::<_, DomainAttribute>(
        r#"
        SELECT id, domain_id, name, data_type, is_required, default_value, validation_rules, created_at, updated_at
        FROM domain_attributes
        WHERE id = $1
        "#,
    )
    .bind(attribute_id)
    .fetch_optional(pool)
    .await?;

    Ok(attribute)
}

pub async fn update_attribute(
    pool: &PgPool,
    attribute_id: Uuid,
    name: Option<&str>,
    data_type: Option<&str>,
    is_required: Option<bool>,
    default_value: Option<&str>,
    validation_rules: Option<&serde_json::Value>,
) -> Result<DomainAttribute, AppError> {
    let attribute = sqlx::query_as::<_, DomainAttribute>(
        r#"
        UPDATE domain_attributes
        SET name = COALESCE($2, name),
            data_type = COALESCE($3, data_type),
            is_required = COALESCE($4, is_required),
            default_value = COALESCE($5, default_value),
            validation_rules = COALESCE($6, validation_rules),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, domain_id, name, data_type, is_required, default_value, validation_rules, created_at, updated_at
        "#,
    )
    .bind(attribute_id)
    .bind(name)
    .bind(data_type)
    .bind(is_required)
    .bind(default_value)
    .bind(validation_rules)
    .fetch_one(pool)
    .await?;

    Ok(attribute)
}

pub async fn delete_attribute(pool: &PgPool, attribute_id: Uuid) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM domain_attributes
        WHERE id = $1
        "#,
    )
    .bind(attribute_id)
    .execute(pool)
    .await?;

    Ok(())
}
