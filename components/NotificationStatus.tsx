"use client"

import { useState } from "react"
import { useNotifications } from "@/contexts/NotificationContext"
import { Bell, BellOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import NotificationSettings from "./NotificationSettings"

export default function NotificationStatus() {
  const { permission, isEnabled, isSupported } = useNotifications()
  const [showSettings, setShowSettings] = useState(false)

  if (!isSupported) {
    return null
  }

  const getStatusColor = () => {
    if (permission === "granted" && isEnabled) return "text-green-600"
    if (permission === "denied") return "text-red-600"
    return "text-yellow-600"
  }

  const getStatusIcon = () => {
    if (permission === "granted" && isEnabled) {
      return <Bell className={`w-5 h-5 ${getStatusColor()}`} />
    }
    return <BellOff className={`w-5 h-5 ${getStatusColor()}`} />
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(true)}
        className="flex items-center space-x-2"
        title={
          permission === "granted" && isEnabled
            ? "Notificações ativadas"
            : permission === "denied"
              ? "Notificações negadas"
              : "Notificações desativadas"
        }
      >
        {getStatusIcon()}
        <span className="hidden md:inline text-sm">
          {permission === "granted" && isEnabled ? "Push ON" : permission === "denied" ? "Push Negado" : "Push OFF"}
        </span>
      </Button>

      {/* Modal de Configurações */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações de Notificação</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <NotificationSettings />
          </div>
        </div>
      )}
    </>
  )
}
