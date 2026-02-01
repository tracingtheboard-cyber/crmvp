import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Lead } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return NextResponse.json(
        { error: 'Supabase is not configured. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.' },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test connection and permissions first
    console.log('[CSV Import] Testing database connection...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('leads')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('[CSV Import] Connection test failed:', {
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
    
    console.log('[CSV Import] Connection test passed');
    
    const body = await request.json();
    const { leads } = body;

    console.log(`[CSV Import] Received ${leads?.length || 0} leads to import`);

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'Invalid leads data. Expected an array of leads.' },
        { status: 400 }
      );
    }

    // Validate and format leads
    const validLeads: Lead[] = leads
      .map((lead: any) => {
        // Ensure required fields
        if (!lead.name || lead.name.trim() === '') {
          return null;
        }

        return {
          name: lead.name.trim(),
          email: lead.email?.trim() || null,
          phone: lead.phone?.trim() || null,
          company: lead.company?.trim() || null,
          source: lead.source?.trim() || null,
          status: (lead.status?.trim() || 'new') as Lead['status'],
          notes: lead.notes?.trim() || null,
        };
      })
      .filter((lead: Lead | null) => lead !== null);

    if (validLeads.length === 0) {
      console.error('[CSV Import] No valid leads after validation');
      return NextResponse.json(
        { error: 'No valid leads to import. At least name is required.' },
        { status: 400 }
      );
    }

    console.log(`[CSV Import] Validated ${validLeads.length} leads, starting batch insert`);

    // Insert leads in batches (Supabase has a limit on batch size)
    const batchSize = 100;
    const results = [];
    const errors = [];

    for (let i = 0; i < validLeads.length; i += batchSize) {
      const batch = validLeads.slice(i, i + batchSize);
      const { data, error } = await supabaseAdmin
        .from('leads')
        .insert(batch)
        .select();

      if (error) {
        console.error(`[CSV Import] Batch ${Math.floor(i / batchSize) + 1} error:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: error.message,
          details: error.details || error.hint || '',
          code: error.code,
        });
      } else {
        if (data && data.length > 0) {
          console.log(`[CSV Import] Batch ${Math.floor(i / batchSize) + 1}: Successfully inserted ${data.length} leads`);
          results.push(...data);
        } else {
          console.warn(`[CSV Import] Batch ${Math.floor(i / batchSize) + 1}: No data returned from insert`);
          errors.push({
            batch: Math.floor(i / batchSize) + 1,
            error: 'No data returned from database insert',
          });
        }
      }
    }

    // Only return success if we actually inserted data
    if (results.length === 0 && errors.length > 0) {
      console.error(`[CSV Import] Failed to import any leads. Errors:`, errors);
      return NextResponse.json({
        success: false,
        imported: 0,
        total: validLeads.length,
        errors: errors,
        message: 'Failed to import any leads. Check errors for details.',
      }, { status: 500 });
    }

    console.log(`[CSV Import] Completed: ${results.length} imported, ${errors.length} batch errors`);
    return NextResponse.json({
      success: true,
      imported: results.length,
      total: validLeads.length,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length > 0 
        ? `Imported ${results.length} out of ${validLeads.length} leads. Some batches failed.`
        : `Successfully imported ${results.length} leads.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to import leads' },
      { status: 500 }
    );
  }
}
