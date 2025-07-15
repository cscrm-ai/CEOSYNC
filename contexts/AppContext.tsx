"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type {
  User,
  Meeting,
  Message,
  Notification,
  Group,
  Task,
  Document,
  Analytics,
  AIAssistant,
  NotificationTemplate,
  NotificationCampaign,
  ApprovalWorkflow,
  ApprovalRule,
} from "@/types"

interface AppContextType {
  currentUser: User | null
  users: User[]
  meetings: Meeting[]
  messages: Message[]
  notifications: Notification[]
  groups: Group[]
  tasks: Task[]
  documents: Document[]
  analytics: Analytics | null
  aiAssistant: AIAssistant
  notificationTemplates: NotificationTemplate[]
  notificationCampaigns: NotificationCampaign[]
  approvalWorkflows: ApprovalWorkflow[]
  approvalRules: ApprovalRule[]
  activeSection: string
  setCurrentUser: (user: User | null) => void
  setUsers: (users: User[]) => void
  setMeetings: (meetings: Meeting[]) => void
  setMessages: (messages: Message[]) => void
  setNotifications: (notifications: Notification[]) => void
  setGroups: (groups: Group[]) => void
  setTasks: (tasks: Task[]) => void
  setDocuments: (documents: Document[]) => void
  setAnalytics: (analytics: Analytics) => void
  setActiveSection: (section: string) => void
  addMeeting: (meeting: Meeting) => void
  addMessage: (message: Message) => void
  addNotification: (notification: Notification) => void
  addTask: (task: Task) => void
  addDocument: (document: Document) => void
  addNotificationTemplate: (template: NotificationTemplate) => void
  addNotificationCampaign: (campaign: NotificationCampaign) => void
  addApprovalWorkflow: (workflow: ApprovalWorkflow) => void
  addApprovalRule: (rule: ApprovalRule) => void
  markNotificationAsRead: (id: string) => void
  updateUser: (user: User) => void
  updateTask: (task: Task) => void
  updateNotificationTemplate: (template: NotificationTemplate) => void
  updateNotificationCampaign: (campaign: NotificationCampaign) => void
  updateApprovalWorkflow: (workflow: ApprovalWorkflow) => void
  updateApprovalRule: (rule: ApprovalRule) => void
  deleteUser: (id: string) => void
  deleteTask: (id: string) => void
  deleteNotificationTemplate: (id: string) => void
  deleteNotificationCampaign: (campaign: NotificationCampaign) => void
  deleteApprovalRule: (id: string) => void
  generateAISuggestions: () => void
  sendBulkNotification: (templateId: string, userIds: string[], variables?: Record<string, string>) => void
  approveWorkflow: (workflowId: string, approverId: string, comment?: string) => void
  rejectWorkflow: (workflowId: string, approverId: string, comment?: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Dados mock expandidos
const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@empresa.com",
    position: "CEO",
    level: 1,
    isOnline: true,
    preferences: { theme: "light", notifications: true, emailSync: true, calendarSync: true },
    lastActivity: new Date().toISOString(),
    notificationSettings: {
      browser: true,
      email: true,
      sms: false,
      types: {
        meetings: true,
        tasks: true,
        messages: true,
        conflicts: true,
        system: true,
        reminders: true,
      },
      schedule: {
        enabled: true,
        startTime: "08:00",
        endTime: "18:00",
        weekdays: [true, true, true, true, true, false, false],
      },
    },
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@empresa.com",
    position: "Diretora Financeira",
    level: 2,
    isOnline: true,
    preferences: { theme: "dark", notifications: true, emailSync: true, calendarSync: false },
    lastActivity: new Date(Date.now() - 300000).toISOString(),
    notificationSettings: {
      browser: true,
      email: true,
      sms: true,
      types: {
        meetings: true,
        tasks: true,
        messages: false,
        conflicts: true,
        system: false,
        reminders: true,
      },
      schedule: {
        enabled: true,
        startTime: "09:00",
        endTime: "17:00",
        weekdays: [true, true, true, true, true, false, false],
      },
    },
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@empresa.com",
    position: "Diretor de TI",
    level: 2,
    isOnline: false,
    preferences: { theme: "auto", notifications: false, emailSync: false, calendarSync: true },
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    notificationSettings: {
      browser: false,
      email: true,
      sms: false,
      types: {
        meetings: true,
        tasks: true,
        messages: false,
        conflicts: true,
        system: true,
        reminders: false,
      },
      schedule: {
        enabled: false,
        startTime: "08:00",
        endTime: "20:00",
        weekdays: [true, true, true, true, true, true, false],
      },
    },
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana@empresa.com",
    position: "Gerente de Vendas",
    level: 3,
    isOnline: true,
    preferences: { theme: "light", notifications: true, emailSync: true, calendarSync: true },
    lastActivity: new Date(Date.now() - 120000).toISOString(),
    notificationSettings: {
      browser: true,
      email: false,
      sms: false,
      types: {
        meetings: true,
        tasks: true,
        messages: true,
        conflicts: false,
        system: false,
        reminders: true,
      },
      schedule: {
        enabled: true,
        startTime: "08:30",
        endTime: "17:30",
        weekdays: [true, true, true, true, true, false, false],
      },
    },
  },
  {
    id: "5",
    name: "Carlos Lima",
    email: "carlos@empresa.com",
    position: "Gerente de RH",
    level: 3,
    isOnline: true,
    preferences: { theme: "light", notifications: true, emailSync: false, calendarSync: true },
    lastActivity: new Date(Date.now() - 600000).toISOString(),
    notificationSettings: {
      browser: true,
      email: true,
      sms: false,
      types: {
        meetings: true,
        tasks: true,
        messages: true,
        conflicts: true,
        system: true,
        reminders: true,
      },
      schedule: {
        enabled: true,
        startTime: "08:00",
        endTime: "18:00",
        weekdays: [true, true, true, true, true, false, false],
      },
    },
  },
  {
    id: "6",
    name: "Lucia Ferreira",
    email: "lucia@empresa.com",
    position: "Analista de Marketing",
    level: 4,
    isOnline: false,
    preferences: { theme: "dark", notifications: true, emailSync: true, calendarSync: false },
    lastActivity: new Date(Date.now() - 7200000).toISOString(),
    notificationSettings: {
      browser: false,
      email: true,
      sms: false,
      types: {
        meetings: true,
        tasks: true,
        messages: false,
        conflicts: false,
        system: false,
        reminders: true,
      },
      schedule: {
        enabled: true,
        startTime: "09:00",
        endTime: "17:00",
        weekdays: [true, true, true, true, true, false, false],
      },
    },
  },
  {
    id: "7",
    name: "Roberto Alves",
    email: "roberto@empresa.com",
    position: "Assistente Administrativo",
    level: 5,
    isOnline: true,
    preferences: { theme: "auto", notifications: false, emailSync: false, calendarSync: false },
    lastActivity: new Date(Date.now() - 180000).toISOString(),
    notificationSettings: {
      browser: true,
      email: false,
      sms: false,
      types: {
        meetings: true,
        tasks: true,
        messages: false,
        conflicts: false,
        system: false,
        reminders: false,
      },
      schedule: {
        enabled: true,
        startTime: "08:00",
        endTime: "17:00",
        weekdays: [true, true, true, true, true, false, false],
      },
    },
  },
]

