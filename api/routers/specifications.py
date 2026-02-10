"""Specifications router with Claude integration"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid
import os
from datetime import datetime
from anthropic import Anthropic

from api.config.database import get_db
from api.models.specification import Specification, SpecificationJob
from api.models.requirement import Requirement, RequirementStep
from api.models.domain import Domain, DomainAttribute

router = APIRouter()

# Initialize Anthropic client
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))


class SpecificationJobCreate(BaseModel):
    claudeModel: str = "claude-sonnet-4-5-20250929"


class SpecificationJobResponse(BaseModel):
    id: str
    projectId: str
    status: str
    claudeModel: str
    errorMessage: Optional[str] = None
    createdAt: str
    completedAt: Optional[str] = None


def generate_specification_with_claude(
    project_id: uuid.UUID,
    job_id: uuid.UUID,
    claude_model: str,
    db: Session
):
    """Background task to generate specification using Claude"""
    try:
        # Fetch project data
        requirements = db.query(Requirement).filter(Requirement.project_id == project_id).all()
        domains = db.query(Domain).filter(Domain.project_id == project_id).all()

        # Build context for Claude
        requirements_text = []
        for req in requirements:
            steps = db.query(RequirementStep).filter(
                RequirementStep.requirement_id == req.id
            ).order_by(RequirementStep.step_order).all()

            req_text = f"**{req.title}**\n"
            if req.description:
                req_text += f"{req.description}\n"
            req_text += f"\n{req.gherkin_scenario}\n"
            requirements_text.append(req_text)

        domains_text = []
        for domain in domains:
            attributes = db.query(DomainAttribute).filter(
                DomainAttribute.domain_id == domain.id
            ).all()

            domain_text = f"**{domain.name}**\n"
            if domain.description:
                domain_text += f"{domain.description}\n"
            if attributes:
                domain_text += "Attributes:\n"
                for attr in attributes:
                    domain_text += f"  - {attr.name} ({attr.data_type})"
                    if attr.is_required:
                        domain_text += " [required]"
                    domain_text += "\n"
            domains_text.append(domain_text)

        # Create prompt for Claude
        prompt = f"""Based on the following requirements and domain models, generate a comprehensive technical specification document.

## Requirements

{chr(10).join(requirements_text) if requirements_text else "No requirements defined yet."}

## Domain Models

{chr(10).join(domains_text) if domains_text else "No domain models defined yet."}

Please generate a detailed technical specification that includes:
1. System Overview
2. Architecture Design
3. Data Models and Schemas
4. API Endpoints and Contracts
5. Business Logic and Workflows
6. Security Considerations
7. Performance Requirements
8. Testing Strategy

Format the specification in Markdown."""

        # Call Claude API
        message = anthropic_client.messages.create(
            model=claude_model,
            max_tokens=8000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        specification_text = message.content[0].text

        # Save specification
        spec = Specification(
            project_id=project_id,
            claude_model=claude_model,
            specification_text=specification_text,
            spec_metadata={
                "requirements_count": len(requirements),
                "domains_count": len(domains),
                "tokens_used": message.usage.input_tokens + message.usage.output_tokens
            },
            version=1
        )
        db.add(spec)

        # Update job status
        job = db.query(SpecificationJob).filter(SpecificationJob.id == job_id).first()
        if job:
            job.status = "completed"
            job.completed_at = datetime.utcnow()

        db.commit()

    except Exception as e:
        # Update job with error
        job = db.query(SpecificationJob).filter(SpecificationJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            db.commit()


@router.get("/projects/{project_id}/specifications")
async def list_specifications(project_id: str, db: Session = Depends(get_db)):
    """List all specifications for a project"""
    specs = db.query(Specification).filter(
        Specification.project_id == uuid.UUID(project_id)
    ).order_by(Specification.created_at.desc()).all()

    return [
        {
            "id": str(spec.id),
            "projectId": str(spec.project_id),
            "claudeModel": spec.claude_model,
            "specificationText": spec.specification_text,
            "metadata": spec.spec_metadata,
            "version": spec.version,
            "createdAt": spec.created_at.isoformat()
        }
        for spec in specs
    ]


@router.post("/projects/{project_id}/specifications", status_code=202)
async def create_specification(
    project_id: str,
    spec_job: SpecificationJobCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create specification generation job"""
    # Create job
    job = SpecificationJob(
        project_id=uuid.UUID(project_id),
        status="processing",
        claude_model=spec_job.claudeModel
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Start background task
    background_tasks.add_task(
        generate_specification_with_claude,
        uuid.UUID(project_id),
        job.id,
        spec_job.claudeModel,
        db
    )

    return {
        "id": str(job.id),
        "projectId": str(job.project_id),
        "status": job.status,
        "claudeModel": job.claude_model,
        "errorMessage": job.error_message,
        "createdAt": job.created_at.isoformat(),
        "completedAt": job.completed_at.isoformat() if job.completed_at else None
    }


@router.get("/specifications/{specification_id}")
async def get_specification(specification_id: str, db: Session = Depends(get_db)):
    """Get specification by ID"""
    spec = db.query(Specification).filter(
        Specification.id == uuid.UUID(specification_id)
    ).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Specification not found")

    return {
        "id": str(spec.id),
        "projectId": str(spec.project_id),
        "claudeModel": spec.claude_model,
        "specificationText": spec.specification_text,
        "metadata": spec.spec_metadata,
        "version": spec.version,
        "createdAt": spec.created_at.isoformat()
    }


@router.get("/specification-jobs/{job_id}")
async def get_specification_job(job_id: str, db: Session = Depends(get_db)):
    """Get specification job status"""
    job = db.query(SpecificationJob).filter(
        SpecificationJob.id == uuid.UUID(job_id)
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # If completed, find the specification
    specification = None
    if job.status == "completed":
        spec = db.query(Specification).filter(
            Specification.project_id == job.project_id
        ).order_by(Specification.created_at.desc()).first()
        if spec:
            specification = {
                "id": str(spec.id),
                "projectId": str(spec.project_id),
                "claudeModel": spec.claude_model,
                "specificationText": spec.specification_text,
                "metadata": spec.spec_metadata,
                "version": spec.version,
                "createdAt": spec.created_at.isoformat()
            }

    return {
        "job": {
            "id": str(job.id),
            "projectId": str(job.project_id),
            "status": job.status,
            "claudeModel": job.claude_model,
            "errorMessage": job.error_message,
            "createdAt": job.created_at.isoformat(),
            "completedAt": job.completed_at.isoformat() if job.completed_at else None
        },
        "specification": specification
    }


@router.delete("/specifications/{specification_id}", status_code=204)
async def delete_specification(specification_id: str, db: Session = Depends(get_db)):
    """Delete specification"""
    spec = db.query(Specification).filter(
        Specification.id == uuid.UUID(specification_id)
    ).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Specification not found")

    db.delete(spec)
    db.commit()
    return None
