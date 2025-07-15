"use client"
import { useApp } from "@/contexts/AppContext"
import { Bell, Calendar, MessageSquare, AlertTriangle, CheckCircle, Clock, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Notifications() {
  const { currentUser, notifications, markNotificationAsRead } = useApp()

  const userNotifications = notifications.filter((n) => n.userId === currentUser?.id)
  const unreadNotifications = userNotifications.filter((n) => !n.isRead)
  const readNotifications = userNotifications.filter((n) => n.isRead)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Calendar className="w-5 h-5 text-blue-600" />
      case "message":
        return <MessageSquare className="w-5 h-5 text-green-600" />
      case "conflict":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "system":
        return <Bell className="w-5 h-5 text-gray-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-50 border-blue-200"
      case "message":
        return "bg-green-50 border-green-200"
      case "conflict":
        return "bg-red-50 border-red-200"
      case "system":
        return "bg-gray-50 border-gray-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const markAllAsRead = () => {
    unreadNotifications.forEach((notification) => {
      markNotificationAsRead(notification.id)
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600 mt-2">
            {unreadNotifications.length} não lidas de {userNotifications.length} total
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar Todas como Lidas
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userNotifications.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Não Lidas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{unreadNotifications.length}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reuniões</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {userNotifications.filter((n) => n.type === "meeting").length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conflitos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {userNotifications.filter((n) => n.type === "conflict").length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Notificações Não Lidas */}
        {unreadNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Não Lidas ({unreadNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-l-4 ${getNotificationBgColor(notification.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-white">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          <p className="text-gray-700 mt-1">{notification.message}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(notification.createdAt).toLocaleString("pt-BR")}
                          </div>
                          {notification.actionRequired && (
                            <div className="mt-3 flex space-x-2">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                Resolver
                              </Button>
                              <Button size="sm" variant="outline">
                                Ver Detalhes
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => markNotificationAsRead(notification.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notificações Lidas */}
        {readNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Lidas ({readNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {readNotifications.slice(0, 10).map((notification) => (
                  <div key={notification.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200 opacity-75">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-white">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-700">{notification.title}</h4>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(notification.createdAt).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {readNotifications.length > 10 && (
                  <div className="text-center py-4">
                    <Button variant="outline">Ver Mais Notificações</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado Vazio */}
        {userNotifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
              <p className="text-gray-500">
                Você não possui notificações no momento. Quando houver atividades relevantes, elas aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
