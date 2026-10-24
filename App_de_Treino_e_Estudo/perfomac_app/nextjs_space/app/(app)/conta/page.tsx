'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { UserCircle, Users, UserPlus, Check, X, LogOut, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface FriendData { id: string; name: string | null; email: string; image: string | null }
interface RequestData { id: string; sender: FriendData; receiver: FriendData; status: string }

export default function ContaPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [friends, setFriends] = useState<FriendData[]>([])
  const [requests, setRequests] = useState<RequestData[]>([])
  const [searchEmail, setSearchEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(session?.user?.name ?? '')
    fetchFriends()
    fetchRequests()
  }, [session?.user?.name])

  const fetchFriends = async () => {
    const res = await fetch('/api/friends')
    if (res.ok) setFriends(await res.json())
  }

  const fetchRequests = async () => {
    const res = await fetch('/api/friends/requests')
    if (res.ok) setRequests(await res.json())
  }

  const updateProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/auth/login', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, bio }) })
    setSaving(false)
    if (res.ok) { toast.success('Perfil atualizado!'); update() } else toast.error('Erro ao salvar.')
  }

  const sendRequest = async () => {
    if (!searchEmail.trim()) return
    const res = await fetch('/api/friends/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: searchEmail }) })
    const data = await res.json()
    if (res.ok) { setSearchEmail(''); fetchRequests(); toast.success('Solicitação enviada!') }
    else toast.error(data?.error ?? 'Erro')
  }

  const respondRequest = async (id: string, accept: boolean) => {
    await fetch('/api/friends/requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: accept ? 'accepted' : 'rejected' }) })
    fetchFriends(); fetchRequests()
    toast.success(accept ? 'Amizade aceita!' : 'Solicitação recusada.')
  }

  const pendingReceived = (requests ?? []).filter((r) => r?.status === 'pending' && r?.receiver?.email === session?.user?.email)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-2"><UserCircle className="h-8 w-8 text-primary" /> Minha Conta</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil e amizades</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"><UserCircle className="h-10 w-10 text-primary" /></div>
              <div><p className="font-medium">{session?.user?.name ?? 'Usuário'}</p><p className="text-sm text-muted-foreground" suppressHydrationWarning>{session?.user?.email}</p></div>
            </div>
            <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Nome" />
            <Input value={bio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBio(e.target.value)} placeholder="Bio (opcional)" />
            <div className="flex gap-2">
              <Button onClick={updateProfile} loading={saving}>Salvar</Button>
              <Button variant="destructive" onClick={() => signOut({ redirectTo: '/login' })}><LogOut className="mr-1 h-4 w-4" /> Sair</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Adicionar Amigo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={searchEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchEmail(e.target.value)} placeholder="E-mail do amigo..." className="flex-1" />
              <Button onClick={sendRequest}><Search className="mr-1 h-4 w-4" /> Buscar</Button>
            </div>
            {pendingReceived.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Solicitações pendentes:</p>
                {pendingReceived.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-sm">{r?.sender?.name ?? r?.sender?.email}</span>
                    <button onClick={() => respondRequest(r.id, true)} className="text-green-400 hover:text-green-300"><Check className="h-5 w-5" /></button>
                    <button onClick={() => respondRequest(r.id, false)} className="text-destructive hover:text-red-300"><X className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Amigos ({(friends ?? []).length})</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {(friends ?? []).map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><UserCircle className="h-6 w-6 text-primary" /></div>
                <div><p className="text-sm font-medium">{f?.name ?? 'Usuário'}</p><p className="text-xs text-muted-foreground" suppressHydrationWarning>{f?.email}</p></div>
              </div>
            ))}
            {(friends ?? []).length === 0 && <p className="text-sm text-muted-foreground py-4 col-span-2 text-center">Nenhum amigo ainda</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
