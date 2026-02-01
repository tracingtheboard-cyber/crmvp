export interface Lead {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Enquiry {
  id?: number;
  lead_id?: number;
  subject: string;
  message?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  lead?: Lead;
}

export interface Enrolment {
  id?: number;
  lead_id?: number;
  course_name: string;
  course_date?: string;
  amount?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  lead?: Lead;
}
