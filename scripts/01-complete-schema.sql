-- =====================================================
-- CEO SYNC - ESQUEMA COMPLETO DO BANCO DE DADOS
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TIPOS ENUM
-- =====================================================

-- Tipos para usuários
CREATE TYPE user_theme AS ENUM ('light', 'dark', 'auto');
CREATE TYPE user_level AS ENUM ('1', '2', '3', '4', '5');

-- Tipos para reuniões
CREATE TYPE meeting_type AS ENUM ('presencial', 'online', 'hibrida');
CREATE TYPE meeting_priority AS ENUM ('baixa', 'media', 'alta', 'critica');
CREATE TYPE participant_status AS ENUM ('convocado', 'convidado', 'opcional');
CREATE TYPE participant_response AS ENUM ('pendente', 'aceito', 'recusado', 'talvez');

-- Tipos para tarefas
CREATE TYPE task_status AS ENUM ('pendente', 'em_progresso', 'concluida', 'cancelada');
CREATE TYPE task_priority AS ENUM ('baixa', 'media', 'alta', 'critica');

-- Tipos para notificações
CREATE TYPE notification_type AS ENUM ('meeting', 'task', 'message', 'system', 'reminder', 'conflict');
CREATE TYPE notification_priority AS ENUM ('baixa', 'media', 'alta', 'critica');
CREATE TYPE delivery_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'dismissed');

-- Tipos para mensagens
CREATE TYPE message_type AS ENUM ('text', 'file', 'image', 'system');

-- Tipos para documentos
CREATE TYPE document_type AS ENUM ('pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'image');

-- Tipos para aprovações
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE workflow_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'cancelled');

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABELA: users
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    position VARCHAR(255) NOT NULL,
    level user_level NOT NULL DEFAULT '5',
    is_online BOOLEAN DEFAULT false,
    avatar_url TEXT,
    phone VARCHAR(20),
    department VARCHAR(100),
    
    -- Preferências do usuário
    preferences JSONB DEFAULT '{
        "theme": "light",
        "notifications": true,
        "emailSync": true,
        "calendarSync": true,
        "language": "pt-BR",
        "timezone": "America/Sao_Paulo"
    }'::jsonb,
    
    -- Configurações de notificação
    notification_settings JSONB DEFAULT '{
        "browser": true,
        "email": true,
        "sms": false,
        "types": {
            "meetings": true,
            "tasks": true,
            "messages": true,
            "conflicts": true,
            "system": true,
            "reminders": true
        },
        "schedule": {
            "enabled": true,
            "startTime": "08:00",
            "endTime": "18:00",
            "weekdays": [true, true, true, true, true, false, false]
        }
    }'::jsonb,
    
    last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_level CHECK (level IN ('1', '2', '3', '4', '5'))
);

-- =====================================================
-- TABELA: groups
-- =====================================================

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{
        "allowMemberInvite": false,
        "requireApproval": true,
        "visibility": "private"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: group_members
-- =====================================================

CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(group_id, user_id)
);

-- =====================================================
-- TABELA: meetings
-- =====================================================

CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    agenda TEXT,
    
    -- Data e horário
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Local e tipo
    location VARCHAR(500),
    type meeting_type NOT NULL DEFAULT 'presencial',
    meeting_link TEXT,
    
    -- Metadados
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    priority meeting_priority DEFAULT 'media',
    tags TEXT[] DEFAULT '{}',
    
    -- Status e configurações
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern JSONB,
    is_cancelled BOOLEAN DEFAULT false,
    cancellation_reason TEXT,
    
    -- Configurações da reunião
    settings JSONB DEFAULT '{
        "allowRecording": false,
        "requireConfirmation": true,
        "sendReminders": true,
        "reminderTimes": [15, 60, 1440]
    }'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_meeting_date CHECK (meeting_date >= CURRENT_DATE - INTERVAL '1 year'),
    CONSTRAINT valid_meeting_link CHECK (
        (type = 'online' AND meeting_link IS NOT NULL) OR 
        (type != 'online')
    )
);

-- =====================================================
-- TABELA: meeting_participants
-- =====================================================

CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status participant_status NOT NULL DEFAULT 'convidado',
    response participant_response DEFAULT 'pendente',
    response_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(meeting_id, user_id)
);

-- =====================================================
-- TABELA: tasks
-- =====================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Atribuição
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    
    -- Prazos e status
    due_date DATE,
    priority task_priority DEFAULT 'media',
    status task_status DEFAULT 'pendente',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Metadados
    tags TEXT[] DEFAULT '{}',
    estimated_hours INTEGER,
    actual_hours INTEGER,
    
    -- Datas importantes
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_progress CHECK (progress BETWEEN 0 AND 100),
    CONSTRAINT valid_completion CHECK (
        (status = 'concluida' AND completed_at IS NOT NULL) OR 
        (status != 'concluida' AND completed_at IS NULL)
    ),
    CONSTRAINT valid_hours CHECK (
        actual_hours IS NULL OR 
        estimated_hours IS NULL OR 
        actual_hours >= 0
    )
);

-- =====================================================
-- TABELA: messages
-- =====================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    type message_type DEFAULT 'text',
    
    -- Remetente e destinatário
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    
    -- Anexos e mídia
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Status da mensagem
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    
    -- Resposta a outra mensagem
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_recipient CHECK (
        (recipient_id IS NOT NULL AND group_id IS NULL) OR
        (recipient_id IS NULL AND group_id IS NOT NULL) OR
        (meeting_id IS NOT NULL)
    )
);

