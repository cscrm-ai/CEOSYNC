"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useApp } from "./AppContext"

interface NotificationContextType {
  permission: NotificationPermission
  isSupported: boolean
  requestPermission: () => Promise<NotificationPermission>
  sendBrowserNotification: (title: string, options?: NotificationOptions) => void
  isEnabled: boolean
  setIsEnabled: (enabled: boolean) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const { currentUser, notifications, addNotification } = useApp()

  useEffect(() => {
    // Verificar se o navegador suporta notificações
    if ("Notification" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)

      // Carregar preferência do usuário
      const savedPreference = localStorage.getItem("ceo-sync-notifications-enabled")
      setIsEnabled(savedPreference === "true")
    }
  }, [])

  useEffect(() => {
    // Monitorar novas notificações e enviar push notifications
    if (isEnabled && permission === "granted" && currentUser) {
      const unreadNotifications = notifications.filter((n) => !n.isRead && n.userId === currentUser.id)

      // Verificar se há novas notificações (simulação de tempo real)
      const lastNotification = unreadNotifications[0]
      if (lastNotification) {
        const notificationTime = new Date(lastNotification.createdAt).getTime()
        const now = Date.now()

        // Se a notificação foi criada nos últimos 5 segundos, enviar push
        if (now - notificationTime < 5000) {
          sendBrowserNotification(lastNotification.title, {
            body: lastNotification.message,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: lastNotification.id,
            requireInteraction: lastNotification.priority === "alta",
            data: {
              notificationId: lastNotification.id,
              type: lastNotification.type,
              url: getNotificationUrl(lastNotification.type, lastNotification.meetingId, lastNotification.taskId),
            },
          })
        }
      }
    }
  }, [notifications, isEnabled, permission, currentUser])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return "denied"
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        setIsEnabled(true)
        localStorage.setItem("ceo-sync-notifications-enabled", "true")

        // Enviar notificação de teste
        sendBrowserNotification("CEO SYNC", {
          body: "Notificações ativadas com sucesso!",
          icon: "/favicon.ico",
          tag: "welcome",
        })
      }

      return result
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error)
      return "denied"
    }
  }

  const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== "granted" || !isEnabled) {
      return
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      })

      // Configurar eventos da notificação
      notification.onclick = (event) => {
        event.preventDefault()
        window.focus()

        // Navegar para a seção relevante se houver dados
        if (options?.data) {
          const { type, url } = options.data
          if (url) {
            // Aqui você pode implementar navegação interna
            console.log("Navegando para:", url)
          }
        }

        notification.close()
      }

      notification.onshow = () => {
        // Auto-fechar após 5 segundos para notificações não críticas
        if (!options?.requireInteraction) {
          setTimeout(() => notification.close(), 5000)
        }
      }

      notification.onerror = (error) => {
        console.error("Erro na notificação:", error)
      }
    } catch (error) {
      console.error("Erro ao criar notificação:", error)
    }
  }

  const getNotificationUrl = (type: string, meetingId?: string, taskId?: string) => {
    switch (type) {
      case "meeting":
        return "/agenda"
      case "task":
        return "/tarefas"
      case "message":
        return "/chat"
      default:
        return "/dashboard"
    }
  }

  const toggleNotifications = (enabled: boolean) => {
    setIsEnabled(enabled)
    localStorage.setItem("ceo-sync-notifications-enabled", enabled.toString())
  }

  return (
    <NotificationContext.Provider
      value={{
        permission,
        isSupported,
        requestPermission,
        sendBrowserNotification,
        isEnabled,
        setIsEnabled: toggleNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
