use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::fmt;

#[derive(Debug)]
pub enum AppError {
    Database(sqlx::Error),
    NotFound(String),
    Unauthorized(String),
    BadRequest(String),
    InternalServer(String),
    Validation(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Database(e) => write!(f, "Database error: {}", e),
            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            AppError::BadRequest(msg) => write!(f, "Bad request: {}", msg),
            AppError::InternalServer(msg) => write!(f, "Internal server error: {}", msg),
            AppError::Validation(msg) => write!(f, "Validation error: {}", msg),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message, error_details) = match &self {
            AppError::Database(e) => {
                tracing::error!(
                    error = ?e,
                    error_type = "Database",
                    "Database error occurred"
                );
                tracing::error!("Full database error: {:#?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Database error occurred".to_string(),
                    Some(format!("{:?}", e))
                )
            }
            AppError::NotFound(msg) => {
                tracing::warn!(
                    error = %msg,
                    error_type = "NotFound",
                    "Resource not found"
                );
                (StatusCode::NOT_FOUND, msg.clone(), None)
            }
            AppError::Unauthorized(msg) => {
                tracing::warn!(
                    error = %msg,
                    error_type = "Unauthorized",
                    "Unauthorized access attempt"
                );
                (StatusCode::UNAUTHORIZED, msg.clone(), None)
            }
            AppError::BadRequest(msg) => {
                tracing::warn!(
                    error = %msg,
                    error_type = "BadRequest",
                    "Bad request received"
                );
                (StatusCode::BAD_REQUEST, msg.clone(), None)
            }
            AppError::InternalServer(msg) => {
                tracing::error!(
                    error = %msg,
                    error_type = "InternalServer",
                    "Internal server error"
                );
                (StatusCode::INTERNAL_SERVER_ERROR, msg.clone(), None)
            }
            AppError::Validation(msg) => {
                tracing::warn!(
                    error = %msg,
                    error_type = "Validation",
                    "Validation failed"
                );
                (StatusCode::UNPROCESSABLE_ENTITY, msg.clone(), None)
            }
        };

        // Log full error details for debugging
        tracing::debug!(
            status_code = %status,
            error_message = %error_message,
            error_details = ?error_details,
            "Returning error response"
        );

        let body = Json(json!({
            "error": error_message,
        }));

        (status, body).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(e: sqlx::Error) -> Self {
        AppError::Database(e)
    }
}

impl std::error::Error for AppError {}
