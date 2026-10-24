'use client'
import { useState, useEffect, useRef } from 'react'
import { BookOpen, Plus, Play, Pause, RotateCcw, Upload, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface StudyItem { id: string; subject: string; type: string; duration: number; completed: boolean; createdAt: string }
interface FileItem { id: string; fileName: string; contentType: string; createdAt: string }

const STUDY_TYPES = ['ativo', 'passivo', 'pomodoro', 'revisão', 'exercícios']

export default function EstudosPage() {
  const [sessions, setSessions] = useState<StudyItem[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [subject, setSubject] = useState('')
  const [studyType, setStudyType] = useState('ativo')
  const [duration, setDuration] = useState(25)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [uploading, setUploading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    const [sRes, fRes] = await Promise.all([fetch('/api/study-sessions'), fetch('/api/files')])
    if (sRes.ok) setSessions(await sRes.json())
    if (fRes.ok) setFiles(await fRes.json())
  }
  useEffect(() => { fetchData() }, [])

  // Pomodoro timer
  useEffect(() => {
    if (timerRunning && timer > 0) {
      intervalRef.current = setInterval(() => setTimer((t) => t - 1), 1000)
    } else if (timer === 0 && timerRunning) {
      setTimerRunning(false)
      toast.success('Tempo esgotado! 🎉')
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerRunning, timer])

  const startTimer = () => { setTimer(duration * 60); setTimerRunning(true) }
  const toggleTimer = () => setTimerRunning(!timerRunning)
  const resetTimer = () => { setTimerRunning(false); setTimer(duration * 60) }
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const addSession = async () => {
    if (!subject.trim()) return
    const res = await fetch('/api/study-sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, type: studyType, duration }) })
    if (res.ok) { setSubject(''); fetchData(); toast.success('Sessão criada!') }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const presignRes = await fetch('/api/upload/presigned', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: false }) })
      if (!presignRes.ok) throw new Error('Erro ao gerar URL')
      const { uploadUrl, cloud_storage_path } = await presignRes.json()
      const uploadRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      if (!uploadRes.ok) throw new Error('Erro no upload')
      await fetch('/api/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: file.name, contentType: file.type, cloudStoragePath: cloud_storage_path, isPublic: false, size: file.size }) })
      toast.success('Arquivo enviado!')
      fetchData()
    } catch { toast.error('Erro ao enviar arquivo.') }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const downloadFile = async (id: string) => {
    const res = await fetch(`/api/files?id=${id}&action=download`)
    if (res.ok) { const { url } = await res.json(); const a = document.createElement('a'); a.href = url; a.download = ''; document.body.appendChild(a); a.click(); a.remove() }
  }

  const deleteFile = async (id: string) => {
    await fetch('/api/files', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-2"><BookOpen className="h-8 w-8 text-primary" /> Estudos</h1>
        <p className="text-muted-foreground mt-1">Organize suas sessões de estudo e materiais</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timer */}
        <Card className="neon-glow">
          <CardHeader><CardTitle>Timer Pomodoro</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-6xl font-mono font-bold text-primary">{formatTime(timer || duration * 60)}</p>
            </div>
            <div className="flex justify-center gap-2">
              {!timerRunning && timer === 0 ? (
                <Button onClick={startTimer}><Play className="mr-1 h-4 w-4" /> Iniciar</Button>
              ) : (
                <>
                  <Button onClick={toggleTimer} variant="secondary">{timerRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}{timerRunning ? 'Pausar' : 'Continuar'}</Button>
                  <Button onClick={resetTimer} variant="outline"><RotateCcw className="mr-1 h-4 w-4" /> Resetar</Button>
                </>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              {[15, 25, 45, 60].map((m) => (
                <button key={m} onClick={() => { setDuration(m); if (!timerRunning) setTimer(m * 60) }}
                  className={`px-3 py-1 rounded text-sm ${duration === m ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{m}min</button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New session */}
        <Card>
          <CardHeader><CardTitle>Nova Sessão de Estudo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} placeholder="Matéria..." />
            <div className="flex flex-wrap gap-2">
              {STUDY_TYPES.map((t) => (
                <button key={t} onClick={() => setStudyType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize ${studyType === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{t}</button>
              ))}
            </div>
            <Button onClick={addSession} className="w-full"><Plus className="mr-1 h-4 w-4" /> Criar Sessão</Button>
          </CardContent>
        </Card>
      </div>

      {/* Files */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Biblioteca de Arquivos</CardTitle>
            <div>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleUpload} className="hidden" />
              <Button size="sm" onClick={() => fileInputRef.current?.click()} loading={uploading}><Upload className="mr-1 h-4 w-4" /> Enviar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(files ?? []).map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <FileText className="h-5 w-5 text-primary" />
                <span className="flex-1 text-sm truncate">{f.fileName}</span>
                <Button size="sm" variant="ghost" onClick={() => downloadFile(f.id)}>Baixar</Button>
                <button onClick={() => deleteFile(f.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {(files ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum arquivo enviado</p>}
          </div>
        </CardContent>
      </Card>

      {/* Sessions history */}
      <Card>
        <CardHeader><CardTitle>Histórico de Sessões</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(sessions ?? []).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="flex-1 text-sm font-medium">{s.subject}</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded capitalize">{s.type}</span>
                <span className="text-xs font-mono text-muted-foreground">{s.duration}min</span>
              </div>
            ))}
            {(sessions ?? []).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma sessão registrada</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
