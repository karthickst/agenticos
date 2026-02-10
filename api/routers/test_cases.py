"""Test cases router"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import uuid

from api.config.database import get_db
from api.models.test_case import TestCase

router = APIRouter()


class TestCaseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    testData: Optional[dict] = None
    expectedOutcome: Optional[str] = None
    status: Optional[str] = "pending"


class TestCaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    testData: Optional[dict] = None
    expectedOutcome: Optional[str] = None
    status: Optional[str] = None


class TestCaseStatusUpdate(BaseModel):
    status: str


@router.get("/requirements/{requirement_id}/test-cases")
async def list_test_cases(requirement_id: str, db: Session = Depends(get_db)):
    """List all test cases for a requirement"""
    test_cases = db.query(TestCase).filter(
        TestCase.requirement_id == uuid.UUID(requirement_id)
    ).all()

    return [
        {
            "id": str(tc.id),
            "requirementId": str(tc.requirement_id),
            "name": tc.name,
            "description": tc.description,
            "testData": tc.test_data,
            "expectedOutcome": tc.expected_outcome,
            "status": tc.status,
            "createdAt": tc.created_at.isoformat(),
            "updatedAt": tc.updated_at.isoformat()
        }
        for tc in test_cases
    ]


@router.post("/requirements/{requirement_id}/test-cases", status_code=201)
async def create_test_case(
    requirement_id: str,
    test_case: TestCaseCreate,
    db: Session = Depends(get_db)
):
    """Create new test case"""
    new_test_case = TestCase(
        requirement_id=uuid.UUID(requirement_id),
        name=test_case.name,
        description=test_case.description,
        test_data=test_case.testData,
        expected_outcome=test_case.expectedOutcome,
        status=test_case.status
    )
    db.add(new_test_case)
    db.commit()
    db.refresh(new_test_case)

    return {
        "id": str(new_test_case.id),
        "requirementId": str(new_test_case.requirement_id),
        "name": new_test_case.name,
        "description": new_test_case.description,
        "testData": new_test_case.test_data,
        "expectedOutcome": new_test_case.expected_outcome,
        "status": new_test_case.status,
        "createdAt": new_test_case.created_at.isoformat(),
        "updatedAt": new_test_case.updated_at.isoformat()
    }


@router.get("/test-cases/{test_case_id}")
async def get_test_case(test_case_id: str, db: Session = Depends(get_db)):
    """Get test case by ID"""
    test_case = db.query(TestCase).filter(TestCase.id == uuid.UUID(test_case_id)).first()
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")

    return {
        "id": str(test_case.id),
        "requirementId": str(test_case.requirement_id),
        "name": test_case.name,
        "description": test_case.description,
        "testData": test_case.test_data,
        "expectedOutcome": test_case.expected_outcome,
        "status": test_case.status,
        "createdAt": test_case.created_at.isoformat(),
        "updatedAt": test_case.updated_at.isoformat()
    }


@router.put("/test-cases/{test_case_id}")
async def update_test_case(
    test_case_id: str,
    test_case: TestCaseUpdate,
    db: Session = Depends(get_db)
):
    """Update test case"""
    db_test_case = db.query(TestCase).filter(TestCase.id == uuid.UUID(test_case_id)).first()
    if not db_test_case:
        raise HTTPException(status_code=404, detail="Test case not found")

    if test_case.name is not None:
        db_test_case.name = test_case.name
    if test_case.description is not None:
        db_test_case.description = test_case.description
    if test_case.testData is not None:
        db_test_case.test_data = test_case.testData
    if test_case.expectedOutcome is not None:
        db_test_case.expected_outcome = test_case.expectedOutcome
    if test_case.status is not None:
        db_test_case.status = test_case.status

    db.commit()
    db.refresh(db_test_case)

    return {
        "id": str(db_test_case.id),
        "requirementId": str(db_test_case.requirement_id),
        "name": db_test_case.name,
        "description": db_test_case.description,
        "testData": db_test_case.test_data,
        "expectedOutcome": db_test_case.expected_outcome,
        "status": db_test_case.status,
        "createdAt": db_test_case.created_at.isoformat(),
        "updatedAt": db_test_case.updated_at.isoformat()
    }


@router.patch("/test-cases/{test_case_id}/status")
async def update_test_case_status(
    test_case_id: str,
    status_update: TestCaseStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update test case status"""
    test_case = db.query(TestCase).filter(TestCase.id == uuid.UUID(test_case_id)).first()
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")

    test_case.status = status_update.status
    db.commit()
    db.refresh(test_case)

    return {
        "id": str(test_case.id),
        "requirementId": str(test_case.requirement_id),
        "name": test_case.name,
        "description": test_case.description,
        "testData": test_case.test_data,
        "expectedOutcome": test_case.expected_outcome,
        "status": test_case.status,
        "createdAt": test_case.created_at.isoformat(),
        "updatedAt": test_case.updated_at.isoformat()
    }


@router.delete("/test-cases/{test_case_id}", status_code=204)
async def delete_test_case(test_case_id: str, db: Session = Depends(get_db)):
    """Delete test case"""
    test_case = db.query(TestCase).filter(TestCase.id == uuid.UUID(test_case_id)).first()
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")

    db.delete(test_case)
    db.commit()
    return None
