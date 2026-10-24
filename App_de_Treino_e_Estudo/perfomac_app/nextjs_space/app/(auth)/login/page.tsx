'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        setError('E-mail ou senha incorretos.')
      } else {
        router.replace('/home')
      }
    } catch {
      setError('Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-display font-bold tracking-tight neon-text">PerfomAC</h1>
          </div>
          <p className="text-muted-foreground">Acesse sua conta para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 space-y-5 neon-glow">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className="pl-10" placeholder="seu@email.com" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} className="pl-10" placeholder="••••••••" required />
            </div>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            <LogIn className="mr-2 h-4 w-4" /> Entrar
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Não tem conta? <Link href="/signup" className="text-primary hover:underline font-medium">Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
