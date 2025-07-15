"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { X, Calendar, Send, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LEVEL_NAMES, type NotificationCampaign, type NotificationTemplate } from "@/types"

interface NotificationCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  templates: NotificationTemplate[]
  onSave: (campaign: NotificationCampaign) => void
}

export default function NotificationCampaignModal({
  isOpen,
  onClose,
  templates,
  onSave,
}: NotificationCampaignModalProps) {
  const { currentUser, users } = useApp()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    templateId: "",
    targetUsers: [] as string[],
    scheduledFor: "",
    targetCriteria: {
      levels: [] as number[],
      departments: [] as string[],
      isOnline: false,
    },
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    const newCampaign: NotificationCampaign = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      templateId: formData.templateId,
      targetUsers: formData.targetUsers,
      scheduledFor: formData.scheduledFor,
      status: "draft",
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
      },
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    }

    onSave(newCampaign)
    onClose()
  }

  const toggleUser = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter((id) => id !== userId)
        : [...prev.targetUsers, userId],
    }))
  }

  const toggleLevel = (level: number) => {
    setFormData((prev) => ({
      ...prev,
      targetCriteria: {
        ...prev.targetCriteria,
        levels: prev.targetCriteria.levels.includes(level)
          ? prev.targetCriteria.levels.filter((l) => l !== level)
          : [...prev.targetCriteria.levels, level],
      },
    }))
  }

  const applyFilters = () => {
    const filteredUsers = users.filter((user) => {
      const matchesLevel =
        formData.targetCriteria.levels.length === 0 || formData.targetCriteria.levels.includes(user.level)
      const matchesOnlineStatus = !formData.targetCriteria.isOnline || user.isOnline

      return matchesLevel && matchesOnlineStatus
    })

    setFormData((prev) => ({
      ...prev,
      targetUsers: filteredUsers.map((u) => u.id),
    }))
  }

  const selectedTemplate = templates.find((t) => t.id === formData.templateId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nova Campanha de Notificação</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Campanha *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Lembrete Reunião Mensal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agendamento (opcional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduledFor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descreva o objetivo desta campanha..."
            />
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template *</label>
            <select
              required
              value={formData.templateId}
              onChange={(e) => setFormData((prev) => ({ ...prev, templateId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecione um template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.type})
                </option>
              ))}
            </select>

            {selectedTemplate && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Preview do Template</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Título:</strong> {selectedTemplate.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Mensagem:</strong> {selectedTemplate.message}
                </p>
              </div>
            )}
          </div>

          {/* Seleção de Usuários */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Público-Alvo</h3>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formData.targetUsers.length} usuário(s) selecionado(s)
              </span>
            </div>

            {/* Filtros */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Filtros de Seleção</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Níveis Hierárquicos
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
                          checked={formData.targetCriteria.levels.includes(level)}
                          onChange={() => toggleLevel(level)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetCriteria.isOnline}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          targetCriteria: { ...prev.targetCriteria, isOnline: e.target.checked },
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Apenas usuários online</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <Button type="button" onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                    <Target className="w-4 h-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de Usuários */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">Usuários Disponíveis</span>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData((prev) => ({ ...prev, targetUsers: users.map((u) => u.id) }))}
                    >
                      Selecionar Todos
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData((prev) => ({ ...prev, targetUsers: [] }))}
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.targetUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="mr-3"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {LEVEL_NAMES[user.level]} • {user.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo */}
          {formData.targetUsers.length > 0 && selectedTemplate && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <Send className="w-4 h-4 mr-2" />
                Resumo da Campanha
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Template:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTemplate.name}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Destinatários:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{formData.targetUsers.length} usuários</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300">Canais:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedTemplate.channels.join(", ")}</p>
                </div>
              </div>
              {formData.scheduledFor && (
                <div className="mt-2">
                  <span className="text-gray-600 dark:text-gray-300">Agendado para:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(formData.scheduledFor).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-600">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!formData.templateId || formData.targetUsers.length === 0}
            >
              {formData.scheduledFor ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Campanha
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Agora
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
