"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useApp } from "@/contexts/AppContext"
import { CheckSquare, Plus, Calendar, User, Tag, Clock, Search, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PRIORITY_COLORS, TASK_STATUS_COLORS, type Task } from "@/types"

export default function Tasks() {
  const { currentUser, tasks, users, meetings, addTask, updateTask, deleteTask } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  // Filtrar tarefas
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority

    // Mostrar tarefas do usuário atual ou criadas por ele
    const isUserTask =
      task.assignedTo === currentUser?.id || task.createdBy === currentUser?.id || currentUser?.level === 1 // CEO vê todas

    return matchesSearch && matchesStatus && matchesPriority && isUserTask
  })

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || "Usuário não encontrado"
  }

  const getMeetingTitle = (meetingId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId)
    return meeting?.title || "Reunião não encontrada"
  }

  const getTaskStats = () => {
    if (!currentDate)
      return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 }
    const userTasks = tasks.filter(
      (task) => task.assignedTo === currentUser?.id || task.createdBy === currentUser?.id,
    )

    return {
      total: userTasks.length,
      pending: userTasks.filter((t) => t.status === "pendente").length,
      inProgress: userTasks.filter((t) => t.status === "em_progresso").length,
      completed: userTasks.filter((t) => t.status === "concluida").length,
      overdue: userTasks.filter((t) => new Date(t.dueDate) < currentDate && t.status !== "concluida").length,
    }
  }

  const stats = getTaskStats()

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      const updatedTask = {
        ...task,
        status: newStatus,
        completedAt: newStatus === "concluida" ? new Date().toISOString() : undefined,
      }
      await updateTask(updatedTask)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciamento de Tarefas</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Organize e acompanhe suas atividades</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pendentes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Em Progresso</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.inProgress}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Concluídas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.completed}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Atrasadas</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em_progresso">Em Progresso</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => {
          const isOverdue = currentDate && new Date(task.dueDate) < currentDate && task.status !== "concluida"
          return (
            <Card key={task.id} className={`${isOverdue ? "border-red-300 dark:border-red-600" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[task.status]}`}>
                      {task.status.replace("_", " ").charAt(0).toUpperCase() + task.status.replace("_", " ").slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{task.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    Responsável: {getUserName(task.assignedTo)}
                  </div>

                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    Prazo: {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                    {isOverdue && <span className="ml-2 text-red-600 font-medium">(Atrasada)</span>}
                  </div>

                  {task.meetingId && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Reunião: {getMeetingTitle(task.meetingId)}
                    </div>
                  )}

                  {task.tags.length > 0 && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Tag className="w-4 h-4 mr-2" />
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {task.assignedTo === currentUser?.id && task.status !== "concluida" && (
                  <div className="mt-4 flex space-x-2">
                    {task.status === "pendente" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(task.id, "em_progresso")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Iniciar
                      </Button>
                    )}
                    {task.status === "em_progresso" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(task.id, "concluida")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Concluir
                      </Button>
                    )}
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={async () => {
                      if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
                        await deleteTask(task.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Não há tarefas que correspondam aos filtros selecionados.
            </p>
          </CardContent>
        </Card>
      )}

      {showCreateModal && <CreateTaskModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />}
    </div>
  )
}

// Modal de Criação de Tarefa
interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const { currentUser, users, meetings, addTask, addNotification } = useApp()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    meetingId: "",
    dueDate: "",
    priority: "media" as Task["priority"],
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    const newTaskData: Omit<Task, "id" | "createdAt" | "completedAt"> = {
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      createdBy: currentUser.id,
      meetingId: formData.meetingId || undefined,
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: "pendente",
      tags: formData.tags,
    }

    const createdTask = await addTask(newTaskData)

    // Criar notificação para o responsável
    if (createdTask && formData.assignedTo !== currentUser.id) {
      addNotification({
        id: Date.now().toString() + "_task",
        type: "task",
        title: "Nova Tarefa Atribuída",
        message: `Você recebeu uma nova tarefa: ${formData.title}`,
        userId: formData.assignedTo,
        isRead: false,
        createdAt: new Date().toISOString(),
        taskId: createdTask.id,
        priority: formData.priority === "critica" ? "alta" : "media",
        deliveryStatus: {
          browser: "pending",
          email: "pending",
          sms: "pending",
        },
      })
    }

    onClose()
    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      meetingId: "",
      dueDate: "",
      priority: "media",
      tags: [],
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nova Tarefa</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: Preparar relatório mensal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descreva os detalhes da tarefa..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Responsável *</label>
              <select
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecione um usuário</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prazo *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as Task["priority"] }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reunião Relacionada
              </label>
              <select
                value={formData.meetingId}
                onChange={(e) => setFormData((prev) => ({ ...prev, meetingId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Nenhuma reunião</option>
                {meetings.map((meeting) => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Digite uma tag e pressione Enter"
              />
              <Button type="button" onClick={addTag} size="sm">
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-600">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Criar Tarefa
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
