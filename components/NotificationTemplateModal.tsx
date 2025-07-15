"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { NotificationTemplate } from "@/types"

interface NotificationTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template?: NotificationTemplate
  onSave: (template: NotificationTemplate) => void
}

export default function NotificationTemplateModal({
  isOpen,
  onClose,
  template,
  onSave,
}: NotificationTemplateModalProps) {
  const { currentUser } = useApp()
  const [formData, setFormData] = useState({
    name: template?.name || "",
    type: template?.type || "system",
    title: template?.title || "",
    message: template?.message || "",
    priority: template?.priority || "media",
    channels: template?.channels || ["browser"],
    userLevels: template?.conditions.userLevels || [1, 2, 3, 4, 5],
    departments: template?.conditions.departments || [],
    timeBeforeEvent: template?.conditions.timeBeforeEvent || undefined,
    isActive: template?.isActive ?? true,
  })

  const [variables, setVariables] = useState<string[]>([])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    const newTemplate: NotificationTemplate = {
      id: template?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type as NotificationTemplate["type"],
      title: formData.title,
      message: formData.message,
      priority: formData.priority as NotificationTemplate["priority"],
      channels: formData.channels as NotificationTemplate["channels"],
      conditions: {
        userLevels: formData.userLevels,
        departments: formData.departments,
        timeBeforeEvent: formData.timeBeforeEvent,
      },
      isActive: formData.isActive,
      createdBy: template?.createdBy || currentUser.id,
      createdAt: template?.createdAt || new Date().toISOString(),
    }

    onSave(newTemplate)
    onClose()
  }

  const toggleChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }))
  }

  const toggleUserLevel = (level: number) => {
    setFormData((prev) => ({
      ...prev,
      userLevels: prev.userLevels.includes(level)
        ? prev.userLevels.filter((l) => l !== level)
        : [...prev.userLevels, level],
    }))
  }

  const addVariable = (variable: string) => {
    const cursorPosition = (document.getElementById("message-input") as HTMLTextAreaElement)?.selectionStart || 0
    const currentMessage = formData.message
    const newMessage = currentMessage.slice(0, cursorPosition) + `{${variable}}` + currentMessage.slice(cursorPosition)

    setFormData((prev) => ({ ...prev, message: newMessage }))
  }

  const availableVariables = {
    meeting: ["meeting_title", "location", "time", "date", "organizer"],
    task: ["task_title", "due_date", "assignee", "priority"],
    system: ["user_name", "date", "time"],
    message: ["sender_name", "message_preview"],
    reminder: ["event_title", "time", "location"],
    conflict: ["conflict_type", "affected_meetings"],
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {template ? "Editar Template" : "Novo Template"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Template *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Lembrete de Reunião"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="system">Sistema</option>
                  <option value="meeting">Reunião</option>
                  <option value="task">Tarefa</option>
                  <option value="message">Mensagem</option>
                  <option value="reminder">Lembrete</option>
                  <option value="conflict">Conflito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              {formData.type === "reminder" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tempo antes do evento (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.timeBeforeEvent || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, timeBeforeEvent: Number(e.target.value) || undefined }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="15"
                  />
                </div>
              )}
            </div>

            {/* Configurações */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Canais de Entrega
                </label>
                <div className="space-y-2">
                  {["browser", "email", "sms"].map((channel) => (
                    <label key={channel} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes(channel)}
                        onChange={() => toggleChannel(channel)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Níveis de Usuário
                </label>
                <div className="space-y-2">
                  {[
                    { level: 1, name: "CEO" },
                    { level: 2, name: "Diretores" },
                    { level: 3, name: "Gerentes" },
                    { level: 4, name: "Analistas" },
                    { level: 5, name: "Assistentes" },
                  ].map(({ level, name }) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.userLevels.includes(level)}
                        onChange={() => toggleUserLevel(level)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Template Ativo
                </label>
              </div>
            </div>
          </div>

          {/* Conteúdo da Notificação */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Reunião em {time} minutos"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem *</label>
                <div className="flex space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Variáveis disponíveis:</span>
                  {availableVariables[formData.type as keyof typeof availableVariables]?.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => addVariable(variable)}
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                id="message-input"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: A reunião '{meeting_title}' começará em {time} minutos na {location}"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preview da Notificação</h4>
            <div className="bg-white dark:bg-gray-700 p-3 rounded border-l-4 border-blue-500">
              <h5 className="font-semibold text-gray-900 dark:text-white">
                {formData.title || "Título da notificação"}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {formData.message || "Mensagem da notificação"}
              </p>
              <div className="flex space-x-2 mt-2">
                {formData.channels.map((channel) => (
                  <span
                    key={channel}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-600">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {template ? "Atualizar Template" : "Criar Template"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
