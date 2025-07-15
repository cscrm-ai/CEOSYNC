"use client"

import type React from "react"

import { useState } from "react"
import { useNotifications } from "@/contexts/NotificationContext"
import { useApp } from "@/contexts/AppContext"
import { Bell, BellOff, Settings, Check, X, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NotificationSettings() {
  const { permission, isSupported, requestPermission, sendBrowserNotification, isEnabled, setIsEnabled } =
    useNotifications()
  const { currentUser, addNotification } = useApp()
  const [isLoading, setIsLoading] = useState(false)

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    try {
      const result = await requestPermission()
      if (result === "granted") {
        // Adicionar notificação no sistema
        if (currentUser) {
          addNotification({
            id: Date.now().toString(),
            type: "system",
            title: "Notificações Ativadas",
            message: "Você receberá notificações do navegador para eventos importantes",
            userId: currentUser.id,
            isRead: false,
            createdAt: new Date().toISOString(),
            priority: "media",
          })
        }
      }
    } catch (error) {
      console.error("Erro ao ativar notificações:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = () => {
    sendBrowserNotification("Teste de Notificação", {
      body: "Esta é uma notificação de teste do CEO SYNC",
      icon: "/favicon.ico",
      tag: "test",
      requireInteraction: false,
    })
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case "granted":
        return {
          icon: <Check className="w-5 h-5 text-green-600" />,
          text: "Permitido",
          color: "text-green-600",
        }
      case "denied":
        return {
          icon: <X className="w-5 h-5 text-red-600" />,
          text: "Negado",
          color: "text-red-600",
        }
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          text: "Pendente",
          color: "text-yellow-600",
        }
    }
  }

  const status = getPermissionStatus()

  if (!isSupported) {
    return (
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Notificações Não Suportadas</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Seu navegador não suporta notificações push. Considere atualizar para uma versão mais recente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status das Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Status das Notificações Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {status.icon}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Permissão do Navegador</p>
                  <p className={`text-sm ${status.color}`}>{status.text}</p>
                </div>
              </div>
              {permission === "default" && (
                <Button
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Solicitando..." : "Permitir"}
                </Button>
              )}
            </div>

            {permission === "granted" && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isEnabled ? (
                    <Bell className="w-5 h-5 text-green-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Notificações CEO SYNC</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{isEnabled ? "Ativadas" : "Desativadas"}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEnabled(!isEnabled)}>
                    {isEnabled ? "Desativar" : "Ativar"}
                  </Button>
                  {isEnabled && (
                    <Button variant="outline" size="sm" onClick={handleTestNotification}>
                      Testar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      {permission === "granted" && isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configurações de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NotificationTypeCard
                  icon={<Bell className="w-5 h-5 text-blue-600" />}
                  title="Reuniões"
                  description="Notificações sobre novas reuniões e lembretes"
                  enabled={true}
                />
                <NotificationTypeCard
                  icon={<Check className="w-5 h-5 text-green-600" />}
                  title="Tarefas"
                  description="Novas tarefas e prazos próximos"
                  enabled={true}
                />
                <NotificationTypeCard
                  icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                  title="Conflitos"
                  description="Conflitos de agenda e ações necessárias"
                  enabled={true}
                />
                <NotificationTypeCard
                  icon={<Info className="w-5 h-5 text-purple-600" />}
                  title="Sistema"
                  description="Atualizações e informações do sistema"
                  enabled={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Como funcionam as notificações</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Você receberá notificações instantâneas para eventos importantes</li>
                <li>• Clique na notificação para ir diretamente à seção relevante</li>
                <li>• Notificações críticas permanecerão visíveis até serem fechadas</li>
                <li>• Você pode desativar as notificações a qualquer momento</li>
                <li>• As configurações são salvas localmente no seu navegador</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface NotificationTypeCardProps {
  icon: React.ReactNode
  title: string
  description: string
  enabled: boolean
}

function NotificationTypeCard({ icon, title, description, enabled }: NotificationTypeCardProps) {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
            <div className={`w-3 h-3 rounded-full ${enabled ? "bg-green-500" : "bg-gray-300"}`} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}
