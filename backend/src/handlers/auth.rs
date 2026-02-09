use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use sqlx::PgPool;
use validator::Validate;

use crate::dto::auth_dto::{AuthResponse, LoginRequest, SignupRequest};
use crate::errors::AppError;
use crate::models::user::UserResponse;
use crate::repositories::user_repo;
use crate::utils::{jwt, password};

pub async fn signup(
    State(pool): State<PgPool>,
    Json(payload): Json<SignupRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Validate input
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Check if user already exists
    if let Some(_) = user_repo::find_user_by_email(&pool, &payload.email).await? {
        return Err(AppError::BadRequest(
            "User with this email already exists".to_string(),
        ));
    }

    // Hash password
    let password_hash = password::hash_password(&payload.password)?;

    // Create user
    let user = user_repo::create_user(&pool, &payload.email, &payload.name, &password_hash).await?;

    // Generate token
    let token = jwt::generate_token(user.id, &user.email)?;

    // Return response
    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            token,
            user: UserResponse::from(user),
        }),
    ))
}

pub async fn login(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Validate input
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Find user
    let user = user_repo::find_user_by_email(&pool, &payload.email)
        .await?
        .ok_or_else(|| AppError::Unauthorized("Invalid credentials".to_string()))?;

    // Verify password
    if !password::verify_password(&payload.password, &user.password_hash)? {
        return Err(AppError::Unauthorized("Invalid credentials".to_string()));
    }

    // Generate token
    let token = jwt::generate_token(user.id, &user.email)?;

    // Return response
    Ok((
        StatusCode::OK,
        Json(AuthResponse {
            token,
            user: UserResponse::from(user),
        }),
    ))
}
