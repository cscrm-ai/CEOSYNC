"use client"
import { useApp } from "@/contexts/AppContext"
import { Calendar, Users, MessageSquare, Bell, TrendingUp, Clock, CheckSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  const { currentUser, meetings, users, notifications, messages, tasks } = useApp()

  const todayMeetings = meetings.filter((meeting) => {
    const today = new Date().toISOString().split("T")[0]
    return meeting.date === today
  })

  const unreadNotifications = notifications.filter((n) => !n.isRead && n.userId === currentUser?.id)
  const unreadMessages = messages.filter((m) => !m.isRead && m.receiverId === currentUser?.id)

  const userTasks = tasks.filter((t) => t.assignedTo === currentUser?.id || t.createdBy === currentUser?.id)
  const overdueTasks = userTasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "concluida")

  const stats = [
    {
      title: "Reuniões Hoje",
      value: todayMeetings.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Usuários Online",
      value: users.filter((u) => u.isOnline).length,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Mensagens Não Lidas",
      value: unreadMessages.length,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Notificações Pendentes",
      value: unreadNotifications.length,
      icon: Bell,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Tarefas Pendentes",
      value: userTasks.filter((t) => t.status === "pendente").length,
      icon: CheckSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const upcomingMeetings = meetings
    .filter((meeting) => new Date(meeting.date + "T" + meeting.startTime) > new Date())
    .sort((a, b) => new Date(a.date + "T" + a.startTime).getTime() - new Date(b.date + "T" + b.startTime).getTime())
    .slice(0, 5)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, {currentUser?.name}!</h1>
        <p className="text-gray-600 mt-2">Aqui está um resumo das suas atividades corporativas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Reuniões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Próximas Reuniões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma reunião agendada</p>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(meeting.date).toLocaleDateString("pt-BR")} às {meeting.startTime}
                      </p>
                      <p className="text-sm text-gray-500">{meeting.location}</p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        meeting.type === "online" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {meeting.type === "online" ? "Online" : "Presencial"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarefas Urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="w-5 h-5 mr-2" />
              Tarefas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma tarefa atrasada</p>
            ) : (
              <div className="space-y-4">
                {overdueTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Prazo: {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                      Atrasada
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notificações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notificações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unreadNotifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma notificação pendente</p>
            ) : (
              <div className="space-y-4">
                {unreadNotifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div
                      className={`p-2 rounded-full mr-3 ${
                        notification.type === "conflict"
                          ? "bg-red-100"
                          : notification.type === "meeting"
                            ? "bg-blue-100"
                            : notification.type === "message"
                              ? "bg-green-100"
                              : "bg-gray-100"
                      }`}
                    >
                      {notification.type === "conflict" && <Clock className="w-4 h-4 text-red-600" />}
                      {notification.type === "meeting" && <Calendar className="w-4 h-4 text-blue-600" />}
                      {notification.type === "message" && <MessageSquare className="w-4 h-4 text-green-600" />}
                      {notification.type === "system" && <TrendingUp className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
