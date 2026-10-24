export const dynamic = 'force-dynamic'
import { auth } from '@/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Não autorizado', { status: 401 })
  const { messages } = await request.json()
  const systemMsg = {
    role: 'system',
    content: 'Você é o assistente IA do PerfomAC, um app de performance pessoal. Ajude o usuário com dicas de treino (academia e calistenia), planos de estudo (pomodoro, estudo ativo, revisão), alimentação saudável, e definição de metas. Responda sempre em português do Brasil, de forma objetiva e motivacional. Nunca invente dados médicos específicos — recomende consultar um profissional quando necessário.'
  }
  const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-5.4-mini', messages: [systemMsg, ...(messages ?? [])], stream: true, max_tokens: 1500 }),
  })
  if (!response.ok) return new Response('Erro na API de IA', { status: 502 })
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()
      try {
        while (true) {
          const { done, value } = await reader!.read()
          if (done) break
          const chunk = decoder.decode(value)
          controller.enqueue(encoder.encode(chunk))
        }
      } catch (error) {
        console.error('Stream error:', error)
        controller.error(error)
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } })
}
