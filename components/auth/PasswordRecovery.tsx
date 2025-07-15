"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"

interface PasswordRecoveryProps {
  onBackToLogin: () => void
}

export function PasswordRecovery({ onBackToLogin }: PasswordRecoveryProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { sendPasswordReset } = useAuth()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const { error } = await sendPasswordReset(email)
    if (error) {
      setError(error.message)
    } else {
      setMessage("Se uma conta com este e-mail existir, um link de recuperação será enviado.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handlePasswordReset} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">{error}</div>}
      {message && <div className="p-3 bg-green-100 text-green-700 border border-green-200 rounded-md">{message}</div>}
      <div className="space-y-2">
        <Label htmlFor="email-recovery">Email</Label>
        <Input
          id="email-recovery"
          type="email"
          placeholder="seu@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <p className="text-xs text-gray-500">
        Você receberá um e-mail com instruções para redefinir sua senha.
      </p>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </Button>
      <Button variant="link" className="w-full" onClick={onBackToLogin}>
        Voltar para o Login
      </Button>
    </form>
  )
} 