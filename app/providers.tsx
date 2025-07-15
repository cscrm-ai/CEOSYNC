"use client"

import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider } from "@/hooks/useAuth.tsx"
import { AppProvider } from "@/contexts/AppContext"
import { NotificationProvider } from "@/contexts/NotificationContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
} 