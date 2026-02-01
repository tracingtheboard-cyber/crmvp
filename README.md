# CRM System

A simple CRM system built with Next.js and Supabase to track leads, enquiries, and enrolments.

## Features

- **Leads Management**: Track potential customers with contact information, status, and notes
  - CSV Import: Bulk import leads from CSV files
- **Enquiries Management**: Manage customer inquiries with priority and status tracking
- **Enrolments Management**: Track course enrollments with payment status and course details
- **Dashboard**: Overview of all data with statistics and recent items

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the SQL script from `supabase-schema.sql`
3. Get your project URL and API keys from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The system uses three main tables:

- **leads**: Customer leads with contact information
- **enquiries**: Customer inquiries linked to leads
- **enrolments**: Course enrollments linked to leads

See `supabase-schema.sql` for the complete schema definition.

## CSV Import

You can bulk import leads from a CSV file:

1. Click the "Import CSV" button on the Leads page
2. Select a CSV file with the following columns:
   - `name` (required)
   - `email` (optional)
   - `phone` (optional)
   - `company` (optional)
   - `source` (optional)
   - `status` (optional, defaults to "new")
   - `notes` (optional)

See `CSV_TEMPLATE.csv` for an example format.

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Supabase**: PostgreSQL database and API
- **Tailwind CSS**: Styling
- **PapaParse**: CSV parsing library
