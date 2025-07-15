"use client"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { Plus, Edit, Trash2, Settings, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LEVEL_NAMES, type ApprovalRule } from "@/types"

export default function ApprovalRules() {
  const { currentUser, users } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock data para regras de aprovação
  const mockRules: ApprovalRule[] = [
    {
      id: "1",
      name: "Campanhas de Alto Volume",
      description: "Campanhas com mais de 50 destinatários requerem aprovação de diretores",
      conditions: {
        campaignTypes: ["broadcast", "marketing"],
        targetUserCount: { min: 50 },
        priority: ["alta"],
        channels: ["email", "sms"],
        createdByLevels: [3, 4, 5],
      },
      approvers: {
        levels: [1, 2],
        minApprovers: 1,
        requireAll: false,
      },
      settings: {
        allowSelfApproval: false,
        requireSequentialApproval: false,
        autoApproveAfterHours: 24,
        escalationEnabled: true,
      },
      isActive: true,
      createdBy: "1",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      name: "Notificações Críticas",
      description: "Todas as notificações críticas devem ser aprovadas pelo CEO",
      conditions: {
        campaignTypes: ["system", "emergency"],
        priority: ["critica"],
        channels: ["browser", "email", "sms"],
        createdByLevels: [2, 3, 4, 5],
      },
      approvers: {
        levels: [1],
        minApprovers: 1,
        requireAll: true,
      },
      settings: {
        allowSelfApproval: false,
        requireSequentialApproval: true,
        autoApproveAfterHours: 2,
        escalationEnabled: false,
      },
      isActive: true,
      createdBy: "1",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "3",
      name: "Campanhas de Marketing",
      description: "Campanhas de marketing requerem aprovação do gerente de marketing",
      conditions: {
        campaignTypes: ["marketing", "promotional"],
        targetUserCount: { min: 10 },
        priority: ["media", "alta"],
        channels: ["email"],
        createdByLevels: [4, 5],
      },
      approvers: {
        userIds: ["4"], // Ana Oliveira - Gerente de Vendas
        minApprovers: 1,
        requireAll: true,
      },
      settings: {
        allowSelfApproval: true,
        requireSequentialApproval: false,
        autoApproveAfterHours: 48,
        escalationEnabled: true,
      },
      isActive: true,
      createdBy: "2",
      createdAt: "2024-01-01T10:00:00Z",
    },
  ]

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Usuário não encontrado"
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
                  {mockRules.filter((r) => r.isActive).length}
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
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{mockRules.length}</p>
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
                  {new Set(mockRules.flatMap((r) => r.approvers.userIds || [])).size}
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
        {mockRules.map((rule) => (
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
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
                          {rule.conditions.createdByLevels.map((l) => LEVEL_NAMES[l]).join(", ")}
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
                          {rule.approvers.levels.map((l) => LEVEL_NAMES[l]).join(", ")}
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
    </div>
  )
}
