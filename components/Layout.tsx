"use client"

import type React from "react"
import { useApp } from "@/contexts/AppContext"
import {
  Calendar,
  MessageSquare,
  Users,
  Bell,
  Home,
  LogOut,
  Settings,
  CheckSquare,
  BarChart3,
  Moon,
  Sun,
  Monitor,
  Shield,
  GitBranch,
} from "lucide-react"
import { LEVEL_COLORS, LEVEL_NAMES } from "@/types"
import { useTheme } from "@/contexts/ThemeContext"
import AIAssistant from "./AIAssistant"
import NotificationStatus from "./NotificationStatus"
import LiveNotifications from "./LiveNotifications"
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications"
import { useAuth } from "@/hooks/useAuth.tsx"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { currentUser, activeSection, setActiveSection, notifications } = useApp()
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()

  const unreadNotifications = notifications.filter((n) => !n.isRead && n.userId === currentUser?.id).length

  // Ativar notificações em tempo real
  useRealTimeNotifications()

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "tarefas", label: "Tarefas", icon: CheckSquare },
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "notificacoes", label: "Notificações", icon: Bell, badge: unreadNotifications },
  ]

  // Adicionar painel administrativo para CEOs e Diretores
  if (currentUser && currentUser.level <= 2) {
    menuItems.push({
      id: "admin-notifications",
      label: "Admin Notificações",
      icon: Shield,
    })
  }

  if (!currentUser) {
    return <div>Carregando...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">CEO SYNC</h1>
            <div className="mt-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{currentUser.name}</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[currentUser.level]}`}
                >
                  {LEVEL_NAMES[currentUser.level]}
                </span>
              </div>
            </div>
          </div>
          <NotificationStatus />
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500 text-blue-600"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mt-6 px-6">
          <div className="border-t dark:border-gray-700 pt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Tema</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-md transition-colors ${
                  theme === "light"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-md transition-colors ${
                  theme === "dark"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("auto")}
                className={`p-2 rounded-md transition-colors ${
                  theme === "auto"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t dark:border-gray-700">
          <button className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            Configurações
          </button>
          <button
            onClick={signOut}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mt-2"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">{children}</div>
        <AIAssistant />
        <LiveNotifications />
      </div>
    </div>
  )
}
