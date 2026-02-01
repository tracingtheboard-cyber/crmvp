-- 诊断脚本 - 检查当前数据库状态
-- 在 Supabase SQL Editor 中运行此脚本来诊断问题

-- 1. 检查表是否存在
SELECT 
  '表存在性检查' as check_type,
  table_name,
  '✅ 存在' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'enquiries', 'enrolments')
UNION ALL
SELECT 
  '表存在性检查' as check_type,
  'leads' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') 
    THEN '✅ 存在' ELSE '❌ 不存在' END as status
UNION ALL
SELECT 
  '表存在性检查' as check_type,
  'enquiries' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enquiries') 
    THEN '✅ 存在' ELSE '❌ 不存在' END as status
UNION ALL
SELECT 
  '表存在性检查' as check_type,
  'enrolments' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enrolments') 
    THEN '✅ 存在' ELSE '❌ 不存在' END as status;

-- 2. 检查 RLS 状态
SELECT 
  'RLS 状态检查' as check_type,
  tablename as table_name,
  CASE 
    WHEN rowsecurity THEN '❌ RLS 已启用（需要禁用）' 
    ELSE '✅ RLS 已禁用' 
  END as status,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'enquiries', 'enrolments');

-- 3. 检查现有策略
SELECT 
  '策略检查' as check_type,
  tablename as table_name,
  policyname,
  CASE 
    WHEN COUNT(*) > 0 THEN '⚠️ 有策略（建议删除）'
    ELSE '✅ 无策略'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('leads', 'enquiries', 'enrolments')
GROUP BY tablename, policyname;

-- 4. 检查权限
SELECT 
  '权限检查' as check_type,
  table_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'enquiries', 'enrolments')
AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY table_name, grantee;

-- 5. 测试查询权限
DO $$
DECLARE
  test_result TEXT;
BEGIN
  BEGIN
    PERFORM id FROM public.leads LIMIT 1;
    test_result := '✅ leads 表可查询';
  EXCEPTION WHEN OTHERS THEN
    test_result := '❌ leads 表查询失败: ' || SQLERRM;
  END;
  
  RAISE NOTICE '%', test_result;
  
  BEGIN
    PERFORM id FROM public.enquiries LIMIT 1;
    test_result := '✅ enquiries 表可查询';
  EXCEPTION WHEN OTHERS THEN
    test_result := '❌ enquiries 表查询失败: ' || SQLERRM;
  END;
  
  RAISE NOTICE '%', test_result;
  
  BEGIN
    PERFORM id FROM public.enrolments LIMIT 1;
    test_result := '✅ enrolments 表可查询';
  EXCEPTION WHEN OTHERS THEN
    test_result := '❌ enrolments 表查询失败: ' || SQLERRM;
  END;
  
  RAISE NOTICE '%', test_result;
END $$;

-- 总结
SELECT '诊断完成！请查看上面的结果。' as summary;