const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Reunião de Diretoria",
    date: "2024-01-15",
    startTime: "09:00",
    endTime: "10:30",
    location: "Sala de Reuniões A",
    type: "presencial",
    createdBy: "1",
    participants: [
      { userId: "2", status: "convocado", response: "aceito" },
      { userId: "3", status: "convocado", response: "pendente" },
      { userId: "4", status: "convidado", response: "aceito" },
    ],
    agenda: "1. Resultados Q4\n2. Planejamento 2024\n3. Orçamento",
    tags: ["estrategia", "financeiro"],
    priority: "alta",
  },
  {
    id: "2",
    title: "Apresentação de Resultados Q4",
    date: "2024-01-16",
    startTime: "14:00",
    endTime: "15:30",
    location: "Online",
    type: "online",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    createdBy: "2",
    participants: [
      { userId: "1", status: "convidado", response: "aceito" },
      { userId: "4", status: "convocado", response: "pendente" },
      { userId: "6", status: "convocado", response: "aceito" },
    ],
    tags: ["resultados", "apresentacao"],
    priority: "media",
  },
]

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Preparar relatório financeiro Q4",
    description: "Compilar dados financeiros do último trimestre para apresentação",
    assignedTo: "2",
    createdBy: "1",
    meetingId: "1",
    dueDate: "2024-01-14",
    priority: "alta",
    status: "em_progresso",
    tags: ["financeiro", "relatorio"],
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    title: "Revisar proposta de orçamento 2024",
    description: "Analisar e aprovar proposta orçamentária para o próximo ano",
    assignedTo: "1",
    createdBy: "2",
    dueDate: "2024-01-20",
    priority: "critica",
    status: "pendente",
    tags: ["orcamento", "planejamento"],
    createdAt: "2024-01-11T14:30:00Z",
  },
  {
    id: "3",
    title: "Atualizar sistema de CRM",
    description: "Implementar novas funcionalidades no sistema de gestão de clientes",
    assignedTo: "3",
    createdBy: "4",
    dueDate: "2024-01-25",
    priority: "media",
    status: "pendente",
    tags: ["tecnologia", "crm"],
    createdAt: "2024-01-12T09:15:00Z",
  },
]

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "meeting",
    title: "Nova Reunião Agendada",
    message: "Você foi convocado para a Reunião de Diretoria",
    userId: "2",
    isRead: false,
    createdAt: "2024-01-10T10:00:00Z",
    meetingId: "1",
    priority: "alta",
    deliveryStatus: {
      browser: "delivered",
      email: "sent",
      sms: "pending",
    },
  },
  {
    id: "2",
    type: "task",
    title: "Nova Tarefa Atribuída",
    message: "Você recebeu uma nova tarefa: Preparar relatório financeiro Q4",
    userId: "2",
    isRead: false,
    createdAt: "2024-01-10T10:05:00Z",
    taskId: "1",
    priority: "alta",
    deliveryStatus: {
      browser: "delivered",
      email: "delivered",
      sms: "failed",
    },
  },
  {
    id: "3",
    type: "reminder",
    title: "Lembrete de Reunião",
    message: "Reunião de Diretoria em 1 hora",
    userId: "1",
    isRead: true,
    createdAt: "2024-01-15T08:00:00Z",
    meetingId: "1",
    priority: "media",
    deliveryStatus: {
      browser: "dismissed",
      email: "delivered",
      sms: "pending",
    },
  },
]

