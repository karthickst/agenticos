"""Specification models"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from api.config.database import Base


class Specification(Base):
    __tablename__ = "specifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    claude_model = Column(String(100), nullable=False)
    specification_text = Column(String, nullable=False)
    spec_metadata = Column(JSON)
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", backref="specifications")


class SpecificationJob(Base):
    __tablename__ = "specification_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)
    claude_model = Column(String(100), nullable=False)
    error_message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)

    # Relationships
    project = relationship("Project", backref="specification_jobs")
