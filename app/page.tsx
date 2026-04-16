import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: initialTodos } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      {/* DashboardShell renders a live-aware DashboardHeader internally */}
      <DashboardShell initialTodos={initialTodos ?? []} />
    </main>
  )
}
