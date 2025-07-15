"use client"

import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { CheckCircle, XCircle, Clock, MessageSquare, Send, Eye, Calendar, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ApprovalModal from "./ApprovalModal"

// Definindo os tipos localmente para evitar problemas de importação
interface ApprovalWorkflow {
  id: string
  campaignId: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  requestedBy: string
  requestedAt: string
  approvers: Array<{
    userId: string
    status: "pending" | "approved" | "rejected"
    comment?: string
    approvedAt?: string
    order: number
  }>
  currentStep: number
  totalSteps: number
  finalDecision?: {
    status: "approved" | "rejected"
    decidedBy: string
    decidedAt: string
    comment?: string
  }
  settings: {
    requireAllApprovers: boolean
    allowParallelApproval: boolean
    autoApproveAfterHours?: number
  }
}

interface NotificationCampaign {
  id: string
  name: string
  description: string
  templateId: string
  targetUsers: string[]
  scheduledFor: string
  status: "draft" | "pending_approval" | "approved" | "rejected" | "scheduled" | "sent" | "cancelled"
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: string
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    failed: number
  }
  createdBy: string
  createdAt: string
}

export default function ApprovalWorkflow() {
  const { currentUser, users, notifications } = useApp()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)

  // Verificar se o usuário tem permissão de administrador
  if (!currentUser || currentUser.level > 2) {
    return (
      <div className="p-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Acesso Negado</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Apenas CEOs e Diretores têm acesso ao painel de workflow de aprovação.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock data para workflows de aprovação
  const mockWorkflows: ApprovalWorkflow[] = [
    {
      id: "1",
      campaignId: "camp_1",
      status: "pending",
      requestedBy: "4",
      requestedAt: "2024-01-15T10:00:00Z",
      approvers: [
        {
          userId: "2",
          status: "approved",
          comment: "Aprovado. Boa iniciativa para engajamento.",
          approvedAt: "2024-01-15T11:30:00Z",
          order: 1,
        },
        {
          userId: "1",
          status: "pending",
          order: 2,
        },
      ],
      currentStep: 2,
      totalSteps: 2,
      settings: {
        requireAllApprovers: true,
        allowParallelApproval: false,
        autoApproveAfterHours: 24,
      },
    },
    {
      id: "2",
      campaignId: "camp_2",
      status: "approved",
      requestedBy: "5",
      requestedAt: "2024-01-14T14:00:00Z",
      approvers: [
        {
          userId: "2",
          status: "approved",
          comment: "Aprovado rapidamente.",
          approvedAt: "2024-01-14T15:00:00Z",
          order: 1,
        },
      ],
      currentStep: 1,
      totalSteps: 1,
      finalDecision: {
        status: "approved",
        decidedBy: "2",
        decidedAt: "2024-01-14T15:00:00Z",
        comment: "Campanha aprovada para execução imediata.",
      },
      settings: {
        requireAllApprovers: false,
        allowParallelApproval: true,
      },
    },
  ]

  const mockCampaigns: NotificationCampaign[] = [
    {
      id: "camp_1",
      name: "Lembrete Reunião Trimestral",
      description: "Notificação para todos os gerentes sobre a reunião trimestral",
      templateId: "template_1",
      targetUsers: ["3", "4", "5"],
      scheduledFor: "2024-01-20T09:00:00Z",
      status: "pending_approval",
      requiresApproval: true,
      stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
      createdBy: "4",
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "camp_2",
      name: "Atualização Sistema CRM",
      description: "Comunicado sobre nova versão do sistema",
      templateId: "template_2",
      targetUsers: ["1", "2", "3", "4", "5", "6", "7"],
      scheduledFor: "2024-01-18T08:00:00Z",
      status: "approved",
      requiresApproval: true,
      approvedBy: "2",
      approvedAt: "2024-01-14T15:00:00Z",
      stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
      createdBy: "5",
      createdAt: "2024-01-14T14:00:00Z",
    },
  ]

  const tabs = [
    { id: "overview", label: "Visão Geral", count: mockWorkflows.length },
    { id: "pending", label: "Pendentes", count: mockWorkflows.filter((w) => w.status === "pending").length },
    { id: "approved", label: "Aprovadas", count: mockWorkflows.filter((w) => w.status === "approved").length },
    { id: "rejected", label: "Rejeitadas", count: mockWorkflows.filter((w) => w.status === "rejected").length },
  ]

  const filteredWorkflows =
    activeTab === "overview" ? mockWorkflows : mockWorkflows.filter((workflow) => workflow.status === activeTab)

  const getWorkflowCampaign = (campaignId: string) => {
    return mockCampaigns.find((c) => c.id === campaignId)
  }

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Usuário não encontrado"
  }

  const canApprove = (workflow: ApprovalWorkflow) => {
    if (!currentUser) return false
    const currentApprover = workflow.approvers.find((a) => a.userId === currentUser.id)
    return currentApprover && currentApprover.status === "pending"
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workflow de Aprovação</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie aprovações de campanhas de notificação</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Aguardando Aprovação</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {mockWorkflows.filter((w) => w.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Aprovadas Hoje</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {mockWorkflows.filter((w) => w.status === "approved").length}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tempo Médio</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">2.5h</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Taxa de Aprovação</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">87%</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Lista de Workflows */}
      <div className="space-y-6">
        {filteredWorkflows.map((workflow) => {
          const campaign = getWorkflowCampaign(workflow.campaignId)
          if (!campaign) return null

          return (
            <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{campaign.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Solicitado por: {getUserName(workflow.requestedBy)}</span>
                      <span>•</span>
                      <span>{new Date(workflow.requestedAt).toLocaleString("pt-BR")}</span>
                      <span>•</span>
                      <span>{campaign.targetUsers.length} destinatários</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <WorkflowStatusBadge status={workflow.status} />
                    {canApprove(workflow) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflow)
                          setShowApprovalModal(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Revisar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progresso do Workflow */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progresso da Aprovação
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {workflow.currentStep}/{workflow.totalSteps}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(workflow.currentStep / workflow.totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Lista de Aprovadores */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Aprovadores</h4>
                    <div className="space-y-2">
                      {workflow.approvers.map((approver) => (
                        <div key={approver.userId} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {getUserName(approver.userId).charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {getUserName(approver.userId)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Etapa {approver.order}</p>
                            </div>
                          </div>
                          <div className="flex-1" />
                          <ApprovalStatusIcon status={approver.status} />
                          {approver.comment && (
                            <Button variant="ghost" size="sm" title={approver.comment}>
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          )}
                          {approver.approvedAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(approver.approvedAt).toLocaleString("pt-BR")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex justify-end space-x-2 pt-3 border-t dark:border-gray-600">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Campanha
                    </Button>
                    {workflow.status === "approved" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Send className="w-4 h-4 mr-2" />
                        Executar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal de Aprovação */}
      {showApprovalModal && selectedWorkflow && (
        <ApprovalModal
          workflow={selectedWorkflow}
          campaign={getWorkflowCampaign(selectedWorkflow.campaignId)!}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedWorkflow(null)
          }}
          onApprove={(comment) => {
            console.log("Aprovado:", comment)
            setShowApprovalModal(false)
            setSelectedWorkflow(null)
          }}
          onReject={(comment) => {
            console.log("Rejeitado:", comment)
            setShowApprovalModal(false)
            setSelectedWorkflow(null)
          }}
        />
      )}
    </div>
  )
}

// Componentes auxiliares
function WorkflowStatusBadge({ status }: { status: ApprovalWorkflow["status"] }) {
  const statusConfig = {
    pending: {
      label: "Pendente",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: Clock,
    },
    approved: {
      label: "Aprovado",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: CheckCircle,
    },
    rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle },
    cancelled: {
      label: "Cancelado",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      icon: XCircle,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  )
}

function ApprovalStatusIcon({ status }: { status: "pending" | "approved" | "rejected" }) {
  switch (status) {
    case "approved":
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case "rejected":
      return <XCircle className="w-5 h-5 text-red-600" />
    default:
      return <Clock className="w-5 h-5 text-yellow-600" />
  }
}
