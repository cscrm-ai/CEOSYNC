"use client"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { Plus, Edit, Trash2, Settings, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LEVEL_NAMES, type ApprovalRule } from "@/types"
import ApprovalRuleModal from "./ApprovalRuleModal"

export default function ApprovalRules() {
  const { currentUser, users, approvalRules, addApprovalRule, updateApprovalRule, deleteApprovalRule } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null)

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Usuário não encontrado"
  }

  const getUniqueApproversCount = () => {
    const approverIds = new Set<string>()
    approvalRules.forEach((rule) => {
      rule.approvers.userIds?.forEach((id) => approverIds.add(id))
    })
    return approverIds.size
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Regras de Aprovação</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Configure quando e quem deve aprovar campanhas de notificação
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Regra
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Regras Ativas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {approvalRules.filter((r) => r.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total de Regras</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{approvalRules.length}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Aprovadores Únicos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {getUniqueApproversCount()}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tempo Médio</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">18h</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Regras */}
      <div className="space-y-6">
        {approvalRules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${rule.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {rule.isActive ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{rule.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Criado por: {getUserName(rule.createdBy)}</span>
                    <span>•</span>
                    <span>{new Date(rule.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingRule(rule)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja excluir a regra "${rule.name}"?`)) {
                        deleteApprovalRule(rule.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Condições */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Condições</h4>
                  <div className="space-y-2 text-sm">
                    {rule.conditions.targetUserCount.min && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Min. destinatários:</span>
                        <span className="text-gray-900 dark:text-white">{rule.conditions.targetUserCount.min}</span>
                      </div>
                    )}
                    {rule.conditions.priority.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Prioridades:</span>
                        <span className="text-gray-900 dark:text-white">{rule.conditions.priority.join(", ")}</span>
                      </div>
                    )}
                    {rule.conditions.channels.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Canais:</span>
                        <span className="text-gray-900 dark:text-white">{rule.conditions.channels.join(", ")}</span>
                      </div>
                    )}
                    {rule.conditions.createdByLevels.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Níveis criadores:</span>
                        <span className="text-gray-900 dark:text-white">
                          {rule.conditions.createdByLevels.map((l) => LEVEL_NAMES[l as keyof typeof LEVEL_NAMES]).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aprovadores */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Aprovadores</h4>
                  <div className="space-y-2 text-sm">
                    {rule.approvers.levels && rule.approvers.levels.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Níveis:</span>
                        <span className="text-gray-900 dark:text-white">
                          {rule.approvers.levels.map((l) => LEVEL_NAMES[l as keyof typeof LEVEL_NAMES]).join(", ")}
                        </span>
                      </div>
                    )}
                    {rule.approvers.userIds && rule.approvers.userIds.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Usuários:</span>
                        <span className="text-gray-900 dark:text-white">
                          {rule.approvers.userIds.map((id) => getUserName(id)).join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Min. aprovadores:</span>
                      <span className="text-gray-900 dark:text-white">{rule.approvers.minApprovers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Requer todos:</span>
                      <span className="text-gray-900 dark:text-white">{rule.approvers.requireAll ? "Sim" : "Não"}</span>
                    </div>
                  </div>
                </div>

                {/* Configurações */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Configurações</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Auto-aprovação:</span>
                      <span className="text-gray-900 dark:text-white">
                        {rule.settings.allowSelfApproval ? "Permitida" : "Não permitida"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sequencial:</span>
                      <span className="text-gray-900 dark:text-white">
                        {rule.settings.requireSequentialApproval ? "Sim" : "Não"}
                      </span>
                    </div>
                    {rule.settings.autoApproveAfterHours && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Auto-aprovação:</span>
                        <span className="text-gray-900 dark:text-white">{rule.settings.autoApproveAfterHours}h</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Escalação:</span>
                      <span className="text-gray-900 dark:text-white">
                        {rule.settings.escalationEnabled ? "Habilitada" : "Desabilitada"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(showCreateModal || editingRule) && (
        <ApprovalRuleModal
          isOpen={showCreateModal || !!editingRule}
          onClose={() => {
            setShowCreateModal(false)
            setEditingRule(null)
          }}
          ruleToEdit={editingRule}
          onSave={async (ruleData) => {
            if (editingRule) {
              const updatedRule: ApprovalRule = {
                ...editingRule,
                ...ruleData,
                conditions: {
                  ...editingRule.conditions,
                  ...ruleData.conditions,
                },
                approvers: {
                  ...editingRule.approvers,
                  ...ruleData.approvers,
                },
                settings: {
                  ...editingRule.settings,
                  ...ruleData.settings,
                },
              }
              await updateApprovalRule(updatedRule)
            } else {
              await addApprovalRule(ruleData)
            }
            setShowCreateModal(false)
            setEditingRule(null)
          }}
          onDelete={async (ruleId) => {
            await deleteApprovalRule(ruleId)
            setShowCreateModal(false)
            setEditingRule(null)
          }}
        />
      )}
    </div>
  )
}
