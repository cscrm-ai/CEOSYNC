"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/AppContext"
import { Bot, Lightbulb, Calendar, Users, TrendingUp, X, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AIAssistant() {
  const { currentUser, meetings, users, tasks, aiAssistant, generateAISuggestions } = useApp()
  const [isExpanded, setIsExpanded] = useState(false)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Gerar sugestões automaticamente
    generateAISuggestions()
  }, [meetings, tasks])

  const activeSuggestions = aiAssistant.suggestions.filter((s) => !dismissedSuggestions.includes(s.id))

  const dismissSuggestion = (id: string) => {
    setDismissedSuggestions((prev) => [...prev, id])
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "meeting_time":
        return <Calendar className="w-5 h-5 text-blue-600" />
      case "participant":
        return <Users className="w-5 h-5 text-green-600" />
      case "optimization":
        return <TrendingUp className="w-5 h-5 text-orange-600" />
      default:
        return <Lightbulb className="w-5 h-5 text-purple-600" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  // Gerar insights automáticos
  const generateInsights = () => {
    const insights = []

    // Análise de reuniões
    const todayMeetings = meetings.filter((m) => m.date === new Date().toISOString().split("T")[0])
    if (todayMeetings.length > 3) {
      insights.push({
        type: "warning",
        title: "Agenda Sobrecarregada",
        description: `Você tem ${todayMeetings.length} reuniões hoje. Considere reagendar algumas para melhor produtividade.`,
        action: "Ver Agenda",
      })
    }

    // Análise de tarefas
    const overdueTasks = tasks.filter(
      (t) => new Date(t.dueDate) < new Date() && t.status !== "concluida" && t.assignedTo === currentUser?.id,
    )
    if (overdueTasks.length > 0) {
      insights.push({
        type: "urgent",
        title: "Tarefas Atrasadas",
        description: `Você tem ${overdueTasks.length} tarefa(s) atrasada(s). Priorize sua conclusão.`,
        action: "Ver Tarefas",
      })
    }

    // Análise de comunicação
    const onlineUsers = users.filter((u) => u.isOnline && u.id !== currentUser?.id)
    if (onlineUsers.length > 5) {
      insights.push({
        type: "info",
        title: "Momento Ideal para Comunicação",
        description: `${onlineUsers.length} colegas estão online. É um bom momento para discussões importantes.`,
        action: "Abrir Chat",
      })
    }

    return insights
  }

  const insights = generateInsights()

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 hover:bg-purple-700 rounded-full w-14 h-14 shadow-lg"
        >
          <Bot className="w-6 h-6" />
        </Button>
        {activeSuggestions.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {activeSuggestions.length}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <Card className="shadow-2xl border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              Assistente IA
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-white hover:bg-purple-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {/* Insights Automáticos */}
          {insights.length > 0 && (
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Insights do Dia
              </h3>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      insight.type === "urgent"
                        ? "bg-red-50 border-red-400 dark:bg-red-900/20"
                        : insight.type === "warning"
                          ? "bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20"
                          : "bg-blue-50 border-blue-400 dark:bg-blue-900/20"
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{insight.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">{insight.description}</p>
                    <Button size="sm" variant="outline" className="mt-2 text-xs">
                      {insight.action}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugestões de IA */}
          {activeSuggestions.length > 0 && (
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                Sugestões Inteligentes
              </h3>
              <div className="space-y-3">
                {activeSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {getSuggestionIcon(suggestion.type)}
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm ml-2">{suggestion.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(suggestion.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">{suggestion.description}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aplicar
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Agendar Reunião
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Ver Equipe
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Relatórios
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Minhas Tarefas
              </Button>
            </div>
          </div>

          {activeSuggestions.length === 0 && insights.length === 0 && (
            <div className="p-8 text-center">
              <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tudo parece estar funcionando perfeitamente! Continuarei monitorando para oferecer sugestões úteis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
