'use client'
import { useState, useEffect } from 'react'
import { Target, Plus, Trash2, Trophy, TrendingUp, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface GoalData { id: string; title: string; description: string | null; target: number; current: number; unit: string; deadline: string | null; isPublic: boolean; completed: boolean }

export default function MetasPage() {
  const [goals, setGoals] = useState<GoalData[]>([])
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState(100)
  const [unit, setUnit] = useState('%')
  const [deadline, setDeadline] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [progressVal, setProgressVal] = useState(0)
  const [progressGoalId, setProgressGoalId] = useState<string | null>(null)

  const fetchData = async () => {
    const res = await fetch('/api/goals')
    if (res.ok) setGoals(await res.json())
  }
  useEffect(() => { fetchData() }, [])

  const createGoal = async () => {
    if (!title.trim()) return
    const res = await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, target, unit, deadline: deadline || null, isPublic }) })
    if (res.ok) { setTitle(''); setTarget(100); setUnit('%'); setDeadline(''); fetchData(); toast.success('Meta criada!') }
  }

  const addProgress = async (goalId: string) => {
    if (progressVal <= 0) return
    await fetch('/api/goals/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goalId, value: progressVal }) })
    setProgressVal(0); setProgressGoalId(null); fetchData(); toast.success('Progresso registrado!')
  }

  const togglePublic = async (id: string, pub: boolean) => {
    await fetch('/api/goals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isPublic: !pub }) })
    fetchData()
  }

  const deleteGoal = async (id: string) => {
    await fetch('/api/goals', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-2"><Target className="h-8 w-8 text-primary" /> Metas</h1>
        <p className="text-muted-foreground mt-1">Defina e acompanhe sua evolução pessoal</p>
      </div>

      <Card className="neon-glow">
        <CardHeader><CardTitle>Nova Meta</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Título da meta..." />
          <div className="flex gap-3">
            <Input type="number" value={target} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(parseInt(e.target.value) || 0)} placeholder="Alvo" className="w-24" />
            <Input value={unit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnit(e.target.value)} placeholder="Unidade" className="w-20" />
            <Input type="date" value={deadline} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)} className="flex-1" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPublic(e.target.checked)} className="rounded" />
              <Eye className="h-4 w-4" /> Visível para amigos
            </label>
            <Button onClick={createGoal} className="ml-auto"><Plus className="mr-1 h-4 w-4" /> Criar Meta</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(goals ?? []).map((g) => {
          const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0
          return (
            <Card key={g.id} className={g.completed ? 'border-green-500/30' : ''}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {g.completed ? <Trophy className="h-6 w-6 text-yellow-400" /> : <Target className="h-6 w-6 text-primary" />}
                  <div className="flex-1">
                    <p className="font-medium">{g.title}</p>
                    <p className="text-xs text-muted-foreground">{g.current}/{g.target} {g.unit}</p>
                  </div>
                  <button onClick={() => togglePublic(g.id, g.isPublic)} className="text-muted-foreground hover:text-foreground" title={g.isPublic ? 'Público' : 'Privado'}>
                    {g.isPublic ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deleteGoal(g.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <Progress value={pct} className="h-2" />
                <div className="flex gap-2 items-center">
                  {progressGoalId === g.id ? (
                    <>
                      <Input type="number" value={progressVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgressVal(parseInt(e.target.value) || 0)} placeholder="Valor" className="w-20" />
                      <Button size="sm" onClick={() => addProgress(g.id)}>Salvar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setProgressGoalId(null)}>Cancelar</Button>
                    </>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setProgressGoalId(g.id)}><TrendingUp className="mr-1 h-4 w-4" /> Progresso</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {(goals ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma meta criada</p>}
      </div>
    </div>
  )
}
