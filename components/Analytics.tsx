"use client"

import { useMemo } from "react"
import { useApp } from "@/contexts/AppContext"
import { BarChart3, TrendingUp, Users, Calendar, MessageSquare, Clock, Target, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, BarChart, LineChart } from "./Charts"
import { format, getMonth, getYear, getHours, differenceInMinutes, startOfMonth, endOfMonth } from "date-fns"

export default function Analytics() {
  const { users, meetings, tasks, messages } = useApp()

  const analyticsData = useMemo(() => {
    if (meetings.length === 0 && tasks.length === 0 && messages.length === 0) {
      return null
    }

    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)

    // KPI: Reuniões Este Mês
    const meetingsThisMonth = meetings.filter((m) => {
      const meetingDate = new Date(m.date)
      return meetingDate >= currentMonthStart && meetingDate <= currentMonthEnd
    }).length

    // KPI: Taxa de Participação (geral)
    const totalParticipants = meetings.flatMap((m) => m.participants).length
    const acceptedParticipants = meetings
      .flatMap((m) => m.participants)
      .filter((p) => p.response === "aceito").length
    const participationRate = totalParticipants > 0 ? (acceptedParticipants / totalParticipants) * 100 : 0

    // KPI: Mensagens Enviadas
    const messagesCount = messages.length

    // KPI: Taxa de Conclusão de Tarefas
    const completedTasks = tasks.filter((t) => t.status === "concluida").length
    const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
    const overdueTasks = tasks.filter((t) => new Date(t.dueDate) < now && t.status !== "concluida").length

    // Gráfico: Reuniões por Tipo
    const meetingsByType = meetings.reduce(
      (acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Gráfico: Reuniões por Prioridade
    const meetingsByPriority = meetings.reduce(
      (acc, m) => {
        acc[m.priority] = (acc[m.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Gráfico: Tarefas Concluídas por Usuário
    const tasksCompletedPerUser = users
      .map((user) => ({
        label: user.name,
        value: tasks.filter((t) => t.assignedTo === user.id && t.status === "concluida").length,
      }))
      .filter((u) => u.value > 0)
      .sort((a, b) => b.value - a.value)

    // Gráfico: Usuários Mais Ativos (baseado em tarefas + reuniões criadas)
    const userActivity = users
      .map((user) => {
        const tasksCreated = tasks.filter((t) => t.createdBy === user.id).length
        const meetingsCreated = meetings.filter((m) => m.createdBy === user.id).length
        return {
          label: user.name,
          value: tasksCreated + meetingsCreated,
        }
      })
      .filter((u) => u.value > 0)
      .sort((a, b) => b.value - a.value)

    // Gráfico: Tendência Mensal de Reuniões (últimos 6 meses)
    const monthlyMeetings = Array(6)
      .fill(0)
      .map((_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        return {
          label: format(d, "MMM"),
          year: getYear(d),
          month: getMonth(d),
          value: 0,
        }
      })
      .reverse()

    meetings.forEach((meeting) => {
      const meetingMonth = getMonth(new Date(meeting.date))
      const meetingYear = getYear(new Date(meeting.date))
      const monthData = monthlyMeetings.find((m) => m.month === meetingMonth && m.year === meetingYear)
      if (monthData) {
        monthData.value++
      }
    })

    // Gráfico: Horários de Pico de Comunicação
    const peakHours = messages.reduce(
      (acc, msg) => {
        const hour = getHours(new Date(msg.createdAt))
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )
    const peakHoursArray = Object.keys(peakHours).map(Number)

    // Resumo Executivo
    const totalMeetings = meetings.length
    const averageDuration =
      meetings.length > 0
        ? meetings.reduce((acc, m) => {
            const start = new Date(`${m.date}T${m.startTime}`)
            const end = new Date(`${m.date}T${m.endTime}`)
            return acc + differenceInMinutes(end, start)
          }, 0) / meetings.length
        : 0

    return {
      meetingsThisMonth,
      participationRate,
      messagesCount,
      taskCompletionRate,
      overdueTasks,
      meetingsByType,
      meetingsByPriority,
      tasksCompletedPerUser,
      userActivity,
      monthlyMeetings,
      peakHours,
      peakHoursArray,
      totalMeetings,
      averageDuration,
      completedTasks,
      onlineUsers: users.filter((u) => u.isOnline).length,
    }
  }, [meetings, tasks, users, messages])

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Carregando Analytics</h3>
          <p className="text-gray-500 dark:text-gray-400">Os dados estão sendo processados ou não há dados para exibir...</p>
        </div>
      </div>
    )
  }

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
                  {analyticsData.meetingsThisMonth}
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
                  {Math.round(analyticsData.participationRate)}%
                </p>
                <p className="text-sm text-green-600 mt-1">Engajamento em reuniões</p>
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
                  {analyticsData.messagesCount}
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
                  {Math.round(analyticsData.taskCompletionRate)}%
                </p>
                <p className="text-sm text-orange-600 mt-1">{analyticsData.overdueTasks} tarefas atrasadas</p>
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
            <PieChart data={analyticsData.meetingsByType} />
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
            <PieChart data={analyticsData.meetingsByPriority} colors={["#6B7280", "#3B82F6", "#F59E0B", "#EF4444"]} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tarefas Concluídas por Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Tarefas Concluídas por Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={analyticsData.tasksCompletedPerUser} color="#10B981" />
          </CardContent>
        </Card>

        {/* Usuários Mais Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Usuários Mais Ativos (Criações)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={analyticsData.userActivity} color="#8B5CF6" />
          </CardContent>
        </Card>
      </div>

      {/* Tendência de Reuniões */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Tendência Mensal de Reuniões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={analyticsData.monthlyMeetings} color="#3B82F6" />
        </CardContent>
      </Card>

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
              const isPeak = analyticsData.peakHoursArray.includes(hour)
              const peakValue = analyticsData.peakHours[hour] || 0
              const maxPeak = Math.max(...Object.values(analyticsData.peakHours))
              const heightPercentage = maxPeak > 0 ? (peakValue / maxPeak) * 100 : 0
              return (
                <div key={hour} className="text-center">
                  <div
                    className="h-24 rounded-md flex items-end justify-center bg-gray-200 dark:bg-gray-700"
                    title={`${peakValue} msgs`}
                  >
                    <div
                      className="w-full rounded-md bg-blue-500"
                      style={{ height: `${heightPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{hour}h</p>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
            Horários com maior volume de mensagens: {analyticsData.peakHoursArray.join("h, ")}h
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
                <li>• {analyticsData.totalMeetings} reuniões realizadas</li>
                <li>• {Math.round(analyticsData.averageDuration)} min de duração média</li>
                <li>• {analyticsData.completedTasks} tarefas concluídas</li>
                <li>• {Math.round(analyticsData.taskCompletionRate)}% taxa de conclusão</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Comunicação</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• {analyticsData.messagesCount} mensagens enviadas</li>
                <li>• {analyticsData.onlineUsers} usuários online agora</li>
                {analyticsData.peakHoursArray.length > 0 && (
                  <li>• Pico de atividade às {analyticsData.peakHoursArray[0]}h</li>
                )}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">Engajamento</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>
                  • {Math.round(analyticsData.participationRate)}% participação média em reuniões
                </li>
                <li>
                  • {analyticsData.meetingsByType.online || 0} reuniões online
                </li>
                <li>
                  • {analyticsData.meetingsByType.presencial || 0} reuniões presenciais
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
