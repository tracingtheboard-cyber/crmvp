import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export interface QuickEnquiryBody {
  name: string;
  phone?: string;
  email?: string;
  course_interest: string;
  consultant: string;
}

/**
 * POST /api/enquiries/quick
 * 快速添加 Enquiry：根据姓名、电话、电邮查找或创建 Lead，再创建 Enquiry。
 * subject = 感兴趣的课程，assigned_to = consultant
 */
export async function POST(request: NextRequest) {
  try {
    const body: QuickEnquiryBody = await request.json();
    const name = body.name?.trim();
    const course_interest = body.course_interest?.trim();
    const consultant = body.consultant?.trim();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!course_interest) {
      return NextResponse.json({ error: 'Course of interest is required' }, { status: 400 });
    }
    if (!consultant) {
      return NextResponse.json({ error: 'Consultant is required' }, { status: 400 });
    }

    const phone = body.phone?.trim() || null;
    const email = body.email?.trim() || null;

    let leadId: number;

    if (email || phone) {
      let query = supabaseAdmin.from('leads').select('id');
      if (email && phone) {
        query = query.or(`email.eq.${email},phone.eq.${phone}`);
      } else if (email) {
        query = query.eq('email', email);
      } else {
        query = query.eq('phone', phone);
      }
      const { data: existingLeads } = await query.limit(1);

      if (existingLeads && existingLeads.length > 0) {
        leadId = existingLeads[0].id;
      } else {
        const { data: newLead, error: createLeadError } = await supabaseAdmin
          .from('leads')
          .insert([{ name, email, phone, status: 'new' }])
          .select('id')
          .single();
        if (createLeadError) throw createLeadError;
        leadId = newLead!.id;
      }
    } else {
      const { data: newLead, error: createLeadError } = await supabaseAdmin
        .from('leads')
        .insert([{ name, email, phone, status: 'new' }])
        .select('id')
        .single();
      if (createLeadError) throw createLeadError;
      leadId = newLead!.id;
    }

    const { data: enquiry, error: enquiryError } = await supabaseAdmin
      .from('enquiries')
      .insert([
        {
          lead_id: leadId,
          subject: course_interest,
          message: '',
          status: 'open',
          priority: 'medium',
          assigned_to: consultant,
        },
      ])
      .select()
      .single();

    if (enquiryError) throw enquiryError;
    return NextResponse.json(enquiry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
