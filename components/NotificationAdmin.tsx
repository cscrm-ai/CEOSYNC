"use client"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import {
  Bell,
  Users,
  Send,
  Settings,
  BarChart3,
  Plus,
  Search,
  Download,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LEVEL_NAMES, NOTIFICATION_STATUS_COLORS, type NotificationTemplate } from "@/types"

export default function NotificationAdmin() {
  const { currentUser, users, notifications } = useApp()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Verificar se o usuário tem permissão de administrador
  if (!currentUser || currentUser.level > 2) {
    return (
      <div className="p-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Acesso Negado</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Apenas CEOs e Diretores têm acesso ao painel administrativo de notificações.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: BarChart3 },
    { id: "users", label: "Usuários", icon: Users },
    { id: "templates", label: "Templates", icon: Settings },
    { id: "campaigns", label: "Campanhas", icon: Send },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />
      case "users":
        return <UsersTab />
      case "templates":
        return <TemplatesTab />
      case "campaigns":
        return <CampaignsTab />
      case "analytics":
        return <AnalyticsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel Administrativo de Notificações</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Gerencie notificações, templates e campanhas para toda a organização
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

// Componente da aba Visão Geral
function OverviewTab() {
  const { notifications, users } = useApp()

  const stats = {
    totalNotifications: notifications.length,
    unreadNotifications: notifications.filter((n) => !n.isRead).length,
    activeUsers: users.filter((u) => u.notificationSettings?.browser).length,
    deliveryRate: 87.5, // Simulado
  }

  const recentNotifications = notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total de Notificações</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalNotifications}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Não Lidas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.unreadNotifications}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Usuários Ativos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Taxa de Entrega</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.deliveryRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${NOTIFICATION_STATUS_COLORS.delivered}`}
                  >
                    Entregue
                  </span>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente da aba Usuários
function UsersTab() {
  const { users } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevel === "all" || user.level === selectedLevel
    return matchesSearch && matchesLevel
  })

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todos os Níveis</option>
                <option value={1}>CEO</option>
                <option value={2}>Diretores</option>
                <option value={3}>Gerentes</option>
                <option value={4}>Analistas</option>
                <option value={5}>Assistentes</option>
              </select>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Notificação por Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Usuário</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Nível</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Browser</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">SMS</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Última Atividade
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{LEVEL_NAMES[user.level]}</span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusIndicator enabled={user.notificationSettings?.browser || false} />
                    </td>
                    <td className="py-4 px-4">
                      <StatusIndicator enabled={user.notificationSettings?.email || false} />
                    </td>
                    <td className="py-4 px-4">
                      <StatusIndicator enabled={user.notificationSettings?.sms || false} />
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(user.lastActivity).toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente da aba Templates
function TemplatesTab() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Templates mockados
  const templates: NotificationTemplate[] = [
    {
      id: "1",
      name: "Lembrete de Reunião",
      type: "reminder",
      title: "Reunião em {time} minutos",
      message: "A reunião '{meeting_title}' começará em {time} minutos na {location}",
      priority: "alta",
      channels: ["browser", "email"],
      conditions: {
        userLevels: [1, 2, 3],
        departments: [],
        timeBeforeEvent: 15,
      },
      isActive: true,
      createdBy: "1",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      name: "Nova Tarefa Atribuída",
      type: "task",
      title: "Nova tarefa: {task_title}",
      message: "Você recebeu uma nova tarefa com prazo para {due_date}",
      priority: "media",
      channels: ["browser"],
      conditions: {
        userLevels: [1, 2, 3, 4, 5],
        departments: [],
      },
      isActive: true,
      createdBy: "1",
      createdAt: "2024-01-01T10:00:00Z",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Templates de Notificação</h2>
          <p className="text-gray-600 dark:text-gray-300">Crie e gerencie templates reutilizáveis</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Tipo: {template.type} • Prioridade: {template.priority}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${template.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {template.isActive ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Título:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.message}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Canais:</p>
                  <div className="flex space-x-2 mt-1">
                    {template.channels.map((channel) => (
                      <span
                        key={channel}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-3 border-t">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Componente da aba Campanhas
function CampaignsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Campanhas de Notificação</h2>
          <p className="text-gray-600 dark:text-gray-300">Envie notificações em massa para grupos específicos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma campanha criada</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Crie sua primeira campanha para enviar notificações em massa
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Campanha
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente da aba Analytics
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics de Notificações</h2>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Taxa de Entrega</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">94.2%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Taxa de Abertura</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">78.5%</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Taxa de Clique</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">45.3%</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Falhas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">2.1%</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notificações por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Browser</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }} />
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Email</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "65%" }} />
                  </div>
                  <span className="text-sm font-medium">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">SMS</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "25%" }} />
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Reuniões</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }} />
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Tarefas</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "30%" }} />
                  </div>
                  <span className="text-sm font-medium">30%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Sistema</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "15%" }} />
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Mensagens</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: "10%" }} />
                  </div>
                  <span className="text-sm font-medium">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componentes auxiliares
function StatusIndicator({ enabled }: { enabled: boolean }) {
  return <div className={`w-3 h-3 rounded-full ${enabled ? "bg-green-500" : "bg-gray-300"}`} />
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "meeting":
    case "reminder":
      return <Calendar className="w-4 h-4" />
    case "task":
      return <CheckCircle className="w-4 h-4" />
    case "message":
      return <Send className="w-4 h-4" />
    case "conflict":
      return <AlertTriangle className="w-4 h-4" />
    default:
      return <Bell className="w-4 h-4" />
  }
}

function getNotificationTypeColor(type: string) {
  switch (type) {
    case "meeting":
    case "reminder":
      return "bg-blue-100 dark:bg-blue-900"
    case "task":
      return "bg-green-100 dark:bg-green-900"
    case "message":
      return "bg-purple-100 dark:bg-purple-900"
    case "conflict":
      return "bg-red-100 dark:bg-red-900"
    default:
      return "bg-gray-100 dark:bg-gray-800"
  }
}
