"use client"

import { useState } from "react"
import { X, CheckCircle, XCircle, MessageSquare, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ApprovalWorkflow, NotificationCampaign } from "@/types"

interface ApprovalModalProps {
  workflow: ApprovalWorkflow
  campaign: NotificationCampaign
  onClose: () => void
  onApprove: (comment: string) => void
  onReject: (comment: string) => void
}

export default function ApprovalModal({ workflow, campaign, onClose, onApprove, onReject }: ApprovalModalProps) {
  const [comment, setComment] = useState("")
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null)

  const handleSubmit = () => {
    if (!decision) return

    if (decision === "approve") {
      onApprove(comment)
    } else {
      onReject(comment)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Revisar Campanha</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações da Campanha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Detalhes da Campanha</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{campaign.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Agendado para:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(campaign.scheduledFor).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Destinatários:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{campaign.targetUsers.length} usuários</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progresso do Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Progresso da Aprovação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Etapa {workflow.currentStep} de {workflow.totalSteps}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round((workflow.currentStep / workflow.totalSteps) * 100)}% concluído
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(workflow.currentStep / workflow.totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decisão */}
          <Card>
            <CardHeader>
              <CardTitle>Sua Decisão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  variant={decision === "approve" ? "default" : "outline"}
                  onClick={() => setDecision("approve")}
                  className={decision === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button
                  variant={decision === "reject" ? "default" : "outline"}
                  onClick={() => setDecision("reject")}
                  className={decision === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comentário {decision === "reject" ? "(obrigatório)" : "(opcional)"}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Adicione um comentário sobre sua decisão..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!decision || (decision === "reject" && !comment.trim())}
            className={
              decision === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : decision === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
            }
          >
            {decision === "approve" ? "Confirmar Aprovação" : decision === "reject" ? "Confirmar Rejeição" : "Decidir"}
          </Button>
        </div>
      </div>
    </div>
  )
}
