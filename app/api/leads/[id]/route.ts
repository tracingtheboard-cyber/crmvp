import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Lead } from '@/types';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase is not configured. Please check your .env.local file.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseClient();
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseClient();
    const body: Partial<Lead> = await request.json();
    
    // Clean up the data
    const leadData: any = {};
    if (body.name !== undefined) leadData.name = body.name?.trim();
    if (body.email !== undefined) leadData.email = body.email?.trim() || null;
    if (body.phone !== undefined) leadData.phone = body.phone?.trim() || null;
    if (body.company !== undefined) leadData.company = body.company?.trim() || null;
    if (body.source !== undefined) leadData.source = body.source?.trim() || null;
    if (body.status !== undefined) leadData.status = body.status;
    if (body.notes !== undefined) leadData.notes = body.notes?.trim() || null;

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(leadData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PUT /api/leads/[id]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = getSupabaseClient();
    const { error } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
