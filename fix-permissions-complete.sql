-- 完整修复权限问题的 SQL 脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 步骤 1: 如果表不存在，创建它们
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

-- 步骤 2: 删除所有现有的策略（如果存在）
DROP POLICY IF EXISTS "Allow all operations on leads" ON leads;
DROP POLICY IF EXISTS "Allow all operations on enquiries" ON enquiries;
DROP POLICY IF EXISTS "Allow all operations on enrolments" ON enrolments;

-- 步骤 3: 暂时禁用 RLS 来测试（可选，用于调试）
-- 如果 service_role 仍然无法访问，可以暂时禁用 RLS
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments DISABLE ROW LEVEL SECURITY;

-- 步骤 4: 重新启用 RLS（如果需要安全控制）
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE enrolments ENABLE ROW LEVEL SECURITY;

-- 步骤 5: 创建允许所有操作的策略（当 RLS 启用时使用）
-- 注意：service_role key 应该自动绕过 RLS，但为了确保兼容性，我们创建策略
CREATE POLICY "Allow all operations on leads" ON leads
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations on enquiries" ON enquiries
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations on enrolments" ON enrolments
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 步骤 6: 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 步骤 7: 删除可能存在的旧触发器
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
DROP TRIGGER IF EXISTS update_enrolments_updated_at ON enrolments;

-- 步骤 8: 为每个表添加更新时间触发器
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrolments_updated_at BEFORE UPDATE ON enrolments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 步骤 9: 验证表已创建并测试插入
DO $$
BEGIN
  -- 测试插入（如果表是空的）
  IF NOT EXISTS (SELECT 1 FROM leads LIMIT 1) THEN
    INSERT INTO leads (name, email, status) 
    VALUES ('Test Lead', 'test@example.com', 'new');
    
    -- 删除测试数据
    DELETE FROM leads WHERE email = 'test@example.com';
  END IF;
  
  RAISE NOTICE 'Tables created and configured successfully!';
END $$;

-- 验证
SELECT 'Setup complete! Tables: leads, enquiries, enrolments' as status;
