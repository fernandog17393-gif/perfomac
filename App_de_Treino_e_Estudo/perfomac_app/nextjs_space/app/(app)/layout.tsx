import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/app/sidebar'
import { AIChat } from '@/components/app/ai-chat'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <AIChat />
    </div>
  )
}
