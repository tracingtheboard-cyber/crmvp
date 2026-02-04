import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { enquiries } = body;

        if (!Array.isArray(enquiries) || enquiries.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No enquiries provided' },
                { status: 400 }
            );
        }

        const results = {
            total: enquiries.length,
            imported: 0,
            errors: [] as any[],
        };

        // Process in batches
        const BATCH_SIZE = 50;
        for (let i = 0; i < enquiries.length; i += BATCH_SIZE) {
            const batch = enquiries.slice(i, i + BATCH_SIZE);

            // For each enquiry, we first need to resolve the lead_id.
            // We'll trust 'lead_email' if provided to find an existing lead.
            // If no lead found, we create a new Lead with that email (and name if provided).

            for (let j = 0; j < batch.length; j++) {
                const item = batch[j];
                const rowIdx = i + j + 1;

                try {
                    // 1. Resolve Lead
                    let leadId = null;
                    // If lead_email is provided, try to find it
                    if (item.lead_email) {
                        const { data: existingLeads } = await supabaseAdmin
                            .from('leads')
                            .select('id')
                            .eq('email', item.lead_email)
                            .maybeSingle();

                        if (existingLeads) {
                            leadId = existingLeads.id;
                        } else {
                            // Create new lead if name is provided, else fallback to "Unknown Import"
                            // It's better to create a lead so the enquiry is not orphaned? 
                            // Or should we fail? Creating seems more robust for "Import".
                            const newLeadName = item.lead_name || item.lead_email.split('@')[0] || 'Imported Lead';
                            const { data: newLead, error: createLeadError } = await supabaseAdmin
                                .from('leads')
                                .insert([{
                                    name: newLeadName,
                                    email: item.lead_email,
                                    source: 'enquiry_import',
                                    status: 'new'
                                }])
                                .select('id')
                                .single();

                            if (createLeadError) throw new Error(`Failed to create lead for ${item.lead_email}: ${createLeadError.message}`);
                            leadId = newLead.id;
                        }
                    } else if (item.lead_name) {
                        // Fallback: try to find by name? Dangerous if duplicates.
                        // Let's just create a new lead if only name provided?
                        // Or maybe skip lead linkage? Table schema says lead_id is REFERENCES leads(id) ON DELETE CASCADE
                        // but is it NOT NULL? Schema says: `lead_id BIGINT REFERENCES leads(id)` ... it doesn't explicitly say NOT NULL.
                        // Let's check schema.
                        // `lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE` -> Nullable by default unless NOT NULL specified.
                        // So we can insert without lead_id if permitted.
                        // But logic usually demands a lead.
                        // Let's try to create a lead with just the name.
                        const { data: newLead, error: createLeadError } = await supabaseAdmin
                            .from('leads')
                            .insert([{
                                name: item.lead_name,
                                source: 'enquiry_import',
                                status: 'new'
                            }])
                            .select('id')
                            .single();
                        if (!createLeadError && newLead) leadId = newLead.id;
                    }

                    // 2. Insert Enquiry
                    const enquiryData = {
                        subject: item.subject || 'Imported Enquiry',
                        message: item.message,
                        status: item.status || 'open',
                        priority: item.priority || 'medium',
                        lead_id: leadId,
                        assigned_to: item.assigned_to
                    };

                    const { error: insertError } = await supabaseAdmin
                        .from('enquiries')
                        .insert([enquiryData]);

                    if (insertError) {
                        throw new Error(insertError.message);
                    }

                    results.imported++;

                } catch (err: any) {
                    results.errors.push({
                        row: rowIdx,
                        error: err.message || 'Unknown error',
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            ...results,
        });

    } catch (error: any) {
        console.error('Import API Error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
