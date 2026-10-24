'use client'
import { useState, useEffect } from 'react'
import { Dumbbell, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface ExerciseData { name: string; sets: number; reps: number; weight: number | null }
interface WorkoutItem { id: string; name: string; type: string; completed: boolean; date: string; exercises: { id: string; name: string; sets: number; reps: number; weight: number | null }[] }

export default function TreinosPage() {
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState('academia')
  const [exercises, setExercises] = useState<ExerciseData[]>([{ name: '', sets: 3, reps: 12, weight: null }])
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchData = async () => {
    const res = await fetch('/api/workouts')
    if (res.ok) setWorkouts(await res.json())
  }
  useEffect(() => { fetchData() }, [])

  const addExercise = () => setExercises([...exercises, { name: '', sets: 3, reps: 12, weight: null }])
  const updateExercise = (i: number, field: string, val: any) => {
    const updated = [...exercises]
    ;(updated[i] as any)[field] = val
    setExercises(updated)
  }
  const removeExercise = (i: number) => setExercises(exercises.filter((_, idx) => idx !== i))

  const createWorkout = async () => {
    if (!name.trim() || exercises.every((e) => !e.name.trim())) return
    const res = await fetch('/api/workouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type, exercises: exercises.filter((e) => e.name.trim()) }) })
    if (res.ok) { setName(''); setExercises([{ name: '', sets: 3, reps: 12, weight: null }]); fetchData(); toast.success('Treino criado!') }
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    await fetch('/api/workouts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, completed: !completed }) })
    fetchData()
  }

  const deleteWorkout = async (id: string) => {
    await fetch('/api/workouts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-2"><Dumbbell className="h-8 w-8 text-primary" /> Treinos</h1>
        <p className="text-muted-foreground mt-1">Crie e acompanhe seus treinos de academia e calistenia</p>
      </div>

      {/* New Workout */}
      <Card className="neon-glow">
        <CardHeader><CardTitle>Novo Treino</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Nome do treino..." className="flex-1" />
            <div className="flex gap-1">
              {['academia', 'calistenia'].map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize ${type === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{t}</button>
              ))}
            </div>
          </div>
          {exercises.map((ex, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={ex.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExercise(i, 'name', e.target.value)} placeholder="Exercício" className="flex-1" />
              <Input type="number" value={ex.sets} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExercise(i, 'sets', parseInt(e.target.value) || 0)} className="w-16" placeholder="Séries" />
              <Input type="number" value={ex.reps} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExercise(i, 'reps', parseInt(e.target.value) || 0)} className="w-16" placeholder="Reps" />
              <Input type="number" value={ex.weight ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExercise(i, 'weight', e.target.value ? parseFloat(e.target.value) : null)} className="w-20" placeholder="Kg" />
              {exercises.length > 1 && <button onClick={() => removeExercise(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={addExercise} size="sm"><Plus className="mr-1 h-4 w-4" /> Exercício</Button>
            <Button onClick={createWorkout} className="ml-auto"><Plus className="mr-1 h-4 w-4" /> Salvar Treino</Button>
          </div>
        </CardContent>
      </Card>

      {/* Workouts list */}
      <div className="space-y-3">
        {(workouts ?? []).map((w) => (
          <Card key={w.id} className={w.completed ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleComplete(w.id, w.completed)}>
                  <CheckCircle2 className={`h-6 w-6 ${w.completed ? 'text-green-400' : 'text-muted-foreground'}`} />
                </button>
                <div className="flex-1">
                  <p className="font-medium">{w.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{w.type} • {(w.exercises ?? []).length} exercícios</p>
                </div>
                <button onClick={() => setExpanded(expanded === w.id ? null : w.id)} className="text-muted-foreground">
                  {expanded === w.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
                <button onClick={() => deleteWorkout(w.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              {expanded === w.id && (
                <div className="mt-3 space-y-1 pl-9">
                  {(w.exercises ?? []).map((ex) => (
                    <div key={ex.id} className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex-1">{ex.name}</span>
                      <span>{ex.sets}x{ex.reps}</span>
                      {ex.weight != null && <span>{ex.weight}kg</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {(workouts ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhum treino registrado</p>}
      </div>
    </div>
  )
}
