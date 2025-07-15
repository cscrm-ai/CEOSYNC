"use client"

import type React from "react"
import { useState } from "react"
import { useApp } from "@/contexts/AppContext"
import { MessageSquare, Send, Users, Search, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LEVEL_COLORS, LEVEL_NAMES } from "@/types"

export default function Chat() {
  const { currentUser, users, messages, addMessage } = useApp()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const availableUsers = users.filter((u) => u.id !== currentUser?.id)
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Obter conversas do usuário atual
  const getUserConversations = () => {
    const conversations = new Map()

    messages.forEach((message) => {
      if (message.senderId === currentUser?.id || message.receiverId === currentUser?.id) {
        const otherUserId = message.senderId === currentUser?.id ? message.receiverId : message.senderId
        if (otherUserId) {
          if (!conversations.has(otherUserId)) {
            conversations.set(otherUserId, [])
          }
          conversations.get(otherUserId).push(message)
        }
      }
    })

    return Array.from(conversations.entries())
      .map(([userId, msgs]) => {
        const user = users.find((u) => u.id === userId)
        const lastMessage = msgs.sort(
          (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )[0]
        const unreadCount = msgs.filter((m: any) => m.receiverId === currentUser?.id && !m.isRead).length

        return {
          user,
          messages: msgs,
          lastMessage,
          unreadCount,
        }
      })
      .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime())
  }

  const conversations = getUserConversations()
  const selectedUserData = users.find((u) => u.id === selectedUser)

  // Mensagens da conversa selecionada
  const conversationMessages = selectedUser
    ? messages
        .filter(
          (m) =>
            (m.senderId === currentUser?.id && m.receiverId === selectedUser) ||
            (m.senderId === selectedUser && m.receiverId === currentUser?.id),
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : []

  const sendMessage = () => {
    if (!messageText.trim() || !selectedUser || !currentUser) return

    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedUser,
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: false,
    }

    addMessage(newMessage)
    setMessageText("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chat Corporativo</h1>
        <p className="text-gray-600 mt-2">Comunicação interna da organização</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de Contatos */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Contatos
                </span>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {/* Conversas Existentes */}
                {conversations.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Conversas Recentes
                    </div>
                    {conversations.map(({ user, lastMessage, unreadCount }) => {
                      if (!user) return null
                      return (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user.id)}
                          className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                            selectedUser === user.id ? "bg-blue-50 border-blue-500" : "border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {user.name.charAt(0)}
                                </div>
                                {user.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>
                              </div>
                            </div>
                            {unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Todos os Usuários */}
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Todos os Usuários
                  </div>
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                        selectedUser === user.id ? "bg-blue-50 border-blue-500" : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[user.level]}`}
                            >
                              {LEVEL_NAMES[user.level]}
                            </span>
                            <span className="text-sm text-gray-500">{user.position}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área de Chat */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            {selectedUserData ? (
              <>
                {/* Header da Conversa */}
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedUserData.name.charAt(0)}
                      </div>
                      {selectedUserData.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedUserData.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[selectedUserData.level]}`}
                        >
                          {LEVEL_NAMES[selectedUserData.level]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {selectedUserData.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Mensagens */}
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  {conversationMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma mensagem ainda</p>
                        <p className="text-sm">Inicie uma conversa com {selectedUserData.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversationMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === currentUser?.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-900"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === currentUser?.id ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                {/* Input de Mensagem */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button onClick={sendMessage} disabled={!messageText.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                  <p>Escolha um contato para iniciar uma conversa</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
