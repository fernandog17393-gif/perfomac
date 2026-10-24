'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, CheckCircle2, Circle, Clock, Trash2, Target, Dumbbell, UtensilsCrossed, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface TaskItem { id: string; title: string; completed: boolean; priority: string; dueDate: string | null }
interface ReminderItem { id: string; title: string; time: string; active: boolean }

export default function HomePage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [newTask, setNewTask] = useState('')
  const [newReminder, setNewReminder] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [tRes, rRes] = await Promise.all([fetch('/api/tasks'), fetch('/api/reminders')])
      if (tRes.ok) setTasks(await tRes.json())
      if (rRes.ok) setReminders(await rRes.json())
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const addTask = async () => {
    if (!newTask.trim()) return
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTask }) })
    if (res.ok) { setNewTask(''); fetchData(); toast.success('Tarefa adicionada!') }
  }

  const toggleTask = async (id: string, completed: boolean) => {
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, completed: !completed }) })
    fetchData()
  }

  const deleteTask = async (id: string) => {
    await fetch('/api/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchData()
  }

  const addReminder = async () => {
    if (!newReminder.trim() || !reminderTime) return
    const res = await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newReminder, time: reminderTime }) })
    if (res.ok) { setNewReminder(''); setReminderTime(''); fetchData(); toast.success('Lembrete criado!') }
  }

  const deleteReminder = async (id: string) => {
    await fetch('/api/reminders', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchData()
  }

  const completed = tasks?.filter((t) => t?.completed)?.length ?? 0
  const total = tasks?.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Olá, {session?.user?.name ?? 'usuário'}! 👋</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas tarefas e lembretes do dia</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle2, label: 'Tarefas', value: `${completed}/${total}`, color: 'text-green-400' },
          { icon: BookOpen, label: 'Estudos', value: '—', color: 'text-blue-400' },
          { icon: Dumbbell, label: 'Treinos', value: '—', color: 'text-orange-400' },
          { icon: Target, label: 'Metas', value: '—', color: 'text-purple-400' },
        ].map((s, i) => (
          <Card key={i} className="bg-secondary/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold font-mono">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tasks */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Tarefas do Dia</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={newTask} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)} placeholder="Nova tarefa..." onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && addTask()} className="flex-1" />
              <Button size="icon" onClick={addTask}><Plus className="h-4 w-4" /></Button>
            </div>
            {loading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(tasks ?? []).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <button onClick={() => toggleTask(task.id, task.completed)}>
                      {task.completed ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    </button>
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                    <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                {(tasks ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa ainda</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Lembretes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={newReminder} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReminder(e.target.value)} placeholder="Lembrete..." className="flex-1" />
              <Input type="time" value={reminderTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReminderTime(e.target.value)} className="w-28" />
              <Button size="icon" onClick={addReminder}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(reminders ?? []).map((r) => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-sm">{r.title}</span>
                  <span className="text-xs font-mono text-muted-foreground">{r.time}</span>
                  <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {(reminders ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum lembrete</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