const mockAnalytics: Analytics = {
  meetingStats: {
    total: 45,
    thisMonth: 12,
    byType: { presencial: 28, online: 17 },
    byPriority: { baixa: 8, media: 22, alta: 12, critica: 3 },
    averageDuration: 75, // minutos
  },
  userStats: {
    participationRate: [
      { userId: "1", rate: 95 },
      { userId: "2", rate: 88 },
      { userId: "3", rate: 72 },
      { userId: "4", rate: 91 },
      { userId: "5", rate: 85 },
      { userId: "6", rate: 78 },
      { userId: "7", rate: 82 },
    ],
    responseTime: [
      { userId: "1", avgTime: 15 }, // minutos
      { userId: "2", avgTime: 32 },
      { userId: "3", avgTime: 125 },
      { userId: "4", avgTime: 28 },
      { userId: "5", avgTime: 45 },
      { userId: "6", avgTime: 67 },
      { userId: "7", avgTime: 89 },
    ],
    mostActive: [
      { userId: "1", activities: 156 },
      { userId: "4", activities: 134 },
      { userId: "2", activities: 128 },
      { userId: "5", activities: 98 },
      { userId: "3", activities: 87 },
      { userId: "6", activities: 76 },
      { userId: "7", activities: 65 },
    ],
  },
  communicationStats: {
    messagesCount: 1247,
    responseRate: 87.5,
    peakHours: [9, 10, 14, 15, 16],
  },
  notificationStats: {
    totalSent: 2847,
    deliveryRate: 94.2,
    openRate: 78.5,
    clickRate: 45.3,
    byChannel: { browser: 1520, email: 987, sms: 340 },
    byType: { meeting: 1284, task: 856, system: 427, message: 280 },
    failureReasons: { permission_denied: 45, network_error: 23, invalid_token: 12 },
  },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0])
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings)
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [groups, setGroups] = useState<Group[]>([])
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [documents, setDocuments] = useState<Document[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(mockAnalytics)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [aiAssistant, setAiAssistant] = useState<AIAssistant>({ suggestions: [] })
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([])
  const [notificationCampaigns, setNotificationCampaigns] = useState<NotificationCampaign[]>([])
  const [approvalWorkflows, setApprovalWorkflows] = useState<ApprovalWorkflow[]>([])
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([])

  const addMeeting = (meeting: Meeting) => {
    setMeetings((prev) => [...prev, meeting])
  }

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification])
  }

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task])
  }

  const addDocument = (document: Document) => {
    setDocuments((prev) => [...prev, document])
  }

  const addNotificationTemplate = (template: NotificationTemplate) => {
    setNotificationTemplates((prev) => [...prev, template])
  }

  const addNotificationCampaign = (campaign: NotificationCampaign) => {
    setNotificationCampaigns((prev) => [...prev, campaign])
  }

  const addApprovalWorkflow = (workflow: ApprovalWorkflow) => {
    setApprovalWorkflows((prev) => [...prev, workflow])
  }

  const addApprovalRule = (rule: ApprovalRule) => {
    setApprovalRules((prev) => [...prev, rule])
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const updateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
  }

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const updateNotificationTemplate = (updatedTemplate: NotificationTemplate) => {
    setNotificationTemplates((prev) =>
      prev.map((template) => (template.id === updatedTemplate.id ? updatedTemplate : template)),
    )
  }

  const updateNotificationCampaign = (updatedCampaign: NotificationCampaign) => {
    setNotificationCampaigns((prev) =>
      prev.map((campaign) => (campaign.id === updatedCampaign.id ? updatedCampaign : campaign)),
    )
  }

  const updateApprovalWorkflow = (updatedWorkflow: ApprovalWorkflow) => {
    setApprovalWorkflows((prev) =>
      prev.map((workflow) => (workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow)),
    )
  }

  const updateApprovalRule = (updatedRule: ApprovalRule) => {
    setApprovalRules((prev) => prev.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)))
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const deleteNotificationTemplate = (id: string) => {
    setNotificationTemplates((prev) => prev.filter((template) => template.id !== id))
  }

  const deleteNotificationCampaign = (id: string) => {
    setNotificationCampaigns((prev) => prev.filter((campaign) => campaign.id !== id))
  }

  const deleteApprovalRule = (id: string) => {
    setApprovalRules((prev) => prev.filter((rule) => rule.id !== id))
  }

  const sendBulkNotification = (templateId: string, userIds: string[], variables: Record<string, string> = {}) => {
    const template = notificationTemplates.find((t) => t.id === templateId)
    if (!template || !currentUser) return

    userIds.forEach((userId) => {
      let title = template.title
      let message = template.message

      // Substituir variáveis
      Object.entries(variables).forEach(([key, value]) => {
        title = title.replace(new RegExp(`{${key}}`, "g"), value)
        message = message.replace(new RegExp(`{${key}}`, "g"), value)
      })

      const notification: Notification = {
        id: `${Date.now()}_${userId}`,
        type: template.type,
        title,
        message,
        userId,
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: template.priority,
        deliveryStatus: {
          browser: "pending",
          email: "pending",
          sms: "pending",
        },
      }

      addNotification(notification)
    })
  }

  const generateAISuggestions = () => {
    // Simulação de IA gerando sugestões
    const suggestions = [
      {
        id: "1",
        type: "meeting_time" as const,
        title: "Horário Otimizado Sugerido",
        description: "Baseado na agenda dos participantes, 14:30 seria o melhor horário",
        confidence: 0.85,
        data: { suggestedTime: "14:30", participants: ["1", "2", "3"] },
      },
      {
        id: "2",
        type: "optimization" as const,
        title: "Reuniões Consecutivas Detectadas",
        description: "Você tem 3 reuniões seguidas. Considere reagendar uma delas",
        confidence: 0.92,
        data: { meetingIds: ["1", "2", "3"] },
      },
    ]

    setAiAssistant({ suggestions })
  }

  const approveWorkflow = (workflowId: string, approverId: string, comment?: string) => {
    setApprovalWorkflows((prev) =>
      prev.map((workflow) => {
        if (workflow.id === workflowId) {
          const updatedApprovers = workflow.approvers.map((approver) =>
            approver.userId === approverId
              ? {
                  ...approver,
                  status: "approved" as const,
                  comment,
                  approvedAt: new Date().toISOString(),
                }
              : approver,
          )

          const allApproved = updatedApprovers.every((a) => a.status === "approved")
          const newStatus = allApproved ? "approved" : "pending"

          return {
            ...workflow,
            approvers: updatedApprovers,
            status: newStatus,
            finalDecision: allApproved
              ? {
                  status: "approved" as const,
                  decidedBy: approverId,
                  decidedAt: new Date().toISOString(),
                  comment,
                }
              : undefined,
          }
        }
        return workflow
      }),
    )
  }

  const rejectWorkflow = (workflowId: string, approverId: string, comment?: string) => {
    setApprovalWorkflows((prev) =>
      prev.map((workflow) => {
        if (workflow.id === workflowId) {
          const updatedApprovers = workflow.approvers.map((approver) =>
            approver.userId === approverId
              ? {
                  ...approver,
                  status: "rejected" as const,
                  comment,
                  approvedAt: new Date().toISOString(),
                }
              : approver,
          )

          return {
            ...workflow,
            approvers: updatedApprovers,
            status: "rejected",
            finalDecision: {
              status: "rejected" as const,
              decidedBy: approverId,
              decidedAt: new Date().toISOString(),
              comment,
            },
          }
        }
        return workflow
      }),
    )
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        meetings,
        messages,
        notifications,
        groups,
        tasks,
        documents,
        analytics,
        aiAssistant,
        notificationTemplates,
        notificationCampaigns,
        approvalWorkflows,
        approvalRules,
        activeSection,
        setCurrentUser,
        setUsers,
        setMeetings,
        setMessages,
        setNotifications,
        setGroups,
        setTasks,
        setDocuments,
        setAnalytics,
        setActiveSection,
        addMeeting,
        addMessage,
        addNotification,
        addTask,
        addDocument,
        addNotificationTemplate,
        addNotificationCampaign,
        addApprovalWorkflow,
        addApprovalRule,
        markNotificationAsRead,
        updateUser,
        updateTask,
        updateNotificationTemplate,
        updateNotificationCampaign,
        updateApprovalWorkflow,
        updateApprovalRule,
        deleteUser,
        deleteTask,
        deleteNotificationTemplate,
        deleteNotificationCampaign,
        deleteApprovalRule,
        generateAISuggestions,
        sendBulkNotification,
        approveWorkflow,
        rejectWorkflow,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
