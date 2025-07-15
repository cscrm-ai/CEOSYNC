"use client"

import type React from "react"
import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { X, Save, Trash2, Check, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LEVEL_NAMES, type ApprovalRule } from "@/types"

interface ApprovalRuleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (rule: Omit<ApprovalRule, "id" | "createdBy" | "createdAt">) => void
  onDelete?: (ruleId: string) => void
  ruleToEdit?: ApprovalRule | null
}

export default function ApprovalRuleModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  ruleToEdit,
}: ApprovalRuleModalProps) {
  const { users } = useApp()
  const isEditing = !!ruleToEdit

  const [formData, setFormData] = useState({
    name: ruleToEdit?.name || "",
    description: ruleToEdit?.description || "",
    conditions: ruleToEdit?.conditions || {
      campaignTypes: [],
      targetUserCount: {},
      priority: [],
      channels: [],
      createdByLevels: [],
    },
    approvers: ruleToEdit?.approvers || {
      minApprovers: 1,
      requireAll: false,
    },
    settings: ruleToEdit?.settings || {
      allowSelfApproval: false,
      requireSequentialApproval: false,
      escalationEnabled: false,
    },
    isActive: ruleToEdit?.isActive ?? true,
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleConditionChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      conditions: { ...prev.conditions, [field]: value },
    }))
  }

  const handleApproverChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      approvers: { ...prev.approvers, [field]: value },
    }))
  }

  const handleSettingChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Editar Regra de Aprovação" : "Nova Regra de Aprovação"}
              </h2>
              <div className="flex items-center space-x-2">
                {isEditing && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(ruleToEdit.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Regra
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Regra *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Regra Ativa</span>
              </label>
            </div>

            <div className="border-t dark:border-gray-700" />

            {/* Condições */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Condições (SE...)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Outras condições aqui... */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    A campanha for criada por usuários dos níveis:
                  </label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(LEVEL_NAMES).map(([level, name]) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.conditions.createdByLevels.includes(Number(level))}
                          onChange={(e) => {
                            const levelNum = Number(level)
                            const newLevels = e.target.checked
                              ? [...formData.conditions.createdByLevels, levelNum]
                              : formData.conditions.createdByLevels.filter((l) => l !== levelNum)
                            handleConditionChange("createdByLevels", newLevels)
                          }}
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t dark:border-gray-700" />

            {/* Aprovadores */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aprovadores (ENTÃO...)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Aprovação por Nível
                  </label>
                  {/* Aprovação por Nível */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Aprovação por Usuário Específico
                  </label>
                  {/* Aprovação por Usuário Específico */}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 