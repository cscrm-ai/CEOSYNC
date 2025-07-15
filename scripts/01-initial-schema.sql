-- =================================================================
-- TIPOS PERSONALIZADOS (ENUMs)
-- Usar ENUMs garante a integridade dos dados para campos com valores fixos.
-- =================================================================
CREATE TYPE meeting_type_enum AS ENUM ('presencial', 'online');
CREATE TYPE participant_status_enum AS ENUM ('convocado', 'convidado');
CREATE TYPE participant_response_enum AS ENUM ('aceito', 'recusado', 'pendente');
CREATE TYPE task_priority_enum AS ENUM ('baixa', 'media', 'alta', 'critica');
CREATE TYPE task_status_enum AS ENUM ('pendente', 'em_progresso', 'concluida', 'cancelada');
CREATE TYPE notification_type_enum AS ENUM ('conflict', 'meeting', 'message', 'system', 'task', 'reminder');
CREATE TYPE notification_priority_enum AS ENUM ('baixa', 'media', 'alta');
CREATE TYPE campaign_status_enum AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'sending', 'completed', 'cancelled');
CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- =================================================================
-- TABELA DE USUÁRIOS (users)
-- Esta tabela armazena informações sobre os usuários.
-- O 'id' deve corresponder ao 'id' do usuário no Supabase Auth.
-- =================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    position TEXT,
    level SMALLINT NOT NULL CHECK (level >= 1 AND level <= 5),
    is_online BOOLEAN DEFAULT false,
    preferences JSONB,
    last_activity TIMESTAMPTZ DEFAULT now(),
    notification_settings JSONB
);

-- =================================================================
-- TABELA DE REUNIÕES (meetings)
-- =================================================================
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    type meeting_type_enum,
    meeting_link TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    agenda TEXT,
    notes TEXT,
    recording TEXT,
    tags TEXT[],
    priority notification_priority_enum DEFAULT 'media',
    recurring JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =================================================================
-- TABELA DE PARTICIPANTES DE REUNIÕES (meeting_participants)
-- Tabela de junção para a relação muitos-para-muitos entre reuniões e usuários.
-- =================================================================
CREATE TABLE meeting_participants (
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status participant_status_enum NOT NULL,
    response participant_response_enum DEFAULT 'pendente',
    justification TEXT,
    PRIMARY KEY (meeting_id, user_id)
);

-- =================================================================
-- TABELA DE TAREFAS (tasks)
-- =================================================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    priority task_priority_enum DEFAULT 'media',
    status task_status_enum DEFAULT 'pendente',
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- =================================================================
-- TABELA DE NOTIFICAÇÕES (notifications)
-- =================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_required BOOLEAN DEFAULT false,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    priority notification_priority_enum DEFAULT 'media',
    delivery_status JSONB,
    scheduled_for TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =================================================================
-- TABELAS PARA O FLUXO DE APROVAÇÃO DE NOTIFICAÇÕES
-- =================================================================
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type notification_type_enum NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority notification_priority_enum DEFAULT 'media',
    channels TEXT[],
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notification_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    template_id UUID REFERENCES notification_templates(id),
    target_users UUID[],
    scheduled_for TIMESTAMPTZ,
    status campaign_status_enum DEFAULT 'draft',
    stats JSONB,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID UNIQUE REFERENCES notification_campaigns(id) ON DELETE CASCADE,
    status approval_status_enum DEFAULT 'pending',
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ DEFAULT now(),
    approvers JSONB,
    current_step SMALLINT,
    total_steps SMALLINT,
    final_decision JSONB,
    settings JSONB
);

-- =================================================================
-- ÍNDICES PARA MELHORAR A PERFORMANCE DAS CONSULTAS
-- =================================================================
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX idx_meetings_date ON meetings(date);
