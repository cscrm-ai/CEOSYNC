"use client"

import type React from "react"
import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { UsersIcon, Plus, Edit, Trash2, Search, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LEVEL_COLORS, LEVEL_NAMES, type User } from "@/types"

export default function Users() {
  const { currentUser, users, updateUser, deleteUser } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = selectedLevel === "all" || user.level === selectedLevel

    return matchesSearch && matchesLevel
  })

  const canEditUser = (user: User) => {
    if (!currentUser) return false
    if (currentUser.level === 1) return true // CEO pode editar todos
    return currentUser.level < user.level // Níveis superiores podem editar inferiores
  }

  const canDeleteUser = (user: User) => {
    if (!currentUser) return false
    if (currentUser.level === 1 && user.id !== currentUser.id) return true // CEO pode deletar todos exceto ele mesmo
    return false // Apenas CEO pode deletar
  }

  const getUserStats = () => {
    const total = users.length
    const online = users.filter((u) => u.isOnline).length
    const byLevel = {
      1: users.filter((u) => u.level === 1).length,
      2: users.filter((u) => u.level === 2).length,
      3: users.filter((u) => u.level === 3).length,
      4: users.filter((u) => u.level === 4).length,
      5: users.filter((u) => u.level === 5).length,
    }

    return { total, online, byLevel }
  }

  const stats = getUserStats()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-2">Controle total sobre usuários da organização</p>
        </div>
        {currentUser?.level === 1 && (
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Online</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.online}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CEOs/Diretores</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byLevel[1] + stats.byLevel[2]}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <UsersIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gerentes/Analistas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byLevel[3] + stats.byLevel[4]}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <UsersIcon className="w-6 h-6 text-yellow-600" />
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
                  placeholder="Buscar por nome, email ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value === "all" ? "all" : Number.parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Níveis</option>
                <option value={1}>CEO</option>
                <option value={2}>Diretores</option>
                <option value={3}>Gerentes</option>
                <option value={4}>Analistas</option>
                <option value={5}>Assistentes</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários da Organização ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuário</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cargo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nível</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-900">{user.position}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${LEVEL_COLORS[user.level]}`}
                      >
                        {LEVEL_NAMES[user.level]}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isOnline ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1 ${user.isOnline ? "bg-green-500" : "bg-gray-500"}`}
                        />
                        {user.isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        {canEditUser(user) && (
                          <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canDeleteUser(user) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja excluir ${user.name}?`)) {
                                deleteUser(user.id)
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(updatedUser) => {
            updateUser(updatedUser)
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}

// Modal de Edição de Usuário
interface UserEditModalProps {
  user: User
  onClose: () => void
  onSave: (user: User) => void
}

function UserEditModal({ user, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    position: user.position,
    level: user.level,
    isOnline: user.isOnline,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...user,
      ...formData,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Editar Usuário</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nível Hierárquico</label>
            <select
              value={formData.level}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, level: Number.parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>CEO</option>
              <option value={2}>Diretor</option>
              <option value={3}>Gerente</option>
              <option value={4}>Analista</option>
              <option value={5}>Assistente</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOnline"
              checked={formData.isOnline}
              onChange={(e) => setFormData((prev) => ({ ...prev, isOnline: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isOnline" className="text-sm font-medium text-gray-700">
              Usuário Online
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
