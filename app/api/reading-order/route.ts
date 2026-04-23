/**
 * API endpoint for logging reading order events.
 * Accepts POST requests with sentence interaction data.
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface ReadingOrderPayload {
  session_id: string;
  response_id?: string;
  paragraph_index: number;
  sentence_index: number;
  sentence_text: string;
  read_first_position?: number;
  interaction_type: 'click' | 'focus' | 'scroll' | 'hover';
  user_agent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: ReadingOrderPayload = await request.json();

    // Validate required fields
    if (
      !payload.session_id ||
      payload.paragraph_index === undefined ||
      payload.sentence_index === undefined ||
      !payload.sentence_text ||
      !payload.interaction_type
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into database
    const { data, error } = await supabase
      .from('response_reading_order')
      .insert([
        {
          session_id: payload.session_id,
          response_id: payload.response_id || null,
          paragraph_index: payload.paragraph_index,
          sentence_index: payload.sentence_index,
          sentence_text: payload.sentence_text,
          read_first_position: payload.read_first_position || null,
          interaction_type: payload.interaction_type,
          user_agent: payload.user_agent || null,
        },
      ])
      .select();

    if (error) {
      console.error('[reading-order] Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to log reading order event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('[reading-order] Request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve reading order analytics.
 * Query params:
 *   - sessionId: filter by session
 *   - responseId: filter by response
 *   - limit: max results (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const responseId = searchParams.get('responseId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);

    let query = supabase.from('response_reading_order').select('*');

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    if (responseId) {
      query = query.eq('response_id', responseId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[reading-order] Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reading order data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('[reading-order] GET request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