-- =====================================================
-- TABELA: documents
-- =====================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type document_type NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    
    -- Relacionamentos
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- Metadados
    tags TEXT[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT false,
    
    -- Controle de acesso
    access_permissions JSONB DEFAULT '{
        "canView": [],
        "canEdit": [],
        "canDelete": []
    }'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size > 0),
    CONSTRAINT valid_version CHECK (version > 0)
);

-- =====================================================
-- TABELA: notifications
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type notification_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    
    -- Destinatário
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Relacionamentos opcionais
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    
    -- Status e prioridade
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    priority notification_priority DEFAULT 'media',
    
    -- Status de entrega por canal
    delivery_status JSONB DEFAULT '{
        "browser": "pending",
        "email": "pending",
        "sms": "pending"
    }'::jsonb,
    
    -- Agendamento
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    -- Dados adicionais
    data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: notification_templates
-- =====================================================

CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type notification_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    priority notification_priority DEFAULT 'media',
    
    -- Configurações do template
    variables JSONB DEFAULT '[]'::jsonb,
    channels JSONB DEFAULT '{
        "browser": true,
        "email": false,
        "sms": false
    }'::jsonb,
    
    -- Metadados
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: notification_campaigns
-- =====================================================

CREATE TABLE notification_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id UUID REFERENCES notification_templates(id) ON DELETE CASCADE,
    custom_title TEXT,
    custom_message TEXT,
    
    -- Configurações da campanha
    target_users JSONB NOT NULL DEFAULT '[]'::jsonb,
    variables JSONB DEFAULT '{}'::jsonb,
    
    -- Agendamento
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    -- Status e estatísticas
    status VARCHAR(50) DEFAULT 'draft',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: approval_rules
-- =====================================================

CREATE TABLE approval_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Condições da regra
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Aprovadores
    approvers JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Configurações
    settings JSONB NOT NULL DEFAULT '{
        "allowSelfApproval": false,
        "requireSequentialApproval": false,
        "autoApproveAfterHours": null,
        "escalationEnabled": false
    }'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: approval_workflows
-- =====================================================

CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES notification_campaigns(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES approval_rules(id) ON DELETE SET NULL,
    status approval_status NOT NULL DEFAULT 'pending',

    -- Progresso
    current_step INT NOT NULL DEFAULT 1,
    total_steps INT NOT NULL,
    approvers JSONB,
    
    -- Status e decisão
    final_decision JSONB,
    
    -- Prazos
    due_date TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    
    -- Configurações específicas do workflow
    settings JSONB DEFAULT '{\n        "requireAllApprovers": false,\n        "allowParallelApproval": true,\n        "autoApproveAfterHours": null,\n        "escalationRules": []\n    }'::jsonb,
    
    -- Metadados
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_current_step CHECK (current_step >= 1 AND current_step <= total_steps)
);

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_campaigns_updated_at BEFORE UPDATE ON notification_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_rules_updated_at BEFORE UPDATE ON approval_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_is_online ON users(is_online);
CREATE INDEX idx_users_last_activity ON users(last_activity);

-- Índices para meetings
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);
CREATE INDEX idx_meetings_type ON meetings(type);
CREATE INDEX idx_meetings_priority ON meetings(priority);
CREATE INDEX idx_meetings_date_time ON meetings(meeting_date, start_time);

-- Índices para meeting_participants
CREATE INDEX idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user ON meeting_participants(user_id);
CREATE INDEX idx_meeting_participants_response ON meeting_participants(response);

-- Índices para tasks
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_meeting ON tasks(meeting_id);

-- Índices para messages
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_group ON messages(group_id);
CREATE INDEX idx_messages_meeting ON messages(meeting_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Índices para notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- Índices para documents
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_meeting ON documents(meeting_id);
CREATE INDEX idx_documents_task ON documents(task_id);
CREATE INDEX idx_documents_file_type ON documents(file_type);

-- Índices compostos para consultas complexas
CREATE INDEX idx_meetings_user_date ON meeting_participants(user_id, meeting_id) 
    INCLUDE (response, status);
CREATE INDEX idx_tasks_user_status ON tasks(assigned_to, status) 
    INCLUDE (priority, due_date);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) 
    WHERE is_read = false;

-- =====================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE meetings IS 'Reuniões agendadas no sistema';
COMMENT ON TABLE meeting_participants IS 'Participantes das reuniões';
COMMENT ON TABLE tasks IS 'Tarefas atribuídas aos usuários';
COMMENT ON TABLE messages IS 'Sistema de mensagens internas';
COMMENT ON TABLE notifications IS 'Notificações do sistema';
COMMENT ON TABLE documents IS 'Documentos anexados a reuniões e tarefas';
COMMENT ON TABLE groups IS 'Grupos de usuários';
COMMENT ON TABLE approval_workflows IS 'Fluxos de aprovação';
COMMENT ON TABLE approval_rules IS 'Regras de aprovação automática';

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir usuário administrador padrão
INSERT INTO users (name, email, position, level, preferences) VALUES 
('Administrador', 'admin@empresa.com', 'Administrador do Sistema', '1', 
 '{"theme": "light", "notifications": true, "emailSync": true, "calendarSync": true}'::jsonb);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- RLS Policies
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read meetings" ON meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow participants to read their meeting links" ON meeting_participants FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow users to manage their own tasks" ON tasks FOR ALL TO authenticated USING (assigned_to = auth.uid() OR created_by = auth.uid());
CREATE POLICY "Allow users to read their own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow admin users to manage all notifications" ON notifications FOR ALL TO authenticated USING (get_user_level(auth.uid()) <= 2) WITH CHECK (get_user_level(auth.uid()) <= 2);
CREATE POLICY "Allow authenticated users to read templates" ON notification_templates FOR SELECT TO authenticated USING (true);


-- Storage Policies
-- (Adicione aqui se necessário)
