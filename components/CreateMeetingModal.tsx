"use client"

import type React from "react"
import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { X, Calendar, Clock, MapPin, Users, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Meeting } from "@/types"

interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateMeetingModal({ isOpen, onClose }: CreateMeetingModalProps) {
  const { currentUser, users, addMeeting, addNotification } = useApp()
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "presencial" as "presencial" | "online",
    participants: [] as { userId: string; status: "convocado" | "convidado" }[],
  })

  const [conflicts, setConflicts] = useState<string[]>([])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) return

    // Verificar conflitos (simplificado)
    const hasConflicts = checkForConflicts()

    if (hasConflicts && currentUser.level !== 1) {
      alert("Há conflitos de agenda. Como você não é o CEO, precisa resolver os conflitos primeiro.")
      return
    }

    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: formData.title,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      type: formData.type,
      meetingLink:
        formData.type === "online" ? `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}` : undefined,
      createdBy: currentUser.id,
      participants: formData.participants.map((p) => ({
        ...p,
        response: "pendente" as const,
      })),
    }

    addMeeting(newMeeting)

    // Criar notificações para os participantes
    formData.participants.forEach((participant) => {
      addNotification({
        id: Date.now().toString() + participant.userId,
        type: "meeting",
        title: "Nova Reunião Agendada",
        message: `Você foi ${participant.status} para: ${formData.title}`,
        userId: participant.userId,
        isRead: false,
        createdAt: new Date().toISOString(),
        meetingId: newMeeting.id,
      })
    })

    onClose()
    setFormData({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      type: "presencial",
      participants: [],
    })
  }

  const checkForConflicts = () => {
    // Lógica simplificada de verificação de conflitos
    return false
  }

  const toggleParticipant = (userId: string, status: "convocado" | "convidado") => {
    setFormData((prev) => {
      const existingIndex = prev.participants.findIndex((p) => p.userId === userId)

      if (existingIndex >= 0) {
        // Se já existe, atualizar status ou remover se for o mesmo status
        const existing = prev.participants[existingIndex]
        if (existing.status === status) {
          // Remover
          return {
            ...prev,
            participants: prev.participants.filter((p) => p.userId !== userId),
          }
        } else {
          // Atualizar status
          return {
            ...prev,
            participants: prev.participants.map((p) => (p.userId === userId ? { ...p, status } : p)),
          }
        }
      } else {
        // Adicionar novo
        return {
          ...prev,
          participants: [...prev.participants, { userId, status }],
        }
      }
    })
  }

  const availableUsers = users.filter((u) => u.id !== currentUser?.id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nova Reunião</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título da Reunião *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Reunião de Diretoria"
            />
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Início *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Fim *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tipo de Reunião */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reunião</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="presencial"
                  checked={formData.type === "presencial"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value as "presencial" | "online" }))
                  }
                  className="mr-2"
                />
                <MapPin className="w-4 h-4 mr-1" />
                Presencial
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="online"
                  checked={formData.type === "online"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value as "presencial" | "online" }))
                  }
                  className="mr-2"
                />
                <Video className="w-4 h-4 mr-1" />
                Online
              </label>
            </div>
          </div>

          {/* Local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === "presencial" ? (
                <>
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Local *
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 inline mr-1" />
                  Plataforma
                </>
              )}
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                formData.type === "presencial"
                  ? "Ex: Sala de Reuniões A"
                  : "Ex: Google Meet (link será gerado automaticamente)"
              }
            />
          </div>

          {/* Participantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Participantes
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
              {availableUsers.map((user) => {
                const participant = formData.participants.find((p) => p.userId === user.id)
                return (
                  <div key={user.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.position}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => toggleParticipant(user.id, "convocado")}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          participant?.status === "convocado"
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-red-100"
                        }`}
                      >
                        Convocar
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleParticipant(user.id, "convidado")}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          participant?.status === "convidado"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                        }`}
                      >
                        Convidar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              <strong>Convocados:</strong> Presença obrigatória, devem justificar ausências
              <br />
              <strong>Convidados:</strong> Presença opcional
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Criar Reunião
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
