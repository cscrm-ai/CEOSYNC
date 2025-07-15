export interface User {
  id: string
  name: string
  email: string
  position: string
  level: 1 | 2 | 3 | 4 | 5
  isOnline: boolean
  avatar?: string
  preferences: {
    theme: "light" | "dark" | "auto"
    notifications: boolean
    emailSync: boolean
    calendarSync: boolean
  }
  lastActivity: string
  notificationSettings: {
    browser: boolean
    email: boolean
    sms: boolean
    types: {
      meetings: boolean
      tasks: boolean
      messages: boolean
      conflicts: boolean
      system: boolean
      reminders: boolean
    }
    schedule: {
      enabled: boolean
      startTime: string
      endTime: string
      weekdays: boolean[]
    }
  }
}

export interface Meeting {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  type: "presencial" | "online"
  meetingLink?: string
  createdBy: string
  participants: {
    userId: string
    status: "convocado" | "convidado"
    response?: "aceito" | "recusado" | "pendente"
    justification?: string
  }[]
  agenda?: string
  notes?: string
  recording?: string
  tags: string[]
  priority: "baixa" | "media" | "alta" | "critica"
  recurring?: {
    type: "daily" | "weekly" | "monthly"
    interval: number
    endDate?: string
  }
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  createdBy: string
  meetingId?: string
  dueDate: string
  priority: "baixa" | "media" | "alta" | "critica"
  status: "pendente" | "em_progresso" | "concluida" | "cancelada"
  tags: string[]
  createdAt: string
  completedAt?: string
}

export interface Message {
  id: string
  senderId: string
  receiverId?: string
  groupId?: string
  content: string
  createdAt: string
  isRead: boolean
  type: "text" | "file" | "image" | "voice"
  fileUrl?: string
  replyTo?: string
  reactions: { userId: string; emoji: string }[]
}

export interface Notification {
  id: string
  type: "conflict" | "meeting" | "message" | "system" | "task" | "reminder"
  title: string
  message: string
  userId: string
  isRead: boolean
  createdAt: string
  actionRequired?: boolean
  meetingId?: string
  taskId?: string
  campaignId?: string
  createdBy?: string
  priority: "baixa" | "media" | "alta"
  deliveryStatus: {
    browser: "pending" | "delivered" | "failed" | "dismissed"
    email: "pending" | "sent" | "delivered" | "failed"
    sms: "pending" | "sent" | "delivered" | "failed"
  }
  scheduledFor?: string
  expiresAt?: string
}

export interface NotificationTemplate {
  id: string
  name: string
  type: Notification["type"]
  title: string
  message: string
  priority: "baixa" | "media" | "alta"
  channels: ("browser" | "email" | "sms")[]
  conditions: {
    userLevels: number[]
    departments: string[]
    timeBeforeEvent?: number
  }
  isActive: boolean
  createdBy: string
  createdAt: string
}

export interface NotificationCampaign {
  id: string
  name: string
  description: string
  templateId?: string
  customTitle?: string
  customMessage?: string
  targetUsers: string[]
  scheduledFor: string
  status: "draft" | "pending_approval" | "approved" | "rejected" | "scheduled" | "sending" | "completed" | "cancelled"
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    failed: number
  }
  createdBy: string
  createdAt: string
  approvalWorkflow?: ApprovalWorkflow
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
}

export interface ApprovalWorkflow {
  id: string
  campaignId: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  requestedBy: string
  requestedAt: string
  approvers: {
    userId: string
    status: "pending" | "approved" | "rejected"
    comment?: string
    approvedAt?: string
    order: number
  }[]
  currentStep: number
  totalSteps: number
  finalDecision?: {
    status: "approved" | "rejected"
    decidedBy: string
    decidedAt: string
    comment?: string
  }
  settings: {
    requireAllApprovers: boolean
    allowParallelApproval: boolean
    autoApproveAfterHours?: number
    escalationRules?: {
      afterHours: number
      escalateTo: string[]
    }[]
  }
}

export interface ApprovalRule {
  id: string
  name: string
  description: string
  conditions: {
    campaignTypes: string[]
    targetUserCount: {
      min?: number
      max?: number
    }
    priority: ("baixa" | "media" | "alta")[]
    channels: ("browser" | "email" | "sms")[]
    createdByLevels: number[]
  }
  approvers: {
    userIds?: string[]
    levels?: number[]
    departments?: string[]
    minApprovers: number
    requireAll: boolean
  }
  settings: {
    allowSelfApproval: boolean
    requireSequentialApproval: boolean
    autoApproveAfterHours?: number
    escalationEnabled: boolean
  }
  isActive: boolean
  createdBy: string
  createdAt: string
}

export interface Group {
  id: string
  name: string
  description: string
  members: string[]
  createdBy: string
  createdAt: string
  type: "departamento" | "projeto" | "temporario"
  isPrivate: boolean
}

export interface Document {
  id: string
  title: string
  content: string
  createdBy: string
  meetingId?: string
  lastModified: string
  version: number
  collaborators: string[]
  type: "ata" | "documento" | "apresentacao"
}

export interface Analytics {
  meetingStats: {
    total: number
    thisMonth: number
    byType: Record<string, number>
    byPriority: Record<string, number>
    averageDuration: number
  }
  userStats: {
    participationRate: { userId: string; rate: number }[]
    responseTime: { userId: string; avgTime: number }[]
    mostActive: { userId: string; activities: number }[]
  }
  communicationStats: {
    messagesCount: number
    responseRate: number
    peakHours: number[]
  }
  notificationStats: {
    totalSent: number
    deliveryRate: number
    openRate: number
    clickRate: number
    byChannel: Record<string, number>
    byType: Record<string, number>
    failureReasons: Record<string, number>
  }
}

export interface AIAssistant {
  suggestions: {
    id: string
    type: "meeting_time" | "participant" | "location" | "optimization"
    title: string
    description: string
    confidence: number
    data: any
  }[]
}

export const LEVEL_COLORS = {
  1: "bg-red-500 text-white", // CEO
  2: "bg-orange-500 text-white", // Diretores
  3: "bg-yellow-500 text-white", // Gerentes
  4: "bg-green-500 text-white", // Analistas
  5: "bg-blue-500 text-white", // Assistentes
}

export const LEVEL_NAMES = {
  1: "CEO",
  2: "Diretor",
  3: "Gerente",
  4: "Analista",
  5: "Assistente",
}

export const PRIORITY_COLORS = {
  baixa: "bg-gray-100 text-gray-800",
  media: "bg-blue-100 text-blue-800",
  alta: "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800",
}

export const TASK_STATUS_COLORS = {
  pendente: "bg-gray-100 text-gray-800",
  em_progresso: "bg-blue-100 text-blue-800",
  concluida: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
}

export const NOTIFICATION_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  dismissed: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
}
