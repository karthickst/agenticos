"""Domain models"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from api.config.database import Base


class Domain(Base):
    __tablename__ = "domains"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", backref="domains")
    attributes = relationship("DomainAttribute", back_populates="domain", cascade="all, delete-orphan")


class DomainAttribute(Base):
    __tablename__ = "domain_attributes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain_id = Column(UUID(as_uuid=True), ForeignKey("domains.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    data_type = Column(String(50), nullable=False)
    is_required = Column(Boolean, default=False, nullable=False)
    default_value = Column(String)
    validation_rules = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    domain = relationship("Domain", back_populates="attributes")
