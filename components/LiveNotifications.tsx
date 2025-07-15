"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/AppContext"
import { X, Bell, Calendar, CheckSquare, MessageSquare, AlertTriangle } from "lucide-react"

interface LiveNotification {
  id: string
  title: string
  message: string
  type: string
  timestamp: string
  priority: string
}

export default function LiveNotifications() {
  const { notifications, currentUser, markNotificationAsRead } = useApp()
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([])

  useEffect(() => {
    if (!currentUser) return

    // Filtrar notificações não lidas dos últimos 30 segundos
    const recentNotifications = notifications
      .filter((n) => {
        if (n.isRead || n.userId !== currentUser.id) return false

        const notificationTime = new Date(n.createdAt).getTime()
        const now = Date.now()
        return now - notificationTime < 30000 // 30 segundos
      })
      .map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        timestamp: n.createdAt,
        priority: n.priority || "media",
      }))

    setLiveNotifications(recentNotifications)

    // Auto-remover notificações após 10 segundos
    const timer = setTimeout(() => {
      setLiveNotifications([])
    }, 10000)

    return () => clearTimeout(timer)
  }, [notifications, currentUser])

  const handleDismiss = (id: string) => {
    setLiveNotifications((prev) => prev.filter((n) => n.id !== id))
    markNotificationAsRead(id)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "meeting":
      case "reminder":
        return <Calendar className="w-5 h-5 text-blue-600" />
      case "task":
        return <CheckSquare className="w-5 h-5 text-green-600" />
      case "message":
        return <MessageSquare className="w-5 h-5 text-purple-600" />
      case "conflict":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "border-red-400 bg-red-50 dark:bg-red-900/20"
      case "media":
        return "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
      default:
        return "border-gray-400 bg-gray-50 dark:bg-gray-800"
    }
  }

  if (liveNotifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {liveNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg border-l-4 shadow-lg backdrop-blur-sm
            ${getPriorityColor(notification.priority)}
            animate-slide-in
          `}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-white dark:bg-gray-700 rounded-full">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{notification.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 line-clamp-2">{notification.message}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(notification.id)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
