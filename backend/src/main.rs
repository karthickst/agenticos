mod config;
mod dto;
mod errors;
mod handlers;
mod middleware;
mod models;
mod repositories;
mod routes;
mod services;
mod utils;

use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::{TraceLayer, DefaultMakeSpan, DefaultOnResponse};
use tower_http::LatencyUnit;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, fmt, EnvFilter};
use tracing_appender::rolling::{RollingFileAppender, Rotation};
use tracing::Level;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenvy::dotenv().ok();

    // Create logs directory if it doesn't exist
    std::fs::create_dir_all("logs").expect("Failed to create logs directory");

    // Initialize tracing with file logging
    let file_appender = RollingFileAppender::new(
        Rotation::DAILY,
        "logs",
        "goagenticos.log",
    );

    let (non_blocking_file, _guard) = tracing_appender::non_blocking(file_appender);

    // More verbose logging - use RUST_LOG env var or default to debug
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| {
            "debug,sqlx=info,hyper=info,tokio=info,reqwest=debug".into()
        });

    tracing_subscriber::registry()
        .with(env_filter)
        .with(
            fmt::layer()
                .with_writer(std::io::stdout)
                .with_ansi(true)
                .with_target(true)
                .with_thread_ids(true)
                .with_line_number(true)
                .with_file(true)
                .pretty()
        )
        .with(
            fmt::layer()
                .with_writer(non_blocking_file)
                .with_ansi(false)
                .with_target(true)
                .with_thread_ids(true)
                .with_line_number(true)
                .with_file(true)
        )
        .init();

    tracing::info!("==================================================");
    tracing::info!("Starting Goagenticos Backend Application");
    tracing::info!("==================================================");

    // Get database URL from environment
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    // Create database connection pool
    tracing::info!("Connecting to database...");
    let pool = config::database::create_pool(&database_url).await?;
    tracing::info!("Database connection established");

    // Create CORS layer
    tracing::debug!("Configuring CORS layer");

    // Check if ALLOWED_ORIGINS is set for production
    if let Some(origins) = std::env::var("ALLOWED_ORIGINS").ok() {
        tracing::info!("ALLOWED_ORIGINS configured: {}", origins);
        tracing::info!("Note: Currently allowing all origins. Configure specific origins in production for security.");
    } else {
        tracing::warn!("ALLOWED_ORIGINS not set - allowing all origins (development mode)");
        tracing::warn!("For production, set ALLOWED_ORIGINS environment variable");
    }

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Create trace layer for HTTP requests
    let trace_layer = TraceLayer::new_for_http()
        .make_span_with(DefaultMakeSpan::new()
            .level(Level::INFO)
            .include_headers(true))
        .on_response(DefaultOnResponse::new()
            .level(Level::INFO)
            .latency_unit(LatencyUnit::Millis)
            .include_headers(true));

    // Create router
    tracing::debug!("Creating application router");
    let app = routes::create_router(pool)
        .layer(trace_layer)
        .layer(cors);

    tracing::info!("Application router configured successfully");

    // Get port from environment or use default
    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3001);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("==================================================");
    tracing::info!("Server listening on {}", addr);
    tracing::info!("Log file: logs/goagenticos.log");
    tracing::info!("Tail logs: tail -f logs/goagenticos.log");
    tracing::info!("==================================================");

    // Start server
    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("TCP listener bound successfully");

    match axum::serve(listener, app).await {
        Ok(_) => {
            tracing::info!("Server shut down gracefully");
            Ok(())
        }
        Err(e) => {
            tracing::error!("Server error: {:?}", e);
            Err(e.into())
        }
    }
}
