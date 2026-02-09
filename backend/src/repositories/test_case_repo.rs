use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::test_case::TestCase;

pub async fn create_test_case(
    pool: &PgPool,
    requirement_id: Uuid,
    name: &str,
    description: Option<&str>,
    test_data: Option<&serde_json::Value>,
    expected_outcome: Option<&str>,
) -> Result<TestCase, AppError> {
    let test_case = sqlx::query_as::<_, TestCase>(
        r#"
        INSERT INTO test_cases (requirement_id, name, description, test_data, expected_outcome)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, requirement_id, name, description, test_data, expected_outcome, status, created_at, updated_at
        "#,
    )
    .bind(requirement_id)
    .bind(name)
    .bind(description)
    .bind(test_data)
    .bind(expected_outcome)
    .fetch_one(pool)
    .await?;

    Ok(test_case)
}

pub async fn find_test_cases_by_requirement(
    pool: &PgPool,
    requirement_id: Uuid,
) -> Result<Vec<TestCase>, AppError> {
    let test_cases = sqlx::query_as::<_, TestCase>(
        r#"
        SELECT id, requirement_id, name, description, test_data, expected_outcome, status, created_at, updated_at
        FROM test_cases
        WHERE requirement_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(requirement_id)
    .fetch_all(pool)
    .await?;

    Ok(test_cases)
}

pub async fn find_test_case_by_id(
    pool: &PgPool,
    test_case_id: Uuid,
) -> Result<Option<TestCase>, AppError> {
    let test_case = sqlx::query_as::<_, TestCase>(
        r#"
        SELECT id, requirement_id, name, description, test_data, expected_outcome, status, created_at, updated_at
        FROM test_cases
        WHERE id = $1
        "#,
    )
    .bind(test_case_id)
    .fetch_optional(pool)
    .await?;

    Ok(test_case)
}

pub async fn update_test_case(
    pool: &PgPool,
    test_case_id: Uuid,
    name: Option<&str>,
    description: Option<&str>,
    test_data: Option<&serde_json::Value>,
    expected_outcome: Option<&str>,
    status: Option<&str>,
) -> Result<TestCase, AppError> {
    let test_case = sqlx::query_as::<_, TestCase>(
        r#"
        UPDATE test_cases
        SET name = COALESCE($2, name),
            description = COALESCE($3, description),
            test_data = COALESCE($4, test_data),
            expected_outcome = COALESCE($5, expected_outcome),
            status = COALESCE($6, status),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, requirement_id, name, description, test_data, expected_outcome, status, created_at, updated_at
        "#,
    )
    .bind(test_case_id)
    .bind(name)
    .bind(description)
    .bind(test_data)
    .bind(expected_outcome)
    .bind(status)
    .fetch_one(pool)
    .await?;

    Ok(test_case)
}

pub async fn delete_test_case(pool: &PgPool, test_case_id: Uuid) -> Result<(), AppError> {
    sqlx::query(
        r#"
        DELETE FROM test_cases
        WHERE id = $1
        "#,
    )
    .bind(test_case_id)
    .execute(pool)
    .await?;

    Ok(())
}
