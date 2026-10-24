'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Home, BookOpen, Dumbbell, UtensilsCrossed, Target, UserCircle, LogOut, Zap, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/estudos', label: 'Estudos', icon: BookOpen },
  { href: '/treinos', label: 'Treinos', icon: Dumbbell },
  { href: '/alimentacao', label: 'Alimentação', icon: UtensilsCrossed },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/conta', label: 'Conta', icon: UserCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg">PerfomAC</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-secondary">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-card/95 backdrop-blur-md border-r border-border flex flex-col transition-transform duration-300',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          <span className="font-display font-bold text-xl neon-text">PerfomAC</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  active ? 'bg-primary/15 text-primary neon-glow' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}>
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3">
          <button onClick={() => signOut({ redirectTo: '/login' })}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition-all">
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border flex justify-around py-2 px-1">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-all',
                active ? 'text-primary' : 'text-muted-foreground'
              )}>
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
