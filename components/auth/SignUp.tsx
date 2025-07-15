"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { LEVEL_NAMES } from "@/types"

export function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [position, setPosition] = useState("")
  const [level, setLevel] = useState<number>(5)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await signUp(email, password, {
      name,
      position,
      level,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">{error}</div>}
      {message && <div className="p-3 bg-green-100 text-green-700 border border-green-200 rounded-md">{message}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-signup">Email</Label>
          <Input
            id="email-signup"
            type="email"
            placeholder="seu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <Input id="position" required value={position} onChange={(e) => setPosition(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Nível</Label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Object.entries(LEVEL_NAMES).map(([levelKey, levelName]) => (
              <option key={levelKey} value={levelKey}>
                {levelName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password-signup">Senha</Label>
          <Input id="password-signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Senha</Label>
          <Input
            id="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Cadastrando..." : "Criar conta"}
      </Button>
    </form>
  )
} 