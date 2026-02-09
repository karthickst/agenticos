use axum::{
    middleware,
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;

use crate::handlers;
use crate::middleware::auth::auth_middleware;

pub fn create_router(pool: PgPool) -> Router {
    // Public routes
    let public_routes = Router::new()
        .route("/api/v1/health", get(handlers::health::health_check))
        .route("/api/v1/auth/signup", post(handlers::auth::signup))
        .route("/api/v1/auth/login", post(handlers::auth::login));

    // Protected routes (require authentication)
    let protected_routes = Router::new()
        // Projects
        .route("/api/v1/projects", get(handlers::projects::list_projects))
        .route("/api/v1/projects", post(handlers::projects::create_project))
        .route(
            "/api/v1/projects/:id",
            get(handlers::projects::get_project),
        )
        .route(
            "/api/v1/projects/:id",
            put(handlers::projects::update_project),
        )
        .route(
            "/api/v1/projects/:id",
            delete(handlers::projects::delete_project),
        )
        // Domains
        .route(
            "/api/v1/projects/:project_id/domains",
            get(handlers::domains::list_domains),
        )
        .route(
            "/api/v1/projects/:project_id/domains",
            post(handlers::domains::create_domain),
        )
        .route(
            "/api/v1/domains/:id",
            get(handlers::domains::get_domain),
        )
        .route(
            "/api/v1/domains/:id",
            put(handlers::domains::update_domain),
        )
        .route(
            "/api/v1/domains/:id",
            delete(handlers::domains::delete_domain),
        )
        // Domain Attributes
        .route(
            "/api/v1/domains/:domain_id/attributes",
            get(handlers::domains::list_attributes),
        )
        .route(
            "/api/v1/domains/:domain_id/attributes",
            post(handlers::domains::create_attribute),
        )
        .route(
            "/api/v1/attributes/:id",
            get(handlers::domains::get_attribute),
        )
        .route(
            "/api/v1/attributes/:id",
            put(handlers::domains::update_attribute),
        )
        .route(
            "/api/v1/attributes/:id",
            delete(handlers::domains::delete_attribute),
        )
        // Requirements
        .route(
            "/api/v1/projects/:project_id/requirements",
            get(handlers::requirements::list_requirements),
        )
        .route(
            "/api/v1/projects/:project_id/requirements",
            post(handlers::requirements::create_requirement),
        )
        .route(
            "/api/v1/requirements/:id",
            get(handlers::requirements::get_requirement),
        )
        .route(
            "/api/v1/requirements/:id",
            put(handlers::requirements::update_requirement),
        )
        .route(
            "/api/v1/requirements/:id",
            delete(handlers::requirements::delete_requirement),
        )
        // Requirement Connections
        .route(
            "/api/v1/projects/:project_id/connections",
            get(handlers::requirements::list_connections),
        )
        .route(
            "/api/v1/projects/:project_id/connections",
            post(handlers::requirements::create_connection),
        )
        .route(
            "/api/v1/connections/:id",
            delete(handlers::requirements::delete_connection),
        )
        // Data Bags
        .route(
            "/api/v1/projects/:project_id/data-bags",
            get(handlers::data_bags::list_data_bags),
        )
        .route(
            "/api/v1/projects/:project_id/data-bags",
            post(handlers::data_bags::create_data_bag),
        )
        .route(
            "/api/v1/data-bags/:id",
            get(handlers::data_bags::get_data_bag),
        )
        .route(
            "/api/v1/data-bags/:id",
            put(handlers::data_bags::update_data_bag),
        )
        .route(
            "/api/v1/data-bags/:id",
            delete(handlers::data_bags::delete_data_bag),
        )
        // Data Bag Items
        .route(
            "/api/v1/data-bags/:data_bag_id/items",
            post(handlers::data_bags::import_data),
        )
        .route(
            "/api/v1/data-bags/:data_bag_id/items",
            get(handlers::data_bags::list_items),
        )
        .route(
            "/api/v1/data-bag-items/:id",
            delete(handlers::data_bags::delete_item),
        )
        // Requirement Data Bag Links
        .route(
            "/api/v1/requirements/:requirement_id/data-bags",
            post(handlers::data_bags::link_data_bag_to_requirement),
        )
        .route(
            "/api/v1/requirements/:requirement_id/data-bags",
            get(handlers::data_bags::list_requirement_links),
        )
        .route(
            "/api/v1/requirement-data-bag-links/:id",
            delete(handlers::data_bags::delete_link),
        )
        // Test Cases
        .route(
            "/api/v1/requirements/:requirement_id/test-cases",
            get(handlers::test_cases::list_test_cases),
        )
        .route(
            "/api/v1/requirements/:requirement_id/test-cases",
            post(handlers::test_cases::create_test_case),
        )
        .route(
            "/api/v1/test-cases/:id",
            get(handlers::test_cases::get_test_case),
        )
        .route(
            "/api/v1/test-cases/:id",
            put(handlers::test_cases::update_test_case),
        )
        .route(
            "/api/v1/test-cases/:id",
            delete(handlers::test_cases::delete_test_case),
        )
        // Specifications
        .route(
            "/api/v1/projects/:project_id/specifications",
            get(handlers::specifications::list_specifications),
        )
        .route(
            "/api/v1/projects/:project_id/specifications/generate",
            post(handlers::specifications::generate_specification),
        )
        .route(
            "/api/v1/specifications/:id",
            get(handlers::specifications::get_specification),
        )
        .route(
            "/api/v1/specification-jobs/:id",
            get(handlers::specifications::get_job_status),
        )
        .layer(middleware::from_fn_with_state(pool.clone(), auth_middleware));

    // Combine routes
    public_routes.merge(protected_routes).with_state(pool)
}
