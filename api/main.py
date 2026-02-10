"""
FastAPI Backend for GoAgenticOS
Serves both API endpoints and static Next.js frontend
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

from api.config.database import engine, Base
from api.routers import auth, projects, domains, requirements, data_bags, test_cases, specifications

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="GoAgenticOS API",
    description="Agentic Operation System - Software Specification Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(domains.router, prefix="/api/v1", tags=["Domains"])
app.include_router(requirements.router, prefix="/api/v1", tags=["Requirements"])
app.include_router(data_bags.router, prefix="/api/v1", tags=["Data Bags"])
app.include_router(test_cases.router, prefix="/api/v1", tags=["Test Cases"])
app.include_router(specifications.router, prefix="/api/v1", tags=["Specifications"])

# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "goagenticos-api"}

# Serve static files from Next.js build (frontend/out)
frontend_build_path = Path(__file__).parent.parent / "frontend" / "out"

if frontend_build_path.exists():
    # Mount static assets
    app.mount("/_next", StaticFiles(directory=frontend_build_path / "_next"), name="next_static")

    # Serve index.html for all routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve Next.js static build for all non-API routes"""
        # If requesting a specific file, serve it
        file_path = frontend_build_path / full_path
        if file_path.is_file():
            return FileResponse(file_path)

        # Check for HTML file
        html_path = frontend_build_path / f"{full_path}.html"
        if html_path.is_file():
            return FileResponse(html_path)

        # Default to index.html for client-side routing
        return FileResponse(frontend_build_path / "index.html")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=True)
