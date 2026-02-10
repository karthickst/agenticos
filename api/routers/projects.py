"""Projects router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import uuid

from api.config.database import get_db
from api.models.project import Project

router = APIRouter()


class ProjectCreate(BaseModel):
    name: str
    description: str = None


class ProjectUpdate(BaseModel):
    name: str = None
    description: str = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str = None
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(db: Session = Depends(get_db)):
    """List all projects"""
    projects = db.query(Project).all()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "description": p.description,
            "createdAt": p.created_at.isoformat(),
            "updatedAt": p.updated_at.isoformat()
        }
        for p in projects
    ]


@router.post("/", status_code=201)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create new project"""
    # TODO: Get user_id from JWT token
    new_project = Project(
        user_id=uuid.uuid4(),  # Placeholder
        name=project.name,
        description=project.description
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "id": str(new_project.id),
        "name": new_project.name,
        "description": new_project.description,
        "createdAt": new_project.created_at.isoformat(),
        "updatedAt": new_project.updated_at.isoformat()
    }


@router.get("/{project_id}")
async def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get project by ID"""
    project = db.query(Project).filter(Project.id == uuid.UUID(project_id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": str(project.id),
        "name": project.name,
        "description": project.description,
        "createdAt": project.created_at.isoformat(),
        "updatedAt": project.updated_at.isoformat()
    }


@router.put("/{project_id}")
async def update_project(project_id: str, project: ProjectUpdate, db: Session = Depends(get_db)):
    """Update project"""
    db_project = db.query(Project).filter(Project.id == uuid.UUID(project_id)).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.name is not None:
        db_project.name = project.name
    if project.description is not None:
        db_project.description = project.description

    db.commit()
    db.refresh(db_project)

    return {
        "id": str(db_project.id),
        "name": db_project.name,
        "description": db_project.description,
        "createdAt": db_project.created_at.isoformat(),
        "updatedAt": db_project.updated_at.isoformat()
    }


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Delete project"""
    project = db.query(Project).filter(Project.id == uuid.UUID(project_id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return None
