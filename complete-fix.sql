-- 完整修复脚本 - 解决所有权限问题
-- 在 Supabase SQL Editor 中运行此脚本

-- ============================================
-- 步骤 1: 删除所有现有策略（如果存在）
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on leads" ON leads;
DROP POLICY IF EXISTS "Allow all operations on enquiries" ON enquiries;
DROP POLICY IF EXISTS "Allow all operations on enrolments" ON enrolments;

-- ============================================
-- 步骤 2: 创建表（如果不存在）
-- ============================================

-- Leads表
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiries表
CREATE TABLE IF NOT EXISTS enquiries (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrolments表
CREATE TABLE IF NOT EXISTS enrolments (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  course_date DATE,
  amount DECIMAL(10, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 步骤 3: 强制禁用 RLS
-- ============================================
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 步骤 4: 验证 RLS 状态
-- ============================================
SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  CASE WHEN rowsecurity THEN '❌ RLS ENABLED - This is the problem!' 
       ELSE '✅ RLS DISABLED - Good!' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'enquiries', 'enrolments');

-- ============================================
-- 步骤 5: 测试插入权限
-- ============================================
DO $$
BEGIN
  -- 测试插入
  INSERT INTO leads (name, email, status) 
  VALUES ('Permission Test', 'test@permission.com', 'new');
  
  -- 清理测试数据
  DELETE FROM leads WHERE email = 'test@permission.com';
  
  RAISE NOTICE '✅ Insert test PASSED - Permissions are working!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Insert test FAILED: %', SQLERRM;
END $$;

-- ============================================
-- 步骤 6: 创建触发器函数（如果需要）
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 删除旧触发器
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
DROP TRIGGER IF EXISTS update_enrolments_updated_at ON enrolments;

-- 创建新触发器
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrolments_updated_at BEFORE UPDATE ON enrolments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完成
-- ============================================
SELECT '✅ Setup complete! All tables created and RLS disabled.' as status;
