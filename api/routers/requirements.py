"""Requirements router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid
import re

from api.config.database import get_db
from api.models.requirement import Requirement, RequirementStep, RequirementConnection

router = APIRouter()


class RequirementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    gherkinScenario: str
    positionX: Optional[float] = 0
    positionY: Optional[float] = 0


class RequirementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    gherkinScenario: Optional[str] = None
    positionX: Optional[float] = None
    positionY: Optional[float] = None


class ConnectionCreate(BaseModel):
    sourceRequirementId: str
    targetRequirementId: str
    connectionType: Optional[str] = "dependency"


def parse_gherkin(gherkin_text: str) -> List[dict]:
    """Parse Gherkin scenario into steps"""
    steps = []
    lines = gherkin_text.strip().split('\n')
    step_order = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Match Given, When, Then, And, But
        match = re.match(r'^(Given|When|Then|And|But)\s+(.+)$', line, re.IGNORECASE)
        if match:
            step_type = match.group(1).lower()
            step_text = match.group(2)

            # Extract domain references (e.g., {User}, {Order})
            domain_refs = re.findall(r'\{([^}]+)\}', step_text)

            steps.append({
                "stepType": step_type,
                "stepOrder": step_order,
                "stepText": step_text,
                "domainReferences": domain_refs if domain_refs else None
            })
            step_order += 1

    return steps


@router.get("/projects/{project_id}/requirements")
async def list_requirements(project_id: str, db: Session = Depends(get_db)):
    """List all requirements with steps"""
    requirements = db.query(Requirement).filter(Requirement.project_id == uuid.UUID(project_id)).all()

    result = []
    for req in requirements:
        steps = db.query(RequirementStep).filter(
            RequirementStep.requirement_id == req.id
        ).order_by(RequirementStep.step_order).all()

        result.append({
            "requirement": {
                "id": str(req.id),
                "projectId": str(req.project_id),
                "title": req.title,
                "description": req.description,
                "gherkinScenario": req.gherkin_scenario,
                "positionX": req.position_x,
                "positionY": req.position_y,
                "createdAt": req.created_at.isoformat(),
                "updatedAt": req.updated_at.isoformat()
            },
            "steps": [
                {
                    "id": str(step.id),
                    "requirementId": str(step.requirement_id),
                    "stepType": step.step_type,
                    "stepOrder": step.step_order,
                    "stepText": step.step_text,
                    "domainReferences": step.domain_references,
                    "createdAt": step.created_at.isoformat()
                }
                for step in steps
            ]
        })

    return result


@router.post("/projects/{project_id}/requirements", status_code=201)
async def create_requirement(
    project_id: str,
    requirement: RequirementCreate,
    db: Session = Depends(get_db)
):
    """Create new requirement with Gherkin parsing"""
    # Create requirement
    new_req = Requirement(
        project_id=uuid.UUID(project_id),
        title=requirement.title,
        description=requirement.description,
        gherkin_scenario=requirement.gherkinScenario,
        position_x=requirement.positionX,
        position_y=requirement.positionY
    )
    db.add(new_req)
    db.flush()  # Get the ID without committing

    # Parse Gherkin and create steps
    parsed_steps = parse_gherkin(requirement.gherkinScenario)
    steps = []

    for step_data in parsed_steps:
        step = RequirementStep(
            requirement_id=new_req.id,
            step_type=step_data["stepType"],
            step_order=step_data["stepOrder"],
            step_text=step_data["stepText"],
            domain_references=step_data["domainReferences"]
        )
        db.add(step)
        steps.append(step)

    db.commit()
    db.refresh(new_req)

    # Refresh all steps
    for step in steps:
        db.refresh(step)

    return {
        "requirement": {
            "id": str(new_req.id),
            "projectId": str(new_req.project_id),
            "title": new_req.title,
            "description": new_req.description,
            "gherkinScenario": new_req.gherkin_scenario,
            "positionX": new_req.position_x,
            "positionY": new_req.position_y,
            "createdAt": new_req.created_at.isoformat(),
            "updatedAt": new_req.updated_at.isoformat()
        },
        "steps": [
            {
                "id": str(step.id),
                "requirementId": str(step.requirement_id),
                "stepType": step.step_type,
                "stepOrder": step.step_order,
                "stepText": step.step_text,
                "domainReferences": step.domain_references,
                "createdAt": step.created_at.isoformat()
            }
            for step in steps
        ]
    }


@router.get("/requirements/{requirement_id}")
async def get_requirement(requirement_id: str, db: Session = Depends(get_db)):
    """Get requirement with steps"""
    req = db.query(Requirement).filter(Requirement.id == uuid.UUID(requirement_id)).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    steps = db.query(RequirementStep).filter(
        RequirementStep.requirement_id == req.id
    ).order_by(RequirementStep.step_order).all()

    return {
        "requirement": {
            "id": str(req.id),
            "projectId": str(req.project_id),
            "title": req.title,
            "description": req.description,
            "gherkinScenario": req.gherkin_scenario,
            "positionX": req.position_x,
            "positionY": req.position_y,
            "createdAt": req.created_at.isoformat(),
            "updatedAt": req.updated_at.isoformat()
        },
        "steps": [
            {
                "id": str(step.id),
                "requirementId": str(step.requirement_id),
                "stepType": step.step_type,
                "stepOrder": step.step_order,
                "stepText": step.step_text,
                "domainReferences": step.domain_references,
                "createdAt": step.created_at.isoformat()
            }
            for step in steps
        ]
    }


@router.put("/requirements/{requirement_id}")
async def update_requirement(
    requirement_id: str,
    requirement: RequirementUpdate,
    db: Session = Depends(get_db)
):
    """Update requirement"""
    req = db.query(Requirement).filter(Requirement.id == uuid.UUID(requirement_id)).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    # Update fields
    if requirement.title is not None:
        req.title = requirement.title
    if requirement.description is not None:
        req.description = requirement.description
    if requirement.positionX is not None:
        req.position_x = requirement.positionX
    if requirement.positionY is not None:
        req.position_y = requirement.positionY

    # If Gherkin changed, reparse and update steps
    if requirement.gherkinScenario is not None:
        req.gherkin_scenario = requirement.gherkinScenario

        # Delete existing steps
        db.query(RequirementStep).filter(RequirementStep.requirement_id == req.id).delete()

        # Parse and create new steps
        parsed_steps = parse_gherkin(requirement.gherkinScenario)
        for step_data in parsed_steps:
            step = RequirementStep(
                requirement_id=req.id,
                step_type=step_data["stepType"],
                step_order=step_data["stepOrder"],
                step_text=step_data["stepText"],
                domain_references=step_data["domainReferences"]
            )
            db.add(step)

    db.commit()
    db.refresh(req)

    # Get updated steps
    steps = db.query(RequirementStep).filter(
        RequirementStep.requirement_id == req.id
    ).order_by(RequirementStep.step_order).all()

    return {
        "requirement": {
            "id": str(req.id),
            "projectId": str(req.project_id),
            "title": req.title,
            "description": req.description,
            "gherkinScenario": req.gherkin_scenario,
            "positionX": req.position_x,
            "positionY": req.position_y,
            "createdAt": req.created_at.isoformat(),
            "updatedAt": req.updated_at.isoformat()
        },
        "steps": [
            {
                "id": str(step.id),
                "requirementId": str(step.requirement_id),
                "stepType": step.step_type,
                "stepOrder": step.step_order,
                "stepText": step.step_text,
                "domainReferences": step.domain_references,
                "createdAt": step.created_at.isoformat()
            }
            for step in steps
        ]
    }


@router.delete("/requirements/{requirement_id}", status_code=204)
async def delete_requirement(requirement_id: str, db: Session = Depends(get_db)):
    """Delete requirement"""
    req = db.query(Requirement).filter(Requirement.id == uuid.UUID(requirement_id)).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    db.delete(req)
    db.commit()
    return None


# Requirement Connections endpoints
@router.get("/projects/{project_id}/connections")
async def list_connections(project_id: str, db: Session = Depends(get_db)):
    """List all requirement connections"""
    connections = db.query(RequirementConnection).filter(
        RequirementConnection.project_id == uuid.UUID(project_id)
    ).all()

    return [
        {
            "id": str(conn.id),
            "projectId": str(conn.project_id),
            "sourceRequirementId": str(conn.source_requirement_id),
            "targetRequirementId": str(conn.target_requirement_id),
            "connectionType": conn.connection_type,
            "createdAt": conn.created_at.isoformat()
        }
        for conn in connections
    ]


@router.post("/projects/{project_id}/connections", status_code=201)
async def create_connection(
    project_id: str,
    connection: ConnectionCreate,
    db: Session = Depends(get_db)
):
    """Create requirement connection"""
    new_conn = RequirementConnection(
        project_id=uuid.UUID(project_id),
        source_requirement_id=uuid.UUID(connection.sourceRequirementId),
        target_requirement_id=uuid.UUID(connection.targetRequirementId),
        connection_type=connection.connectionType
    )
    db.add(new_conn)
    db.commit()
    db.refresh(new_conn)

    return {
        "id": str(new_conn.id),
        "projectId": str(new_conn.project_id),
        "sourceRequirementId": str(new_conn.source_requirement_id),
        "targetRequirementId": str(new_conn.target_requirement_id),
        "connectionType": new_conn.connection_type,
        "createdAt": new_conn.created_at.isoformat()
    }


@router.delete("/connections/{connection_id}", status_code=204)
async def delete_connection(connection_id: str, db: Session = Depends(get_db)):
    """Delete connection"""
    conn = db.query(RequirementConnection).filter(
        RequirementConnection.id == uuid.UUID(connection_id)
    ).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    db.delete(conn)
    db.commit()
    return None
