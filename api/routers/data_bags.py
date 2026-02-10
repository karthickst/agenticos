"""Data bags router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid

from api.config.database import get_db
from api.models.data_bag import DataBag, DataBagItem, RequirementDataBagLink

router = APIRouter()


class DataBagCreate(BaseModel):
    name: str
    description: Optional[str] = None
    dataSchema: Optional[dict] = None


class DataBagUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    dataSchema: Optional[dict] = None


class DataBagItemCreate(BaseModel):
    data: dict


class DataBagItemUpdate(BaseModel):
    data: dict


class RequirementDataBagLinkCreate(BaseModel):
    dataBagId: str
    dataBagItemId: Optional[str] = None


@router.get("/projects/{project_id}/data-bags")
async def list_data_bags(project_id: str, db: Session = Depends(get_db)):
    """List all data bags with items"""
    data_bags = db.query(DataBag).filter(DataBag.project_id == uuid.UUID(project_id)).all()

    result = []
    for bag in data_bags:
        items = db.query(DataBagItem).filter(DataBagItem.data_bag_id == bag.id).all()

        result.append({
            "dataBag": {
                "id": str(bag.id),
                "projectId": str(bag.project_id),
                "name": bag.name,
                "description": bag.description,
                "dataSchema": bag.data_schema,
                "createdAt": bag.created_at.isoformat(),
                "updatedAt": bag.updated_at.isoformat()
            },
            "items": [
                {
                    "id": str(item.id),
                    "dataBagId": str(item.data_bag_id),
                    "data": item.data,
                    "createdAt": item.created_at.isoformat()
                }
                for item in items
            ]
        })

    return result


@router.post("/projects/{project_id}/data-bags", status_code=201)
async def create_data_bag(
    project_id: str,
    data_bag: DataBagCreate,
    db: Session = Depends(get_db)
):
    """Create new data bag"""
    new_bag = DataBag(
        project_id=uuid.UUID(project_id),
        name=data_bag.name,
        description=data_bag.description,
        data_schema=data_bag.dataSchema
    )
    db.add(new_bag)
    db.commit()
    db.refresh(new_bag)

    return {
        "id": str(new_bag.id),
        "projectId": str(new_bag.project_id),
        "name": new_bag.name,
        "description": new_bag.description,
        "dataSchema": new_bag.data_schema,
        "createdAt": new_bag.created_at.isoformat(),
        "updatedAt": new_bag.updated_at.isoformat()
    }


@router.get("/data-bags/{data_bag_id}")
async def get_data_bag(data_bag_id: str, db: Session = Depends(get_db)):
    """Get data bag with items"""
    bag = db.query(DataBag).filter(DataBag.id == uuid.UUID(data_bag_id)).first()
    if not bag:
        raise HTTPException(status_code=404, detail="Data bag not found")

    items = db.query(DataBagItem).filter(DataBagItem.data_bag_id == bag.id).all()

    return {
        "dataBag": {
            "id": str(bag.id),
            "projectId": str(bag.project_id),
            "name": bag.name,
            "description": bag.description,
            "dataSchema": bag.data_schema,
            "createdAt": bag.created_at.isoformat(),
            "updatedAt": bag.updated_at.isoformat()
        },
        "items": [
            {
                "id": str(item.id),
                "dataBagId": str(item.data_bag_id),
                "data": item.data,
                "createdAt": item.created_at.isoformat()
            }
            for item in items
        ]
    }


@router.put("/data-bags/{data_bag_id}")
async def update_data_bag(
    data_bag_id: str,
    data_bag: DataBagUpdate,
    db: Session = Depends(get_db)
):
    """Update data bag"""
    bag = db.query(DataBag).filter(DataBag.id == uuid.UUID(data_bag_id)).first()
    if not bag:
        raise HTTPException(status_code=404, detail="Data bag not found")

    if data_bag.name is not None:
        bag.name = data_bag.name
    if data_bag.description is not None:
        bag.description = data_bag.description
    if data_bag.dataSchema is not None:
        bag.data_schema = data_bag.dataSchema

    db.commit()
    db.refresh(bag)

    return {
        "id": str(bag.id),
        "projectId": str(bag.project_id),
        "name": bag.name,
        "description": bag.description,
        "dataSchema": bag.data_schema,
        "createdAt": bag.created_at.isoformat(),
        "updatedAt": bag.updated_at.isoformat()
    }


@router.delete("/data-bags/{data_bag_id}", status_code=204)
async def delete_data_bag(data_bag_id: str, db: Session = Depends(get_db)):
    """Delete data bag"""
    bag = db.query(DataBag).filter(DataBag.id == uuid.UUID(data_bag_id)).first()
    if not bag:
        raise HTTPException(status_code=404, detail="Data bag not found")

    db.delete(bag)
    db.commit()
    return None


# Data Bag Items endpoints
@router.post("/data-bags/{data_bag_id}/items", status_code=201)
async def create_data_bag_item(
    data_bag_id: str,
    item: DataBagItemCreate,
    db: Session = Depends(get_db)
):
    """Create data bag item"""
    new_item = DataBagItem(
        data_bag_id=uuid.UUID(data_bag_id),
        data=item.data
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "id": str(new_item.id),
        "dataBagId": str(new_item.data_bag_id),
        "data": new_item.data,
        "createdAt": new_item.created_at.isoformat()
    }


@router.put("/items/{item_id}")
async def update_data_bag_item(
    item_id: str,
    item: DataBagItemUpdate,
    db: Session = Depends(get_db)
):
    """Update data bag item"""
    db_item = db.query(DataBagItem).filter(DataBagItem.id == uuid.UUID(item_id)).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    db_item.data = item.data
    db.commit()
    db.refresh(db_item)

    return {
        "id": str(db_item.id),
        "dataBagId": str(db_item.data_bag_id),
        "data": db_item.data,
        "createdAt": db_item.created_at.isoformat()
    }


@router.delete("/items/{item_id}", status_code=204)
async def delete_data_bag_item(item_id: str, db: Session = Depends(get_db)):
    """Delete data bag item"""
    item = db.query(DataBagItem).filter(DataBagItem.id == uuid.UUID(item_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return None


# Requirement Data Bag Link endpoints
@router.get("/requirements/{requirement_id}/data-bags")
async def list_requirement_data_bags(requirement_id: str, db: Session = Depends(get_db)):
    """List data bags linked to a requirement"""
    links = db.query(RequirementDataBagLink).filter(
        RequirementDataBagLink.requirement_id == uuid.UUID(requirement_id)
    ).all()

    result = []
    for link in links:
        bag = db.query(DataBag).filter(DataBag.id == link.data_bag_id).first()
        if bag:
            result.append({
                "link": {
                    "id": str(link.id),
                    "requirementId": str(link.requirement_id),
                    "dataBagId": str(link.data_bag_id),
                    "dataBagItemId": str(link.data_bag_item_id) if link.data_bag_item_id else None,
                    "createdAt": link.created_at.isoformat()
                },
                "dataBag": {
                    "id": str(bag.id),
                    "projectId": str(bag.project_id),
                    "name": bag.name,
                    "description": bag.description,
                    "dataSchema": bag.data_schema,
                    "createdAt": bag.created_at.isoformat(),
                    "updatedAt": bag.updated_at.isoformat()
                }
            })

    return result


@router.post("/requirements/{requirement_id}/data-bags", status_code=201)
async def link_requirement_to_data_bag(
    requirement_id: str,
    link: RequirementDataBagLinkCreate,
    db: Session = Depends(get_db)
):
    """Link a requirement to a data bag"""
    new_link = RequirementDataBagLink(
        requirement_id=uuid.UUID(requirement_id),
        data_bag_id=uuid.UUID(link.dataBagId),
        data_bag_item_id=uuid.UUID(link.dataBagItemId) if link.dataBagItemId else None
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)

    return {
        "id": str(new_link.id),
        "requirementId": str(new_link.requirement_id),
        "dataBagId": str(new_link.data_bag_id),
        "dataBagItemId": str(new_link.data_bag_item_id) if new_link.data_bag_item_id else None,
        "createdAt": new_link.created_at.isoformat()
    }


@router.delete("/requirement-data-bag-links/{link_id}", status_code=204)
async def unlink_requirement_from_data_bag(link_id: str, db: Session = Depends(get_db)):
    """Unlink a requirement from a data bag"""
    link = db.query(RequirementDataBagLink).filter(
        RequirementDataBagLink.id == uuid.UUID(link_id)
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    db.delete(link)
    db.commit()
    return None
