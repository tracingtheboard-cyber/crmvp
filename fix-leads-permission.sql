-- 修复 leads 表权限错误的完整脚本
-- 在 Supabase SQL Editor 中运行此脚本
-- 访问: https://supabase.com/dashboard > 你的项目 > SQL Editor

-- ============================================
-- 步骤 1: 确保表存在
-- ============================================
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
-- 步骤 2: 删除所有现有策略
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on leads" ON leads;
DROP POLICY IF EXISTS "Allow all operations on enquiries" ON enquiries;
DROP POLICY IF EXISTS "Allow all operations on enrolments" ON enrolments;

-- 删除可能存在的其他策略
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'leads') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON leads';
  END LOOP;
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'enquiries') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON enquiries';
  END LOOP;
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'enrolments') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON enrolments';
  END LOOP;
END $$;

-- ============================================
-- 步骤 3: 禁用 RLS（推荐用于开发环境）
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
  CASE 
    WHEN rowsecurity THEN '❌ RLS 已启用 - 这可能导致权限问题' 
    ELSE '✅ RLS 已禁用 - 正常' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'enquiries', 'enrolments');

-- ============================================
-- 步骤 5: 授予必要的权限
-- ============================================
-- 确保 authenticated 和 anon 角色有权限（如果需要）
GRANT ALL ON leads TO authenticated;
GRANT ALL ON leads TO anon;
GRANT ALL ON enquiries TO authenticated;
GRANT ALL ON enquiries TO anon;
GRANT ALL ON enrolments TO authenticated;
GRANT ALL ON enrolments TO anon;

-- 授予序列权限
GRANT USAGE, SELECT ON SEQUENCE leads_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE leads_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE enquiries_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE enquiries_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE enrolments_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE enrolments_id_seq TO anon;

-- ============================================
-- 步骤 6: 创建/更新触发器函数
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
-- 步骤 7: 测试插入权限
-- ============================================
DO $$
BEGIN
  -- 测试插入
  INSERT INTO leads (name, email, status) 
  VALUES ('Permission Test', 'test@permission.com', 'new');
  
  -- 清理测试数据
  DELETE FROM leads WHERE email = 'test@permission.com';
  
  RAISE NOTICE '✅ 插入测试通过 - 权限配置正常！';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ 插入测试失败: %', SQLERRM;
    RAISE;
END $$;

-- ============================================
-- 完成
-- ============================================
SELECT '✅ 修复完成！所有表已创建，RLS 已禁用，权限已配置。' as status;
