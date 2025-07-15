"use client"
import { useApp } from "@/contexts/AppContext"
import Layout from "@/components/Layout"
import Dashboard from "@/components/Dashboard"
import Agenda from "@/components/Agenda"
import Chat from "@/components/Chat"
import Users from "@/components/Users"
import Notifications from "@/components/Notifications"
import Tasks from "@/components/Tasks"
import Analytics from "@/components/Analytics"
import NotificationAdmin from "@/components/NotificationAdmin"
import ApprovalWorkflow from "@/components/ApprovalWorkflow"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"
import { useAuth } from "@/hooks/useAuth.tsx"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { activeSection } = useApp()
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push("/auth")
    }
  }, [session, loading, router])

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Carregando...</div>
      </div>
    )
  }

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
      <Layout>{renderActiveSection()}</Layout>
    </>
  )
}
