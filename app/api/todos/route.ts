import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import type { TodoPriority, TodoStatus } from '@/types/todos'

// POST /api/todos — create a new todo
export async function POST(req: NextRequest) {
  const supabase = createAdminClient()

  const body = await req.json() as {
    title: string
    priority?: TodoPriority
    status?: TodoStatus
    assigned_agent?: string | null
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('todos')
    .insert({
      title: body.title.trim(),
      priority: body.priority ?? 'medium',
      status: body.status ?? 'pending',
      assigned_agent: body.assigned_agent ?? null,
    } as never)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/todos — update status (and optionally assigned_agent)
export async function PATCH(req: NextRequest) {
  const supabase = createAdminClient()

  const body = await req.json() as {
    id: string
    status?: TodoStatus
    assigned_agent?: string | null
    priority?: TodoPriority
  }

  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.status !== undefined)         update.status         = body.status
  if (body.assigned_agent !== undefined) update.assigned_agent = body.assigned_agent
  if (body.priority !== undefined)       update.priority       = body.priority

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('todos')
    .update(update as never)
    .eq('id', body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

// DELETE /api/todos?id=<uuid>
export async function DELETE(req: NextRequest) {
  const supabase = createAdminClient()
  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: 400 })
  }

  const { error } = await supabase.from('todos').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return new NextResponse(null, { status: 204 })
}
