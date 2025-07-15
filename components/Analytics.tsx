"use client"

import { useApp } from "@/contexts/AppContext"
import { BarChart3, TrendingUp, Users, Calendar, MessageSquare, Clock, Target, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, BarChart, LineChart } from "./Charts"

export default function Analytics() {
  const { analytics, users, meetings, tasks, messages } = useApp()

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Carregando Analytics</h3>
          <p className="text-gray-500 dark:text-gray-400">Os dados estão sendo processados...</p>
        </div>
      </div>
    )
  }

  // Preparar dados para gráficos
  const participationData = analytics.userStats.participationRate.map((item) => {
    const user = users.find((u) => u.id === item.userId)
    return {
      label: user?.name || "Usuário",
      value: item.rate,
    }
  })

  const responseTimeData = analytics.userStats.responseTime.map((item) => {
    const user = users.find((u) => u.id === item.userId)
    return {
      label: user?.name || "Usuário",
      value: item.avgTime,
    }
  })

  const activityData = analytics.userStats.mostActive.map((item) => {
    const user = users.find((u) => u.id === item.userId)
    return {
      label: user?.name || "Usuário",
      value: item.activities,
    }
  })

  // Dados de reuniões por mês (simulado)
  const monthlyMeetings = [
    { label: "Jan", value: 8 },
    { label: "Fev", value: 12 },
    { label: "Mar", value: 15 },
    { label: "Abr", value: 10 },
    { label: "Mai", value: 18 },
    { label: "Jun", value: 14 },
  ]

  // Estatísticas de tarefas
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "concluida").length,
    overdue: tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "concluida").length,
    inProgress: tasks.filter((t) => t.status === "em_progresso").length,
  }

  const taskCompletionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Relatórios</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Insights detalhados sobre produtividade e comunicação organizacional
        </p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Reuniões Este Mês</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {analytics.meetingStats.thisMonth}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +{Math.round(((analytics.meetingStats.thisMonth - 8) / 8) * 100)}% vs mês anterior
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Taxa de Participação</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {Math.round(
                    analytics.userStats.participationRate.reduce((acc, curr) => acc + curr.rate, 0) /
                      analytics.userStats.participationRate.length,
                  )}
                  %
                </p>
                <p className="text-sm text-green-600 mt-1">Excelente engajamento</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Mensagens Enviadas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {analytics.communicationStats.messagesCount}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {analytics.communicationStats.responseRate}% taxa de resposta
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {Math.round(taskCompletionRate)}%
                </p>
                <p className="text-sm text-orange-600 mt-1">{taskStats.overdue} tarefas atrasadas</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reuniões por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Reuniões por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={analytics.meetingStats.byType} />
          </CardContent>
        </Card>

        {/* Reuniões por Prioridade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Reuniões por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={analytics.meetingStats.byPriority} colors={["#6B7280", "#3B82F6", "#F59E0B", "#EF4444"]} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Taxa de Participação por Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Taxa de Participação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={participationData} color="#10B981" />
          </CardContent>
        </Card>

        {/* Tempo de Resposta Médio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Tempo de Resposta (minutos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={responseTimeData} color="#F59E0B" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Atividade por Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Usuários Mais Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={activityData} color="#8B5CF6" />
          </CardContent>
        </Card>

        {/* Tendência de Reuniões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Tendência Mensal de Reuniões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={monthlyMeetings} color="#3B82F6" />
          </CardContent>
        </Card>
      </div>

      {/* Horários de Pico */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Horários de Pico de Comunicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i
              const isPeak = analytics.communicationStats.peakHours.includes(hour)
              return (
                <div key={hour} className="text-center">
                  <div
                    className={`h-16 rounded-md flex items-end justify-center ${
                      isPeak ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <div
                      className={`w-full rounded-md ${isPeak ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                      style={{ height: isPeak ? "100%" : "30%" }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{hour}h</p>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
            Horários com maior volume de mensagens: {analytics.communicationStats.peakHours.join("h, ")}h
          </p>
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Produtividade</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• {analytics.meetingStats.total} reuniões realizadas</li>
                <li>• {Math.round(analytics.meetingStats.averageDuration)} min de duração média</li>
                <li>• {taskStats.completed} tarefas concluídas</li>
                <li>• {Math.round(taskCompletionRate)}% taxa de conclusão</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Comunicação</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• {analytics.communicationStats.messagesCount} mensagens enviadas</li>
                <li>• {analytics.communicationStats.responseRate}% taxa de resposta</li>
                <li>• {users.filter((u) => u.isOnline).length} usuários online</li>
                <li>• Pico às {analytics.communicationStats.peakHours[0]}h</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Engajamento</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>
                  •{" "}
                  {Math.round(
                    analytics.userStats.participationRate.reduce((acc, curr) => acc + curr.rate, 0) /
                      analytics.userStats.participationRate.length,
                  )}
                  % participação média
                </li>
                <li>
                  •{" "}
                  {Math.round(
                    analytics.userStats.responseTime.reduce((acc, curr) => acc + curr.avgTime, 0) /
                      analytics.userStats.responseTime.length,
                  )}{" "}
                  min tempo médio de resposta
                </li>
                <li>• {analytics.meetingStats.byType.online || 0} reuniões online</li>
                <li>• {analytics.meetingStats.byType.presencial || 0} reuniões presenciais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
