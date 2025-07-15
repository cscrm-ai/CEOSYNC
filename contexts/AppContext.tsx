"use client"

import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
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
  setActiveSection: (section: string) => void
  addMeeting: (
    meeting: Omit<Meeting, "id">,
    conflicts: { userId: string; conflictingMeeting: Meeting }[],
  ) => Promise<Meeting | null>
  updateMeeting: (meeting: Meeting) => Promise<void>
  deleteMeeting: (id: string) => Promise<void>
  addMessage: (message: Omit<Message, "id" | "createdAt" | "isRead" | "reactions">) => Promise<void>
  addNotification: (notification: Notification) => void
  addTask: (task: Omit<Task, "id" | "createdAt" | "completedAt">) => Promise<Task | null>
  addDocument: (document: Document) => void
  addNotificationTemplate: (template: Omit<NotificationTemplate, "id" | "createdBy" | "createdAt">) => Promise<void>
  addNotificationCampaign: (
    campaign: Omit<NotificationCampaign, "id" | "createdBy" | "createdAt" | "status" | "stats">,
  ) => Promise<void>
  addApprovalWorkflow: (workflow: ApprovalWorkflow) => void
  addApprovalRule: (rule: Omit<ApprovalRule, "id" | "createdBy" | "createdAt">) => Promise<void>
  markNotificationAsRead: (id: string) => void
  updateUser: (user: User) => Promise<void>
  updateTask: (task: Task) => Promise<void>
  updateNotificationTemplate: (template: NotificationTemplate) => Promise<void>
  updateNotificationCampaign: (campaign: NotificationCampaign) => Promise<void>
  updateApprovalWorkflow: (workflow: ApprovalWorkflow) => void
  updateApprovalRule: (rule: ApprovalRule) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  deleteNotificationTemplate: (id: string) => Promise<void>
  deleteNotificationCampaign: (id: string) => Promise<void>
  deleteApprovalRule: (id: string) => Promise<void>
  generateAISuggestions: () => void
  sendBulkNotification: (templateId: string, userIds: string[], variables?: Record<string, string>) => void
  approveWorkflow: (workflowId: string, approverId: string, comment?: string) => void
  rejectWorkflow: (workflowId: string, approverId: string, comment?: string) => void
  executeNotificationCampaign: (campaignId: string) => Promise<void>
  findMeetingConflicts: (
    date: string,
    startTime: string,
    endTime: string,
    participantIds: string[],
    excludeMeetingId?: string,
  ) => Promise<{ userId: string; conflictingMeeting: Meeting }[]>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth() // Usuário do Supabase Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null) // Usuário do public.users
  const [users, setUsers] = useState<User[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeSection, setActiveSection] = useState("dashboard")
  const [aiAssistant, setAiAssistant] = useState<AIAssistant>({ suggestions: [] })
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([])
  const [notificationCampaigns, setNotificationCampaigns] = useState<NotificationCampaign[]>([])
  const [approvalWorkflows, setApprovalWorkflows] = useState<ApprovalWorkflow[]>([])
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([])

  const executeNotificationCampaign = async (campaignId: string) => {
    if (!currentUser) return

    const campaign = notificationCampaigns.find((c) => c.id === campaignId)
    if (!campaign) {
      console.error("Campaign not found")
      // TODO: Add user-facing error (toast)
      return
    }

    let notificationContent: { title: string; message: string; type: Notification["type"]; priority: Notification["priority"] }

    if (campaign.customTitle && campaign.customMessage) {
      // Use custom content if available
      notificationContent = {
        title: campaign.customTitle,
        message: campaign.customMessage,
        type: "system", // Default type for custom campaigns
        priority: "media", // Default priority
      }
    } else if (campaign.templateId) {
      // Fallback to template
      const template = notificationTemplates.find((t) => t.id === campaign.templateId)
      if (!template) {
        console.error("Template not found for campaign")
        // TODO: Add user-facing error (toast)
        return
      }
      notificationContent = template
    } else {
      console.error("Campaign has neither custom content nor a template.")
      alert(`A campanha "${campaign.name}" está mal configurada e não pode ser enviada.`)
      return
    }

    // Allow execution for approved campaigns or scheduled ones (for manual trigger)
    if (campaign.status !== "approved" && campaign.status !== "scheduled") {
      console.error("Campaign is not in a state to be executed.", campaign.status)
      alert(`A campanha "${campaign.name}" não pode ser executada pois seu status é "${campaign.status}".`)
      return
    }

    // 1. Update campaign status to 'sending'
    await supabase.from("notification_campaigns").update({ status: "sending" }).eq("id", campaignId)
    fetchNotificationCampaigns() // Optimistic update in UI

    try {
      // 2. Prepare notifications for each target user
      const notificationsToInsert = campaign.targetUsers.map((userId) => {
        const targetUser = users.find((u) => u.id === userId)
        const userName = targetUser?.name || "Usuário"

        // Basic variable substitution
        const title = notificationContent.title.replace(/{userName}/g, userName)
        const message = notificationContent.message.replace(/{userName}/g, userName)

        return {
          user_id: userId,
          type: notificationContent.type,
          title: title,
          message: message,
          priority: notificationContent.priority,
          created_by: currentUser.id,
          campaign_id: campaignId,
          delivery_status: { browser: "pending", email: "pending", sms: "pending" },
        }
      })

      if (notificationsToInsert.length === 0) {
        console.warn("No users to notify for this campaign.")
        // Update status to completed with 0 sent
        await supabase
          .from("notification_campaigns")
          .update({ status: "completed", stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 } })
          .eq("id", campaignId)
        fetchNotificationCampaigns()
        return
      }

      // 3. Bulk insert notifications
      const { data: insertedNotifications, error: insertError } = await supabase
        .from("notifications")
        .insert(notificationsToInsert)
        .select("id")

      if (insertError) {
        throw insertError
      }

      // 4. Update campaign status to 'completed' and update stats
      const stats = {
        sent: insertedNotifications?.length || 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: notificationsToInsert.length - (insertedNotifications?.length || 0),
      }

      await supabase
        .from("notification_campaigns")
        .update({ status: "completed", stats: stats, sent_at: new Date().toISOString() })
        .eq("id", campaignId)

      alert(`Campanha "${campaign.name}" enviada com sucesso para ${stats.sent} usuários.`)
    } catch (error: any) {
      console.error("Error executing notification campaign:", error)
      alert(`Erro ao executar a campanha: ${error.message}`)
      // Revert campaign status on failure
      await supabase.from("notification_campaigns").update({ status: "approved" }).eq("id", campaignId)
    } finally {
      // 5. Refresh data from DB
      fetchNotificationCampaigns()
      fetchNotifications()
    }
  }

  const fetchUsers = useCallback(async () => {
    const { data: usersData, error } = await supabase.from("users").select("*")

    if (error) {
      console.error("Error fetching users:", error)
      setUsers([])
      return
    }

    const mappedUsers = usersData.map(
      (user) =>
        ({
          id: user.id,
          name: user.name,
          email: user.email,
          position: user.position,
          level: user.level,
          isOnline: user.is_online,
          avatar: user.avatar_url,
          preferences: user.preferences,
          lastActivity: user.last_activity,
          notificationSettings: user.notification_settings,
        }) as User,
    )

    setUsers(mappedUsers)

    if (authUser) {
      const fullCurrentUser = mappedUsers.find((u) => u.id === authUser.id)
      setCurrentUser(fullCurrentUser || null)
    }
  }, [authUser])

  const fetchNotificationTemplates = useCallback(async () => {
    const { data: templatesData, error } = await supabase.from("notification_templates").select(`
        id, name, type, title, message, priority, channels, conditions,
        isActive:is_active, createdBy:created_by, createdAt:created_at
      `)

    if (error) {
      console.error("Error fetching notification templates:", error)
      setNotificationTemplates([])
      return
    }
    setNotificationTemplates(templatesData as NotificationTemplate[])
  }, [])

  const fetchMeetings = useCallback(async () => {
    const { data: meetingsData, error } = await supabase.from("meetings").select(`
        id,
        title,
        date,
        startTime:start_time,
        endTime:end_time,
        location,
        type,
        meetingLink:meeting_link,
        createdBy:created_by,
        agenda,
        tags,
        priority,
        participants:meeting_participants (
          userId:user_id,
          status,
          response
        )
      `)

    if (error) {
      console.error("Error fetching meetings:", error)
      setMeetings([])
      return
    }

    setMeetings(meetingsData as Meeting[])
  }, [])

  const fetchTasks = useCallback(async () => {
    const { data: tasksData, error } = await supabase.from("tasks").select(`
        id,
        title,
        description,
        assignedTo:assigned_to,
        createdBy:created_by,
        meetingId:meeting_id,
        dueDate:due_date,
        priority,
        status,
        tags,
        createdAt:created_at,
        completedAt:completed_at
      `)

    if (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
      return
    }

    setTasks(tasksData as Task[])
  }, [])

  const fetchMessages = useCallback(async () => {
    if (!currentUser) return
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
      return
    }

    const mappedMessages = data.map(
      (msg) =>
        ({
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.recipient_id,
          groupId: msg.group_id,
          content: msg.content,
          createdAt: msg.created_at,
          isRead: msg.is_read,
          type: msg.type,
          fileUrl: msg.file_url,
          replyTo: msg.reply_to,
          reactions: msg.reactions || [],
        }) as Message,
    )
    setMessages(mappedMessages)
  }, [currentUser])

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching notifications:", error)
      setNotifications([])
      return
    }
    const mappedNotifications = data.map(
      (n) =>
        ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          userId: n.user_id,
          isRead: n.is_read,
          createdAt: n.created_at,
          actionRequired: n.action_required,
          meetingId: n.meeting_id,
          taskId: n.task_id,
          priority: n.priority,
          deliveryStatus: n.delivery_status,
          scheduledFor: n.scheduled_for,
          expiresAt: n.expires_at,
        }) as Notification,
    )
    setNotifications(mappedNotifications)
  }, [currentUser])

  const fetchNotificationCampaigns = useCallback(async () => {
    const { data, error } = await supabase.from("notification_campaigns").select(`
        id, name, description, templateId:template_id, targetUsers:target_users,
        scheduledFor:scheduled_for, status, requiresApproval:requires_approval,
        approvedBy:approved_by, approvedAt:approved_at, stats, createdBy:created_by,
        createdAt:created_at, rejectionReason:rejection_reason, rejectedBy:rejected_by,
        rejectedAt:rejected_at
    `)
    if (error) {
      console.error("Error fetching notification campaigns:", error.message)
      setNotificationCampaigns([])
      return
    }
    setNotificationCampaigns(data as NotificationCampaign[])
  }, [])

  const fetchApprovalWorkflows = useCallback(async () => {
    const { data, error } = await supabase.from("approval_workflows").select(`
        id, campaignId:campaign_id, status, requestedBy:requested_by,
        requestedAt:requested_at, approvers, currentStep:current_step,
        totalSteps:total_steps, finalDecision:final_decision, settings
    `)
    if (error) {
      console.error("Error fetching approval workflows:", error.message)
      setApprovalWorkflows([])
      return
    }
    setApprovalWorkflows(data as ApprovalWorkflow[])
  }, [])

  const fetchApprovalRules = useCallback(async () => {
    const { data, error } = await supabase.from("approval_rules").select(`
        id, name, description, conditions, approvers, settings,
        isActive:is_active, createdBy:created_by, createdAt:created_at
    `)
    if (error) {
      console.error("Error fetching approval rules:", error.message)
      setApprovalRules([])
      return
    }
    setApprovalRules(data as ApprovalRule[])
  }, [])

  const findMeetingConflicts = async (
    date: string,
    startTime: string,
    endTime: string,
    participantIds: string[],
    excludeMeetingId?: string,
  ): Promise<{ userId: string; conflictingMeeting: Meeting }[]> => {
    if (participantIds.length === 0) return []

    const { data: participantMeetings, error } = await supabase
      .from("meeting_participants")
      .select(
        `
        userId:user_id,
        meeting:meetings!inner(
          id,
          title,
          date,
          startTime:start_time,
          endTime:end_time
        )
      `,
      )
      .in("user_id", participantIds)
      .eq("meetings.date", date)
      .lt("meetings.start_time", endTime)
      .gt("meetings.end_time", startTime)

    if (error) {
      console.error("Error finding meeting conflicts:", error)
      return []
    }

    const conflicts: { userId: string; conflictingMeeting: Meeting }[] = []
    participantMeetings.forEach((pm: any) => {
      // Exclui o próprio meeting que está sendo editado da verificação
      if (excludeMeetingId && pm.meeting.id === excludeMeetingId) {
        return
      }
      conflicts.push({ userId: pm.userId, conflictingMeeting: pm.meeting as Meeting })
    })

    return conflicts
  }

  useEffect(() => {
    if (authUser) {
      fetchUsers()
    }
  }, [authUser, fetchUsers])

  useEffect(() => {
    if (currentUser) {
      fetchMeetings()
      fetchTasks()
      fetchMessages()
      fetchNotifications()
      fetchNotificationCampaigns()
      fetchApprovalWorkflows()
      fetchApprovalRules()
      fetchNotificationTemplates()
    }
  }, [
    currentUser,
    fetchMeetings,
    fetchTasks,
    fetchMessages,
    fetchNotifications,
    fetchNotificationCampaigns,
    fetchApprovalWorkflows,
    fetchApprovalRules,
    fetchNotificationTemplates,
  ])

  // Real-time messages subscription
  useEffect(() => {
    if (!currentUser?.id) return

    const handleNewMessage = (payload: any) => {
      const newMessage = {
        id: payload.new.id,
        senderId: payload.new.sender_id,
        receiverId: payload.new.recipient_id,
        groupId: payload.new.group_id,
        content: payload.new.content,
        createdAt: payload.new.created_at,
        isRead: payload.new.is_read,
        type: payload.new.type,
        fileUrl: payload.new.file_url,
        replyTo: payload.new.reply_to,
        reactions: payload.new.reactions || [],
      } as Message

      // Add only if the current user is sender or receiver to avoid duplicates and irrelevant messages
      if (newMessage.senderId === currentUser.id || newMessage.receiverId === currentUser.id) {
        setMessages((prevMessages) => {
          if (prevMessages.find((m) => m.id === newMessage.id)) {
            return prevMessages
          }
          return [...prevMessages, newMessage]
        })
      }
    }

    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        handleNewMessage,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser?.id])

  const addMeeting = async (
    meeting: Omit<Meeting, "id">,
    conflicts: { userId: string; conflictingMeeting: Meeting }[],
  ): Promise<Meeting | null> => {
    if (!currentUser) {
      console.error("addMeeting failed: Current user is not defined")
      return null
    }

    const meetingPayload = {
      title: meeting.title,
      date: meeting.date,
      start_time: meeting.startTime,
      end_time: meeting.endTime,
      location: meeting.location,
      type: meeting.type,
      meeting_link: meeting.meetingLink,
      created_by: currentUser.id,
      agenda: meeting.agenda,
      tags: meeting.tags,
      priority: meeting.priority,
    }

    const { data: newMeetingData, error: meetingError } = await supabase
      .from("meetings")
      .insert(meetingPayload)
      .select()
      .single()

    if (meetingError) {
      console.error("Error creating meeting in Supabase:", meetingError)
      alert(`Erro ao criar a reunião: ${meetingError.message}`)
      return null
    }

    if (newMeetingData && meeting.participants.length > 0) {
      const participantsData = meeting.participants.map((p) => ({
        meeting_id: newMeetingData.id,
        user_id: p.userId,
        status: p.status,
      }))

      const { error: participantsError } = await supabase.from("meeting_participants").insert(participantsData)

      if (participantsError) {
        console.error("Error adding meeting participants to Supabase:", participantsError)
        alert(`Erro ao adicionar participantes: ${participantsError.message}`)
        await supabase.from("meetings").delete().eq("id", newMeetingData.id)
        return null
      }
    }

    const createdMeeting = newMeetingData as Meeting

    if (createdMeeting) {
      // Notificar participantes normais
      const participantsWithoutConflict = meeting.participants.filter(
        (p) => !conflicts.some((c) => c.userId === p.userId),
      )

      participantsWithoutConflict.forEach((participant) => {
        addNotification({
          id: Date.now().toString() + participant.userId,
          type: "meeting",
          title: "Nova Reunião Agendada",
          message: `Você foi ${participant.status} para: ${meeting.title}`,
          userId: participant.userId,
          isRead: false,
          createdAt: new Date().toISOString(),
          meetingId: createdMeeting.id,
          priority: "media",
          deliveryStatus: { browser: "pending", email: "pending", sms: "pending" },
        })
      })

      // Notificar sobre conflitos
      conflicts.forEach((conflict) => {
        const subordinate = users.find((u) => u.id === conflict.userId)
        if (!subordinate) return

        // Notificação para o subordinado
        addNotification({
          id: `conflict_sub_${createdMeeting.id}_${conflict.userId}`,
          type: "conflict",
          title: "Conflito de Agendamento Forçado",
          message: `${currentUser.name} agendou a reunião "${createdMeeting.title}" que conflita com "${conflict.conflictingMeeting.title}". Sua presença é requerida na nova reunião. Por favor, justifique sua ausência na outra.`,
          userId: conflict.userId,
          isRead: false,
          createdAt: new Date().toISOString(),
          meetingId: createdMeeting.id,
          priority: "alta",
          actionRequired: true,
          deliveryStatus: { browser: "pending", email: "pending", sms: "pending" },
        })

        // Notificação para o superior (criador da reunião)
        addNotification({
          id: `conflict_sup_${createdMeeting.id}_${conflict.userId}`,
          type: "conflict",
          title: "Conflito de Agenda Gerado",
          message: `Você agendou a reunião "${createdMeeting.title}" que conflita com a agenda de ${subordinate.name}.`,
          userId: currentUser.id,
          isRead: false,
          createdAt: new Date().toISOString(),
          meetingId: createdMeeting.id,
          priority: "media",
          deliveryStatus: { browser: "pending", email: "pending", sms: "pending" },
        })
      })
    }

    fetchMeetings()
    return createdMeeting
  }

  const updateMeeting = async (meeting: Meeting) => {
    const { error: participantsError } = await supabase
      .from("meeting_participants")
      .delete()
      .eq("meeting_id", meeting.id)

    if (participantsError) {
      console.error("Error deleting old participants:", participantsError.message)
      return
    }

    const participantsData = meeting.participants.map((p) => ({
      meeting_id: meeting.id,
      user_id: p.userId,
      status: p.status,
    }))

    if (participantsData.length > 0) {
      const { error: insertParticipantsError } = await supabase.from("meeting_participants").insert(participantsData)
      if (insertParticipantsError) {
        console.error("Error inserting new participants:", insertParticipantsError.message)
        return
      }
    }

    const { error: meetingError } = await supabase
      .from("meetings")
      .update({
        title: meeting.title,
        date: meeting.date,
        start_time: meeting.startTime,
        end_time: meeting.endTime,
        location: meeting.location,
        type: meeting.type,
        meeting_link: meeting.meetingLink,
        agenda: meeting.agenda,
        tags: meeting.tags,
        priority: meeting.priority,
      })
      .eq("id", meeting.id)

    if (meetingError) {
      console.error("Error updating meeting:", meetingError.message)
      return
    }

    fetchMeetings()
  }

  const deleteMeeting = async (id: string) => {
    // Participants are deleted by cascade in the DB
    const { error } = await supabase.from("meetings").delete().eq("id", id)

    if (error) {
      console.error("Error deleting meeting:", error.message)
      return
    }

    fetchMeetings()
  }

  const addMessage = async (message: Omit<Message, "id" | "createdAt" | "isRead" | "reactions">) => {
    const { error } = await supabase.from("messages").insert({
      sender_id: message.senderId,
      recipient_id: message.receiverId,
      group_id: message.groupId,
      content: message.content,
      type: message.type,
      file_url: message.fileUrl,
      reply_to: message.replyTo,
    })

    if (error) {
      console.error("Error sending message:", error)
      alert(`Erro ao enviar mensagem: ${error.message}`)
    }
  }

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification])
  }

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "completedAt">): Promise<Task | null> => {
    const { data: newTaskData, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: task.title,
          description: task.description,
          assigned_to: task.assignedTo,
          created_by: task.createdBy,
          meeting_id: task.meetingId,
          due_date: task.dueDate,
          priority: task.priority,
          status: task.status,
          tags: task.tags,
        },
      ])
      .select(
        `
        id,
        title,
        description,
        assignedTo:assigned_to,
        createdBy:created_by,
        meetingId:meeting_id,
        dueDate:due_date,
        priority,
        status,
        tags,
        createdAt:created_at,
        completedAt:completed_at
    `,
      )
      .single()

    if (error) {
      console.error("Error adding task:", error.message)
      alert(`Erro ao criar tarefa: ${error.message}`)
      return null
    }

    if (newTaskData) {
      addNotification({
        id: `task-notif-${newTaskData.id}`,
        type: "task",
        title: "Nova Tarefa Atribuída",
        message: `Você foi designado para a tarefa: "${newTaskData.title}"`,
        userId: newTaskData.assignedTo,
        isRead: false,
        createdAt: new Date().toISOString(),
        taskId: newTaskData.id,
        priority: newTaskData.priority === "critica" ? "alta" : "media",
        deliveryStatus: {
          browser: "pending",
          email: "pending",
          sms: "pending",
        },
      })
    }

    fetchTasks()
    return newTaskData as Task
  }

  const addDocument = (document: Document) => {
    setDocuments((prev) => [...prev, document])
  }

  const addNotificationTemplate = async (template: Omit<NotificationTemplate, "id" | "createdBy" | "createdAt">) => {
    if (!currentUser) return
    const { data, error } = await supabase
      .from("notification_templates")
      .insert([
        {
          name: template.name,
          type: template.type,
          title: template.title,
          message: template.message,
          priority: template.priority,
          channels: template.channels,
          conditions: template.conditions,
          is_active: template.isActive,
          created_by: currentUser.id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding notification template:", error)
    } else if (data) {
      fetchNotificationTemplates()
    }
  }

  const addNotificationCampaign = async (
    campaign: Omit<NotificationCampaign, "id" | "createdBy" | "createdAt" | "status" | "stats">,
  ) => {
    if (!currentUser) return
    const { data, error } = await supabase
      .from("notification_campaigns")
      .insert([
        {
          name: campaign.name,
          description: campaign.description,
          template_id: campaign.templateId,
          custom_title: campaign.customTitle,
          custom_message: campaign.customMessage,
          target_users: campaign.targetUsers,
          scheduled_for: campaign.scheduledFor,
          requires_approval: campaign.requiresApproval,
          created_by: currentUser.id,
          status: campaign.requiresApproval ? "pending_approval" : "scheduled",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding notification campaign:", error)
    } else if (data) {
      fetchNotificationCampaigns()
    }
  }

  const addApprovalWorkflow = (workflow: ApprovalWorkflow) => {
    setApprovalWorkflows((prev) => [...prev, workflow])
  }

  const addApprovalRule = async (rule: Omit<ApprovalRule, "id" | "createdBy" | "createdAt">) => {
    if (!currentUser) return
    const { data, error } = await supabase
      .from("approval_rules")
      .insert([{ ...rule, is_active: rule.isActive, created_by: currentUser.id }])
      .select()
      .single()

    if (error) {
      console.error("Error adding approval rule:", error)
    } else if (data) {
      const newRule: ApprovalRule = {
        id: data.id,
        name: data.name,
        description: data.description,
        conditions: data.conditions,
        approvers: data.approvers,
        settings: data.settings,
        isActive: data.is_active,
        createdBy: data.created_by,
        createdAt: data.created_at,
      }
      setApprovalRules((prev) => [...prev, newRule])
    }
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const updateUser = async (updatedUser: User) => {
    const { error } = await supabase
      .from("users")
      .update({
        name: updatedUser.name,
        email: updatedUser.email,
        position: updatedUser.position,
        level: updatedUser.level,
        is_online: updatedUser.isOnline,
        avatar_url: updatedUser.avatar,
        preferences: updatedUser.preferences,
        notification_settings: updatedUser.notificationSettings,
      })
      .eq("id", updatedUser.id)

    if (error) {
      console.error("Error updating user:", error.message)
      return
    }

    fetchUsers()

    // Atualiza o currentUser se for o usuário editado
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser)
    }
  }

  const updateTask = async (updatedTask: Task) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        title: updatedTask.title,
        description: updatedTask.description,
        assigned_to: updatedTask.assignedTo,
        due_date: updatedTask.dueDate,
        priority: updatedTask.priority,
        status: updatedTask.status,
        tags: updatedTask.tags,
        completed_at: updatedTask.completedAt,
      })
      .eq("id", updatedTask.id)

    if (error) {
      console.error("Error updating task:", error.message)
      return
    }

    fetchTasks()
  }

  const updateNotificationTemplate = async (updatedTemplate: NotificationTemplate) => {
    const { error } = await supabase
      .from("notification_templates")
      .update({
        name: updatedTemplate.name,
        type: updatedTemplate.type,
        title: updatedTemplate.title,
        message: updatedTemplate.message,
        priority: updatedTemplate.priority,
        channels: updatedTemplate.channels,
        conditions: updatedTemplate.conditions,
        is_active: updatedTemplate.isActive,
      })
      .eq("id", updatedTemplate.id)

    if (error) {
      console.error("Error updating notification template:", error)
    } else {
      fetchNotificationTemplates()
    }
  }

  const updateNotificationCampaign = async (campaign: NotificationCampaign) => {
    const { error } = await supabase
      .from("notification_campaigns")
      .update({
        name: campaign.name,
        description: campaign.description,
        template_id: campaign.templateId,
        custom_title: campaign.customTitle,
        custom_message: campaign.customMessage,
        target_users: campaign.targetUsers,
        scheduled_for: campaign.scheduledFor,
        status: campaign.status,
        requires_approval: campaign.requiresApproval,
      })
      .eq("id", campaign.id)

    if (error) {
      console.error("Error updating notification campaign:", error)
    } else {
      fetchNotificationCampaigns()
    }
  }

  const updateApprovalWorkflow = (updatedWorkflow: ApprovalWorkflow) => {
    setApprovalWorkflows((prev) =>
      prev.map((workflow) => (workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow)),
    )
  }

  const updateApprovalRule = async (rule: ApprovalRule) => {
    const { error } = await supabase
      .from("approval_rules")
      .update({
        name: rule.name,
        description: rule.description,
        conditions: rule.conditions,
        approvers: rule.approvers,
        settings: rule.settings,
        is_active: rule.isActive,
      })
      .eq("id", rule.id)

    if (error) {
      console.error("Error updating approval rule:", error)
    } else {
      fetchApprovalRules() // Recarregar para ter certeza que os dados estão corretos
    }
  }

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error("Error deleting user:", error.message)
      return
    }
    fetchUsers()
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) {
      console.error("Error deleting task:", error.message)
      return
    }

    fetchTasks()
  }

  const deleteNotificationTemplate = async (id: string) => {
    const { error } = await supabase.from("notification_templates").delete().eq("id", id)
    if (error) {
      console.error("Error deleting notification template:", error)
    } else {
      setNotificationTemplates((prev) => prev.filter((template) => template.id !== id))
    }
  }

  const deleteNotificationCampaign = async (id: string) => {
    const { error } = await supabase.from("notification_campaigns").delete().eq("id", id)
    if (error) {
      console.error("Error deleting notification campaign:", error)
    } else {
      setNotificationCampaigns((prev) => prev.filter((campaign) => campaign.id !== id))
    }
  }

  const deleteApprovalRule = async (id: string) => {
    const { error } = await supabase.from("approval_rules").delete().eq("id", id)
    if (error) {
      console.error("Error deleting approval rule:", error)
    } else {
      setApprovalRules((prev) => prev.filter((rule) => rule.id !== id))
    }
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
        setActiveSection,
        addMeeting,
        updateMeeting,
        deleteMeeting,
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
        executeNotificationCampaign,
        findMeetingConflicts,
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
