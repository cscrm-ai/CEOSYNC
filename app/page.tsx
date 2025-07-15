"use client"
import { AppProvider, useApp } from "@/contexts/AppContext"
import Dashboard from "@/components/Dashboard"
import Agenda from "@/components/Agenda"
import Chat from "@/components/Chat"
import Users from "@/components/Users"
import Notifications from "@/components/Notifications"
import Tasks from "@/components/Tasks"
import Analytics from "@/components/Analytics"
import NotificationAdmin from "@/components/NotificationAdmin"
import ApprovalWorkflow from "@/components/ApprovalWorkflow"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"

function AppContent() {
  const { activeSection } = useApp()

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "agenda":
        return <Agenda />
      case "chat":
        return <Chat />
      case "tarefas":
        return <Tasks />
      case "usuarios":
        return <Users />
      case "analytics":
        return <Analytics />
      case "notificacoes":
        return <Notifications />
      case "admin-notifications":
        return <NotificationAdmin />
      case "approval-workflow":
        return <ApprovalWorkflow />
      default:
        return <Dashboard />
    }
  }

  return (
    <>
      <ServiceWorkerRegistration />
      {renderActiveSection()}
    </>
  )
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AppProvider>
    </ThemeProvider>
  )
}
