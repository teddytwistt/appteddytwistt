"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Credenciales incorrectas")
        setIsLoading(false)
        return
      }

      if (data.success) {
        router.push("/admin")
        router.refresh()
      }
    } catch (err) {
      console.error("[login] Error:", err)
      setError("Error al iniciar sesión")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-cyan-500/30">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/images/logo-alpha.webp"
              alt="TeddyTwist Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-black text-white">Panel Administrativo</CardTitle>
          <CardDescription className="text-gray-400">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Ingrese email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Ingresar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
