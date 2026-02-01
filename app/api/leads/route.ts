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

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseClient();
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseClient();
    
    // Test connection and permissions first
    console.log('[Create Lead] Testing database connection...');
    const { error: testError } = await supabaseAdmin
      .from('leads')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('[Create Lead] Connection test failed:', {
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
        code: testError.code,
      });
      return NextResponse.json({
        error: `Database connection test failed: ${testError.message}. Please check if RLS is disabled or policies are configured correctly.`,
        details: testError.details,
        hint: testError.hint,
      }, { status: 500 });
    }
    
    console.log('[Create Lead] Connection test passed');
    
    const body: Lead = await request.json();
    console.log('[Create Lead] Received data:', { name: body.name, email: body.email });
    
    // Clean up the data - remove undefined values and ensure proper types
    const leadData: any = {
      name: body.name?.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      company: body.company?.trim() || null,
      source: body.source?.trim() || null,
      status: body.status || 'new',
      notes: body.notes?.trim() || null,
    };

    // Remove undefined values
    Object.keys(leadData).forEach(key => {
      if (leadData[key] === undefined || leadData[key] === '') {
        if (key !== 'email' && key !== 'phone' && key !== 'company' && key !== 'source' && key !== 'notes') {
          delete leadData[key];
        } else if (leadData[key] === '') {
          leadData[key] = null;
        }
      }
    });

    console.log('[Create Lead] Inserting data:', leadData);

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error('[Create Lead] Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json({
        error: error.message || 'Failed to create lead',
        details: error.details,
        hint: error.hint,
        code: error.code,
      }, { status: 500 });
    }
    
    console.log('[Create Lead] Successfully created lead:', data?.id);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('[Create Lead] Unexpected error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to create lead',
      type: 'unexpected_error',
    }, { status: 500 });
  }
}
