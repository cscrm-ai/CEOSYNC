"use client"

import { useEffect, useRef } from "react"
import { useApp } from "@/contexts/AppContext"
import { useNotifications } from "@/contexts/NotificationContext"

export function useRealTimeNotifications() {
  const { currentUser, addNotification, meetings, tasks } = useApp()
  const { sendBrowserNotification, isEnabled, permission } = useNotifications()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!currentUser || !isEnabled || permission !== "granted") {
      return
    }

    // Simular notificações em tempo real
    intervalRef.current = setInterval(() => {
      // Verificar reuniões próximas (15 minutos antes)
      const now = new Date()
      const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000)

      meetings.forEach((meeting) => {
        const meetingTime = new Date(`${meeting.date}T${meeting.startTime}`)
        const isParticipant =
          meeting.participants.some((p) => p.userId === currentUser.id) || meeting.createdBy === currentUser.id

        if (isParticipant && meetingTime <= in15Minutes && meetingTime > now) {
          const notification = {
            id: `reminder_${meeting.id}_${Date.now()}`,
            type: "reminder" as const,
            title: "Lembrete de Reunião",
            message: `"${meeting.title}" começará em 15 minutos`,
            userId: currentUser.id,
            isRead: false,
            createdAt: new Date().toISOString(),
            meetingId: meeting.id,
            priority: "alta" as const,
          }

          addNotification(notification)

          sendBrowserNotification(notification.title, {
            body: notification.message,
            icon: "/favicon.ico",
            tag: `meeting_${meeting.id}`,
            requireInteraction: true,
            data: {
              notificationId: notification.id,
              type: "meeting",
              meetingId: meeting.id,
            },
          })
        }
      })

      // Verificar tarefas com prazo próximo (1 dia antes)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate)
        const isAssigned = task.assignedTo === currentUser.id

        if (isAssigned && task.status !== "concluida" && dueDate <= tomorrow && dueDate > now) {
          const notification = {
            id: `task_reminder_${task.id}_${Date.now()}`,
            type: "reminder" as const,
            title: "Prazo de Tarefa Próximo",
            message: `A tarefa "${task.title}" vence amanhã`,
            userId: currentUser.id,
            isRead: false,
            createdAt: new Date().toISOString(),
            taskId: task.id,
            priority: task.priority === "critica" ? ("alta" as const) : ("media" as const),
          }

          addNotification(notification)

          sendBrowserNotification(notification.title, {
            body: notification.message,
            icon: "/favicon.ico",
            tag: `task_${task.id}`,
            requireInteraction: task.priority === "critica",
            data: {
              notificationId: notification.id,
              type: "task",
              taskId: task.id,
            },
          })
        }
      })

      // Simular notificações aleatórias para demonstração
      if (Math.random() < 0.1) {
        // 10% de chance a cada verificação
        const randomNotifications = [
          {
            type: "system" as const,
            title: "Sistema Atualizado",
            message: "Nova versão do CEO SYNC disponível com melhorias de performance",
            priority: "media" as const,
          },
          {
            type: "message" as const,
            title: "Nova Mensagem",
            message: "Você recebeu uma nova mensagem no chat corporativo",
            priority: "media" as const,
          },
          {
            type: "meeting" as const,
            title: "Reunião Cancelada",
            message: "A reunião de hoje às 14h foi cancelada pelo organizador",
            priority: "alta" as const,
          },
        ]

        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)]

        const notification = {
          id: `random_${Date.now()}`,
          ...randomNotification,
          userId: currentUser.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        }

        addNotification(notification)

        sendBrowserNotification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: `random_${Date.now()}`,
          requireInteraction: notification.priority === "alta",
          data: {
            notificationId: notification.id,
            type: notification.type,
          },
        })
      }
    }, 30000) // Verificar a cada 30 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentUser, isEnabled, permission, meetings, tasks, addNotification, sendBrowserNotification])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
}
