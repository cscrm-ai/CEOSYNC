"use client"

import type React from "react"
import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { X, Calendar, Clock, MapPin, Users, Video, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Meeting } from "@/types"

interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  meetingToEdit?: Meeting | null
}

export default function CreateMeetingModal({ isOpen, onClose, meetingToEdit }: CreateMeetingModalProps) {
  const { currentUser, users, addMeeting, updateMeeting, addNotification } = useApp()
  const [formData, setFormData] = useState({
    title: meetingToEdit?.title || "",
    date: meetingToEdit?.date || "",
    startTime: meetingToEdit?.startTime || "",
    endTime: meetingToEdit?.endTime || "",
    location: meetingToEdit?.location || "",
    type: meetingToEdit?.type || ("presencial" as "presencial" | "online"),
    participants: meetingToEdit?.participants || ([] as { userId: string; status: "convocado" | "convidado" }[]),
  })
  const [conflicts, setConflicts] = useState<{ userId: string; conflictingMeeting: Meeting }[]>([])
  const { findMeetingConflicts, users: allUsers } = useApp()

  const isEditing = !!meetingToEdit

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) return

    const participantIds = formData.participants.map((p) => p.userId)
    const foundConflicts = await findMeetingConflicts(
      formData.date,
      formData.startTime,
      formData.endTime,
      participantIds,
      isEditing ? meetingToEdit.id : undefined,
    )

    setConflicts(foundConflicts)

    const hasSuperiorConflict = foundConflicts.some((conflict) => {
      const conflictingUser = allUsers.find((u) => u.id === conflict.userId)
      return conflictingUser && conflictingUser.level <= currentUser.level
    })

    if (foundConflicts.length > 0 && (hasSuperiorConflict || currentUser.level > 2)) {
      alert(
        "Existem conflitos de agenda com superiores ou você não tem permissão para forçar o agendamento. Por favor, ajuste o horário ou os participantes.",
      )
      return
    }

    if (isEditing) {
      const updatedMeeting: Meeting = {
        ...meetingToEdit,
        ...formData,
        participants: formData.participants.map((p) => ({
          userId: p.userId,
          status: p.status,
          response:
            (meetingToEdit.participants.find((oldP) => oldP.userId === p.userId)?.response as
              | "aceito"
              | "recusado"
              | "pendente") || "pendente",
        })),
      }
      await updateMeeting(updatedMeeting)
    } else {
      const newMeetingData: Omit<Meeting, "id"> = {
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
        priority: "media" as const,
        tags: [],
      }

      await addMeeting(newMeetingData, foundConflicts)
    }

    onClose()
  }

  const getUserName = (userId: string) => {
    return allUsers.find((u) => u.id === userId)?.name || "Usuário"
  }

  const handleFormDataChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpa os conflitos ao mudar dados relevantes
    if (["date", "startTime", "endTime", "participants"].includes(field)) {
      setConflicts([])
    }
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
          <h2 className="text-2xl font-bold text-gray-900">{isEditing ? "Editar Reunião" : "Nova Reunião"}</h2>
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
              onChange={(e) => handleFormDataChange("title", e.target.value)}
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
                onChange={(e) => handleFormDataChange("date", e.target.value)}
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
                onChange={(e) => handleFormDataChange("startTime", e.target.value)}
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
                onChange={(e) => handleFormDataChange("endTime", e.target.value)}
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
                    handleFormDataChange("type", e.target.value as "presencial" | "online")
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
                    handleFormDataChange("type", e.target.value as "presencial" | "online")
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
              onChange={(e) => handleFormDataChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                formData.type === "presencial"
                  ? "Ex: Sala de Reuniões A"
                  : "Ex: Google Meet (link será gerado automaticamente)"
              }
            />
          </div>

          {/* Alerta de Conflitos */}
          {conflicts.length > 0 && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Conflito de Agenda Detectado
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {conflicts.map((conflict) => (
                        <li key={conflict.userId}>
                          <strong>{getUserName(conflict.userId)}</strong> já tem a reunião "
                          {conflict.conflictingMeeting.title}" neste horário.
                        </li>
                      ))}
                    </ul>
                  </div>
                  {currentUser && currentUser.level <= 2 && (
                    <p className="mt-3 text-sm text-yellow-700">
                      Como você é um superior, pode forçar o agendamento. Os participantes com conflito serão
                      notificados.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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
              {isEditing ? "Salvar Alterações" : "Criar Reunião"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
