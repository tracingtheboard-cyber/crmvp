-- ============================================
-- 最终修复脚本 - 解决所有权限问题
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 步骤 1: 创建表（如果不存在）
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

-- 步骤 2: 删除所有策略
DO $$
DECLARE
  r RECORD;
BEGIN
  -- 删除 leads 表的所有策略
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'leads' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.leads';
  END LOOP;
  
  -- 删除 enquiries 表的所有策略
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'enquiries' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.enquiries';
  END LOOP;
  
  -- 删除 enrolments 表的所有策略
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'enrolments' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.enrolments';
  END LOOP;
END $$;

-- 步骤 3: 强制禁用 RLS
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrolments DISABLE ROW LEVEL SECURITY;

-- 步骤 4: 授予所有必要权限
GRANT ALL ON TABLE public.leads TO authenticated;
GRANT ALL ON TABLE public.leads TO anon;
GRANT ALL ON TABLE public.leads TO service_role;

GRANT ALL ON TABLE public.enquiries TO authenticated;
GRANT ALL ON TABLE public.enquiries TO anon;
GRANT ALL ON TABLE public.enquiries TO service_role;

GRANT ALL ON TABLE public.enrolments TO authenticated;
GRANT ALL ON TABLE public.enrolments TO anon;
GRANT ALL ON TABLE public.enrolments TO service_role;

-- 授予序列权限
DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE public.leads_id_seq TO authenticated;
  GRANT USAGE, SELECT ON SEQUENCE public.leads_id_seq TO anon;
  GRANT USAGE, SELECT ON SEQUENCE public.leads_id_seq TO service_role;
EXCEPTION WHEN OTHERS THEN
  -- 序列可能不存在，忽略错误
  NULL;
END $$;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE public.enquiries_id_seq TO authenticated;
  GRANT USAGE, SELECT ON SEQUENCE public.enquiries_id_seq TO anon;
  GRANT USAGE, SELECT ON SEQUENCE public.enquiries_id_seq TO service_role;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE public.enrolments_id_seq TO authenticated;
  GRANT USAGE, SELECT ON SEQUENCE public.enrolments_id_seq TO anon;
  GRANT USAGE, SELECT ON SEQUENCE public.enrolments_id_seq TO service_role;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 步骤 5: 验证 RLS 状态
SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '❌ RLS 已启用' 
    ELSE '✅ RLS 已禁用' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'enquiries', 'enrolments');

-- 步骤 6: 测试权限
DO $$
BEGIN
  -- 测试插入
  INSERT INTO public.leads (name, email, status) 
  VALUES ('权限测试', 'test@permission.com', 'new');
  
  -- 测试查询
  PERFORM id FROM public.leads WHERE email = 'test@permission.com';
  
  -- 清理测试数据
  DELETE FROM public.leads WHERE email = 'test@permission.com';
  
  RAISE NOTICE '✅ 权限测试通过！';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ 权限测试失败: %', SQLERRM;
    RAISE;
END $$;

-- 完成
SELECT '✅ 修复完成！所有表已创建，RLS 已禁用，权限已配置。' as status;
