-- 测试数据库权限的 SQL 脚本
-- 在 Supabase SQL Editor 中运行此脚本来诊断权限问题

-- 1. 检查表是否存在
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'enquiries', 'enrolments');

-- 2. 检查 RLS 状态
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'enquiries', 'enrolments');

-- 3. 检查现有策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('leads', 'enquiries', 'enrolments');

-- 4. 测试插入权限（应该能成功）
INSERT INTO leads (name, email, status) 
VALUES ('Permission Test', 'test@permission.com', 'new')
RETURNING *;

-- 5. 清理测试数据
DELETE FROM leads WHERE email = 'test@permission.com';

-- 如果上面的插入失败，运行以下命令禁用 RLS：
-- ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE enrolments DISABLE ROW LEVEL SECURITY;
