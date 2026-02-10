"""Data bag models"""
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from api.config.database import Base


class DataBag(Base):
    __tablename__ = "data_bags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String)
    data_schema = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", backref="data_bags")
    items = relationship("DataBagItem", back_populates="data_bag", cascade="all, delete-orphan")


class DataBagItem(Base):
    __tablename__ = "data_bag_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    data_bag_id = Column(UUID(as_uuid=True), ForeignKey("data_bags.id", ondelete="CASCADE"), nullable=False)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    data_bag = relationship("DataBag", back_populates="items")


class RequirementDataBagLink(Base):
    __tablename__ = "requirement_data_bag_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requirement_id = Column(UUID(as_uuid=True), ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False)
    data_bag_id = Column(UUID(as_uuid=True), ForeignKey("data_bags.id", ondelete="CASCADE"), nullable=False)
    data_bag_item_id = Column(UUID(as_uuid=True), ForeignKey("data_bag_items.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    requirement = relationship("Requirement", backref="data_bag_links")
    data_bag = relationship("DataBag", backref="requirement_links")
