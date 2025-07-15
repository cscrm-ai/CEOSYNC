"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/AppContext"
import { Calendar, Plus, MapPin, Clock, Users, Video, User, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CreateMeetingModal from "./CreateMeetingModal"
import type { Meeting } from "@/types"

export default function Agenda() {
  const { meetings, users, currentUser, deleteMeeting } = useApp()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")

  useEffect(() => {
    setSelectedDate(new Date())
  }, [])

  // Filtrar reuniões do usuário atual
  const userMeetings = meetings.filter(
    (meeting) =>
      meeting.createdBy === currentUser?.id || meeting.participants.some((p) => p.userId === currentUser?.id),
  )

  if (!selectedDate) {
    // Pode ser um loader
    return null
  }

  // Reuniões do dia selecionado
  const selectedDateStr = selectedDate.toISOString().split("T")[0]
  const dayMeetings = userMeetings.filter((meeting) => meeting.date === selectedDateStr)

  // Gerar calendário do mês
  const generateCalendar = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split("T")[0]
      const dayMeetings = userMeetings.filter((meeting) => meeting.date === dateStr)

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: dateStr === new Date().toISOString().split("T")[0],
        isSelected: dateStr === selectedDateStr,
        meetings: dayMeetings,
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const calendarDays = generateCalendar()
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate)
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || "Usuário não encontrado"
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda Corporativa</h1>
          <p className="text-gray-600 mt-2">Gerencie suas reuniões e compromissos</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Reunião
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    ←
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`
                      p-2 text-sm border rounded-lg transition-colors relative
                      ${!day.isCurrentMonth ? "text-gray-400 bg-gray-50" : ""}
                      ${day.isToday ? "bg-blue-100 border-blue-300" : "border-gray-200"}
                      ${day.isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-100"}
                      ${day.meetings.length > 0 ? "font-semibold" : ""}
                    `}
                  >
                    {day.date.getDate()}
                    {day.meetings.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className={`w-2 h-2 rounded-full ${day.isSelected ? "bg-white" : "bg-blue-500"}`} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reuniões do Dia */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {selectedDate.toLocaleDateString("pt-BR")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dayMeetings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma reunião agendada para este dia</p>
              ) : (
                <div className="space-y-4">
                  {dayMeetings.map((meeting) => (
                    <div key={meeting.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            meeting.type === "online" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {meeting.type === "online" ? "Online" : "Presencial"}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {meeting.startTime} - {meeting.endTime}
                        </div>

                        <div className="flex items-center">
                          {meeting.type === "online" ? (
                            <Video className="w-4 h-4 mr-2" />
                          ) : (
                            <MapPin className="w-4 h-4 mr-2" />
                          )}
                          {meeting.location}
                        </div>

                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Criado por: {getUserName(meeting.createdBy)}
                        </div>

                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {meeting.participants.length} participante(s)
                        </div>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        {meeting.type === "online" && meeting.meetingLink && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Video className="w-4 h-4 mr-2" />
                            Entrar na Reunião
                          </Button>
                        )}
                        {currentUser &&
                          (meeting.createdBy === currentUser.id || currentUser.level <= 2) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingMeeting(meeting)
                                  setShowCreateModal(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  if (window.confirm("Tem certeza que deseja excluir esta reunião?")) {
                                    await deleteMeeting(meeting.id)
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showCreateModal && (
        <CreateMeetingModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setEditingMeeting(null)
          }}
          meetingToEdit={editingMeeting}
        />
      )}
    </div>
  )
}
