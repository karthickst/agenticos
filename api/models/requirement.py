"""Requirement models"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from api.config.database import Base


class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String)
    gherkin_scenario = Column(String, nullable=False)
    position_x = Column(Float)
    position_y = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", backref="requirements")
    steps = relationship("RequirementStep", back_populates="requirement", cascade="all, delete-orphan")


class RequirementStep(Base):
    __tablename__ = "requirement_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requirement_id = Column(UUID(as_uuid=True), ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False)
    step_type = Column(String(10), nullable=False)
    step_order = Column(Integer, nullable=False)
    step_text = Column(String, nullable=False)
    domain_references = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    requirement = relationship("Requirement", back_populates="steps")


class RequirementConnection(Base):
    __tablename__ = "requirement_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    source_requirement_id = Column(UUID(as_uuid=True), ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False)
    target_requirement_id = Column(UUID(as_uuid=True), ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False)
    connection_type = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", backref="requirement_connections")
