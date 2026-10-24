'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [name, setName] = useState('')
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
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? 'Erro ao criar conta.')
        return
      }
      const signInRes = await signIn('credentials', { email, password, redirect: false })
      if (signInRes?.error) {
        setError('Conta criada, mas falha ao entrar automaticamente.')
      } else {
        router.replace('/home')
      }
    } catch {
      setError('Erro ao criar conta.')
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
          <p className="text-muted-foreground">Crie sua conta gratuitamente</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 space-y-5 neon-glow">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} className="pl-10" placeholder="Seu nome" required />
            </div>
          </div>
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
              <Input id="password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} className="pl-10" placeholder="Mínimo 6 caracteres" required minLength={6} />
            </div>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            <UserPlus className="mr-2 h-4 w-4" /> Criar Conta
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta? <Link href="/login" className="text-primary hover:underline font-medium">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
