import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const checks = {
    envVars: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    supabaseConnection: false,
    databaseTables: {
      leads: false,
      enquiries: false,
      enrolments: false,
    },
    errors: [] as string[],
  };

  try {
    // Check environment variables
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      checks.errors.push('Missing Supabase environment variables');
      return NextResponse.json(checks);
    }

    // Clean and validate URL
    supabaseUrl = supabaseUrl.trim();
    
    // Check if URL is still a placeholder
    if (supabaseUrl.includes('your_supabase') || supabaseUrl === 'your_supabase_project_url') {
      checks.errors.push('NEXT_PUBLIC_SUPABASE_URL is still set to placeholder value. Please replace it with your actual Supabase project URL from Settings > API.');
      return NextResponse.json(checks);
    }

    // Check if URL has protocol
    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
      checks.errors.push(`NEXT_PUBLIC_SUPABASE_URL is missing protocol. It should start with "https://". Current value: "${supabaseUrl}"`);
      return NextResponse.json(checks);
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (e) {
      checks.errors.push(`NEXT_PUBLIC_SUPABASE_URL is not a valid URL. Current value: "${supabaseUrl}". It should look like: "https://xxxxx.supabase.co"`);
      return NextResponse.json(checks);
    }

    // Try to connect to Supabase
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    checks.supabaseConnection = true;

    // Check if tables exist
    try {
      const { data: leadsData, error: leadsError } = await supabaseAdmin
        .from('leads')
        .select('id')
        .limit(1);
      
      if (!leadsError) {
        checks.databaseTables.leads = true;
      } else {
        const errorMsg = leadsError.message || 'Unknown error';
        if (errorMsg.includes('permission denied') || errorMsg.includes('permissions')) {
          checks.errors.push(
            `Database connection test failed: permission denied for table leads. ` +
            `Please check if RLS is disabled or policies are configured correctly. ` +
            `Run the fix-leads-permission.sql script in Supabase SQL Editor. ` +
            `Error details: ${errorMsg}`
          );
        } else {
          checks.errors.push(`Leads table error: ${errorMsg}`);
        }
      }
    } catch (e: any) {
      const errorMsg = e.message || 'Unknown error';
      if (errorMsg.includes('permission denied') || errorMsg.includes('permissions')) {
        checks.errors.push(
          `Database connection test failed: permission denied for table leads. ` +
          `Please check if RLS is disabled or policies are configured correctly. ` +
          `Run the fix-leads-permission.sql script in Supabase SQL Editor. ` +
          `Error details: ${errorMsg}`
        );
      } else {
        checks.errors.push(`Leads table check failed: ${errorMsg}`);
      }
    }

    try {
      const { error: enquiriesError } = await supabaseAdmin
        .from('enquiries')
        .select('id')
        .limit(1);
      
      if (!enquiriesError) {
        checks.databaseTables.enquiries = true;
      } else {
        const errorMsg = enquiriesError.message || 'Unknown error';
        if (errorMsg.includes('permission denied') || errorMsg.includes('permissions')) {
          checks.errors.push(
            `Database connection test failed: permission denied for table enquiries. ` +
            `Please run the fix-leads-permission.sql script in Supabase SQL Editor. ` +
            `Error details: ${errorMsg}`
          );
        } else {
          checks.errors.push(`Enquiries table error: ${errorMsg}`);
        }
      }
    } catch (e: any) {
      const errorMsg = e.message || 'Unknown error';
      checks.errors.push(`Enquiries table check failed: ${errorMsg}`);
    }

    try {
      const { error: enrolmentsError } = await supabaseAdmin
        .from('enrolments')
        .select('id')
        .limit(1);
      
      if (!enrolmentsError) {
        checks.databaseTables.enrolments = true;
      } else {
        const errorMsg = enrolmentsError.message || 'Unknown error';
        if (errorMsg.includes('permission denied') || errorMsg.includes('permissions')) {
          checks.errors.push(
            `Database connection test failed: permission denied for table enrolments. ` +
            `Please run the fix-leads-permission.sql script in Supabase SQL Editor. ` +
            `Error details: ${errorMsg}`
          );
        } else {
          checks.errors.push(`Enrolments table error: ${errorMsg}`);
        }
      }
    } catch (e: any) {
      const errorMsg = e.message || 'Unknown error';
      checks.errors.push(`Enrolments table check failed: ${errorMsg}`);
    }

  } catch (error: any) {
    checks.errors.push(`Connection error: ${error.message}`);
  }

  return NextResponse.json(checks);
}
