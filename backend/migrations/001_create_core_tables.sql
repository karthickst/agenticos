-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_projects ON projects(user_id, created_at DESC);

-- Domains table
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (project_id, name)
);

CREATE INDEX idx_project_domains ON domains(project_id);

-- Domain Attributes table
CREATE TABLE domain_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    validation_rules JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (domain_id, name)
);

CREATE INDEX idx_domain_attrs ON domain_attributes(domain_id);

-- Requirements table
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    gherkin_scenario TEXT NOT NULL,
    position_x FLOAT,
    position_y FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_requirements ON requirements(project_id);

-- Requirement Steps table
CREATE TABLE requirement_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    step_type VARCHAR(10) NOT NULL,
    step_order INTEGER NOT NULL,
    step_text TEXT NOT NULL,
    domain_references JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (requirement_id, step_order)
);

CREATE INDEX idx_requirement_steps ON requirement_steps(requirement_id, step_order);

-- Data Bags table
CREATE TABLE data_bags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_schema JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (project_id, name)
);

CREATE INDEX idx_project_data_bags ON data_bags(project_id);

-- Data Bag Items table
CREATE TABLE data_bag_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_bag_id UUID NOT NULL REFERENCES data_bags(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_data_bag_items ON data_bag_items(data_bag_id);

-- Test Cases table
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_data JSONB,
    expected_outcome TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_requirement_tests ON test_cases(requirement_id);

-- Requirement Data Bag Links table
CREATE TABLE requirement_data_bag_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    data_bag_id UUID NOT NULL REFERENCES data_bags(id) ON DELETE CASCADE,
    data_bag_item_id UUID REFERENCES data_bag_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (requirement_id, data_bag_id, data_bag_item_id)
);

CREATE INDEX idx_req_databag_links ON requirement_data_bag_links(requirement_id);

-- Requirement Connections table
CREATE TABLE requirement_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source_requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    target_requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    connection_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (source_requirement_id, target_requirement_id)
);

CREATE INDEX idx_project_connections ON requirement_connections(project_id);

-- Specifications table
CREATE TABLE specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    claude_model VARCHAR(100) NOT NULL,
    specification_text TEXT NOT NULL,
    metadata JSONB,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_specs ON specifications(project_id, version DESC);

-- Specification Jobs table
CREATE TABLE specification_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    claude_model VARCHAR(100) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_project_jobs ON specification_jobs(project_id, created_at DESC);
