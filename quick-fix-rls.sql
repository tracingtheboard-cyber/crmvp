-- 快速修复：仅禁用 RLS
-- 如果完整脚本有问题，先运行这个

-- 禁用 RLS
ALTER TABLE IF EXISTS leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enrolments DISABLE ROW LEVEL SECURITY;

-- 验证
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'enquiries', 'enrolments');
