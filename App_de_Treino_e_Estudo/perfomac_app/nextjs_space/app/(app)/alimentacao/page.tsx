'use client'
import { useState, useEffect } from 'react'
import { UtensilsCrossed, Plus, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface MealItemData { name: string; quantity: string; calories: number | null }
interface MealData { id: string; name: string; time: string; items: { id: string; name: string; quantity: string | null; calories: number | null }[]; date: string }

export default function AlimentacaoPage() {
  const [meals, setMeals] = useState<MealData[]>([])
  const [mealName, setMealName] = useState('')
  const [mealTime, setMealTime] = useState('')
  const [items, setItems] = useState<MealItemData[]>([{ name: '', quantity: '', calories: null }])

  const fetchData = async () => {
    const res = await fetch('/api/meals')
    if (res.ok) setMeals(await res.json())
  }
  useEffect(() => { fetchData() }, [])

  const addItem = () => setItems([...items, { name: '', quantity: '', calories: null }])
  const updateItem = (i: number, field: string, val: any) => {
    const u = [...items]; (u[i] as any)[field] = val; setItems(u)
  }

  const createMeal = async () => {
    if (!mealName.trim() || !mealTime) return
    const res = await fetch('/api/meals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: mealName, time: mealTime, items: items.filter((it) => it.name.trim()) }) })
    if (res.ok) { setMealName(''); setMealTime(''); setItems([{ name: '', quantity: '', calories: null }]); fetchData(); toast.success('Refeição adicionada!') }
  }

  const deleteMeal = async (id: string) => {
    await fetch('/api/meals', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-2"><UtensilsCrossed className="h-8 w-8 text-primary" /> Alimentação</h1>
        <p className="text-muted-foreground mt-1">Planeje suas refeições e acompanhe sua nutrição</p>
      </div>

      <Card className="neon-glow">
        <CardHeader><CardTitle>Nova Refeição</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input value={mealName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMealName(e.target.value)} placeholder="Ex: Café da manhã, Almoço..." className="flex-1" />
            <Input type="time" value={mealTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMealTime(e.target.value)} className="w-32" />
          </div>
          <p className="text-sm text-muted-foreground">Alimentos:</p>
          {items.map((it, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={it.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(i, 'name', e.target.value)} placeholder="Alimento" className="flex-1" />
              <Input value={it.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(i, 'quantity', e.target.value)} placeholder="Qtd" className="w-24" />
              <Input type="number" value={it.calories ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(i, 'calories', e.target.value ? parseInt(e.target.value) : null)} placeholder="kcal" className="w-20" />
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={addItem}><Plus className="mr-1 h-4 w-4" /> Alimento</Button>
            <Button onClick={createMeal} className="ml-auto"><Plus className="mr-1 h-4 w-4" /> Salvar</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(meals ?? []).map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium flex-1">{m.name}</span>
                <span className="text-sm font-mono text-muted-foreground">{m.time}</span>
                <button onClick={() => deleteMeal(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="pl-8 space-y-1">
                {(m.items ?? []).map((it) => (
                  <div key={it.id} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex-1">{it.name}</span>
                    {it.quantity && <span>{it.quantity}</span>}
                    {it.calories != null && <span>{it.calories} kcal</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {(meals ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma refeição registrada</p>}
      </div>
    </div>
  )
}
