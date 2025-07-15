"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Login } from "@/components/auth/Login"
import { SignUp } from "@/components/auth/SignUp"
import { PasswordRecovery } from "@/components/auth/PasswordRecovery"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && session) {
      router.push("/") // Redireciona para o dashboard se estiver logado
    }
  }, [session, loading, router])

  if (loading || (!loading && session)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        Carregando...
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">CEO SYNC</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Sua plataforma de gestão corporativa.</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Cadastro</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Acessar sua conta</CardTitle>
              </CardHeader>
              <CardContent>
                <Login onRecoverPassword={() => setActiveTab("recovery")} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Criar nova conta</CardTitle>
              </CardHeader>
              <CardContent>
                <SignUp />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recovery">
            <Card>
              <CardHeader>
                <CardTitle>Recuperar Senha</CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordRecovery onBackToLogin={() => setActiveTab("login")} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 