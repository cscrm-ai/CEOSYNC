"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts/AppContext"
import { X, Send, Target, Shield, Filter, Check, Edit, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LEVEL_NAMES, type NotificationCampaign } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NotificationCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (campaign: Omit<NotificationCampaign, "id" | "createdBy" | "createdAt" | "status" | "stats">) => void
  campaignToEdit?: NotificationCampaign
  forceApproval?: boolean
  createTitle?: string
}

export default function NotificationCampaignModal({
  isOpen,
  onClose,
  onSave,
  campaignToEdit,
  forceApproval = false,
  createTitle,
}: NotificationCampaignModalProps) {
  const { currentUser, users, notificationTemplates } = useApp()
  const isEditing = !!campaignToEdit

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    templateId: "",
    customTitle: "",
    customMessage: "",
    targetUsers: [] as string[],
    scheduledFor: "",
    requiresApproval: forceApproval || false,
    targetCriteria: {
      levels: [] as number[],
      isOnline: false,
    },
  })
  const [creationMode, setCreationMode] = useState<"template" | "custom">("template")

  useEffect(() => {
    if (isEditing && campaignToEdit) {
      setFormData({
        name: campaignToEdit.name,
        description: campaignToEdit.description,
        templateId: campaignToEdit.templateId || "",
        customTitle: campaignToEdit.customTitle || "",
        customMessage: campaignToEdit.customMessage || "",
        targetUsers: campaignToEdit.targetUsers,
        scheduledFor: campaignToEdit.scheduledFor
          ? new Date(campaignToEdit.scheduledFor).toISOString().substring(0, 16)
          : "",
        requiresApproval: campaignToEdit.requiresApproval,
        targetCriteria: {
          levels: [], // Reset filters on edit
          isOnline: false,
        },
      })
      if (campaignToEdit.templateId) {
        setCreationMode("template")
      } else {
        setCreationMode("custom")
      }
    } else {
      // For new campaigns
      setFormData((prev) => ({
        ...prev,
        requiresApproval: forceApproval,
        scheduledFor: new Date(Date.now() + 10 * 60 * 1000).toISOString().substring(0, 16), // Default to 10 mins in future
      }))
    }
  }, [isEditing, campaignToEdit, forceApproval])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    const campaignData: Omit<NotificationCampaign, "id" | "createdBy" | "createdAt" | "status" | "stats"> = {
      name: formData.name,
      description: formData.description,
      templateId: formData.templateId,
      customTitle: formData.customTitle,
      customMessage: formData.customMessage,
      targetUsers: formData.targetUsers,
      scheduledFor: formData.scheduledFor,
      requiresApproval: formData.requiresApproval,
    }

    if (creationMode === "template") {
      campaignData.customTitle = undefined
      campaignData.customMessage = undefined
    } else {
      campaignData.templateId = undefined
    }

    onSave(campaignData)
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
    setFormData((prev) => {
      const newLevels = prev.targetCriteria.levels.includes(level)
        ? prev.targetCriteria.levels.filter((l) => l !== level)
        : [...prev.targetCriteria.levels, level]

      return {
        ...prev,
        targetCriteria: {
          ...prev.targetCriteria,
          levels: newLevels,
        },
      }
    })
  }

  const applyFilters = () => {
    const filteredUserIds = users
      .filter((user) => {
        const matchesLevel =
          formData.targetCriteria.levels.length === 0 || formData.targetCriteria.levels.includes(user.level)
        const matchesOnlineStatus = !formData.targetCriteria.isOnline || user.isOnline
        return matchesLevel && matchesOnlineStatus
      })
      .map((u) => u.id)

    setFormData((prev) => ({
      ...prev,
      targetUsers: filteredUserIds,
    }))
  }

  const selectedTemplate = notificationTemplates.find((t) => t.id === formData.templateId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto m-4">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Editar Campanha" : createTitle || "Nova Campanha de Notificação"}
              </h2>
              <div className="flex items-center space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.templateId || formData.targetUsers.length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isEditing ? "Salvar Alterações" : formData.scheduledFor ? "Agendar" : "Enviar Agora"}
                </Button>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-8">
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
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Descreva o objetivo desta campanha..."
              />
            </div>

            {/* Template ou Mensagem Customizada */}
            <Tabs value={creationMode} onValueChange={(value) => setCreationMode(value as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template" disabled={isEditing && !!formData.customTitle}>
                  <FileText className="w-4 h-4 mr-2" />
                  Usar Template
                </TabsTrigger>
                <TabsTrigger value="custom" disabled={isEditing && !!formData.templateId}>
                  <Edit className="w-4 h-4 mr-2" />
                  Mensagem Customizada
                </TabsTrigger>
              </TabsList>
              <TabsContent value="template">
                <div className="mt-4">
                  <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Template de Notificação *
                  </label>
                  <select
                    id="templateId"
                    value={formData.templateId}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    required={creationMode === "template"}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione um template</option>
                    {notificationTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.type})
                      </option>
                    ))}
                  </select>
                </div>
              </TabsContent>
              <TabsContent value="custom">
                <div className="space-y-4 mt-4">
                  <div>
                    <label
                      htmlFor="customTitle"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Título da Notificação *
                    </label>
                    <input
                      type="text"
                      id="customTitle"
                      value={formData.customTitle}
                      onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
                      required={creationMode === "custom"}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Título que aparecerá na notificação"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="customMessage"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Mensagem da Notificação *
                    </label>
                    <textarea
                      id="customMessage"
                      value={formData.customMessage}
                      onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                      required={creationMode === "custom"}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Corpo da mensagem que o usuário receberá"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Aprovação */}
            {!forceApproval && (
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requiresApproval: e.target.checked }))}
                    className="mr-2 h-4 w-4"
                  />
                  <Shield className="w-4 h-4 mr-2 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requer aprovação antes do envio
                  </span>
                </label>
              </div>
            )}

            <div className="border-t dark:border-gray-700" />

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
                      {Object.entries(LEVEL_NAMES).map(([level, name]) => (
                        <label key={level} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.targetCriteria.levels.includes(Number(level))}
                            onChange={() => toggleLevel(Number(level))}
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
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center font-medium text-gray-900 dark:text-white">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({ ...prev, targetUsers: users.map((u) => u.id) }))
                          } else {
                            setFormData((prev) => ({ ...prev, targetUsers: [] }))
                          }
                        }}
                        checked={formData.targetUsers.length === users.length && users.length > 0}
                        className="mr-3"
                      />
                      Selecionar Todos
                    </label>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
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
          </div>
        </form>
      </div>
    </div>
  )
}
