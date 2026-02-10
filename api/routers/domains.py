"""Domains and domain attributes router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid

from api.config.database import get_db
from api.models.domain import Domain, DomainAttribute

router = APIRouter()


class DomainCreate(BaseModel):
    name: str
    description: Optional[str] = None


class AttributeCreate(BaseModel):
    name: str
    dataType: str
    isRequired: bool = False
    defaultValue: Optional[str] = None
    validationRules: Optional[dict] = None


@router.get("/projects/{project_id}/domains")
async def list_domains(project_id: str, db: Session = Depends(get_db)):
    """List all domains with attributes"""
    domains = db.query(Domain).filter(Domain.project_id == uuid.UUID(project_id)).all()

    result = []
    for domain in domains:
        attributes = db.query(DomainAttribute).filter(DomainAttribute.domain_id == domain.id).all()
        result.append({
            "domain": {
                "id": str(domain.id),
                "projectId": str(domain.project_id),
                "name": domain.name,
                "description": domain.description,
                "createdAt": domain.created_at.isoformat(),
                "updatedAt": domain.updated_at.isoformat()
            },
            "attributes": [
                {
                    "id": str(attr.id),
                    "domainId": str(attr.domain_id),
                    "name": attr.name,
                    "dataType": attr.data_type,
                    "isRequired": attr.is_required,
                    "defaultValue": attr.default_value,
                    "validationRules": attr.validation_rules,
                    "createdAt": attr.created_at.isoformat(),
                    "updatedAt": attr.updated_at.isoformat()
                }
                for attr in attributes
            ]
        })

    return result


@router.post("/projects/{project_id}/domains", status_code=201)
async def create_domain(project_id: str, domain: DomainCreate, db: Session = Depends(get_db)):
    """Create new domain"""
    new_domain = Domain(
        project_id=uuid.UUID(project_id),
        name=domain.name,
        description=domain.description
    )
    db.add(new_domain)
    db.commit()
    db.refresh(new_domain)

    return {
        "id": str(new_domain.id),
        "projectId": str(new_domain.project_id),
        "name": new_domain.name,
        "description": new_domain.description,
        "createdAt": new_domain.created_at.isoformat(),
        "updatedAt": new_domain.updated_at.isoformat()
    }


@router.get("/domains/{domain_id}")
async def get_domain(domain_id: str, db: Session = Depends(get_db)):
    """Get domain with attributes"""
    domain = db.query(Domain).filter(Domain.id == uuid.UUID(domain_id)).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    attributes = db.query(DomainAttribute).filter(DomainAttribute.domain_id == domain.id).all()

    return {
        "domain": {
            "id": str(domain.id),
            "projectId": str(domain.project_id),
            "name": domain.name,
            "description": domain.description,
            "createdAt": domain.created_at.isoformat(),
            "updatedAt": domain.updated_at.isoformat()
        },
        "attributes": [
            {
                "id": str(attr.id),
                "domainId": str(attr.domain_id),
                "name": attr.name,
                "dataType": attr.data_type,
                "isRequired": attr.is_required,
                "defaultValue": attr.default_value,
                "validationRules": attr.validation_rules,
                "createdAt": attr.created_at.isoformat(),
                "updatedAt": attr.updated_at.isoformat()
            }
            for attr in attributes
        ]
    }


@router.delete("/domains/{domain_id}", status_code=204)
async def delete_domain(domain_id: str, db: Session = Depends(get_db)):
    """Delete domain"""
    domain = db.query(Domain).filter(Domain.id == uuid.UUID(domain_id)).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    db.delete(domain)
    db.commit()
    return None


# Domain Attributes endpoints
@router.post("/domains/{domain_id}/attributes", status_code=201)
async def create_attribute(domain_id: str, attribute: AttributeCreate, db: Session = Depends(get_db)):
    """Create domain attribute"""
    new_attr = DomainAttribute(
        domain_id=uuid.UUID(domain_id),
        name=attribute.name,
        data_type=attribute.dataType,
        is_required=attribute.isRequired,
        default_value=attribute.defaultValue,
        validation_rules=attribute.validationRules
    )
    db.add(new_attr)
    db.commit()
    db.refresh(new_attr)

    return {
        "id": str(new_attr.id),
        "domainId": str(new_attr.domain_id),
        "name": new_attr.name,
        "dataType": new_attr.data_type,
        "isRequired": new_attr.is_required,
        "defaultValue": new_attr.default_value,
        "validationRules": new_attr.validation_rules,
        "createdAt": new_attr.created_at.isoformat(),
        "updatedAt": new_attr.updated_at.isoformat()
    }


@router.delete("/attributes/{attribute_id}", status_code=204)
async def delete_attribute(attribute_id: str, db: Session = Depends(get_db)):
    """Delete attribute"""
    attribute = db.query(DomainAttribute).filter(DomainAttribute.id == uuid.UUID(attribute_id)).first()
    if not attribute:
        raise HTTPException(status_code=404, detail="Attribute not found")

    db.delete(attribute)
    db.commit()
    return None
