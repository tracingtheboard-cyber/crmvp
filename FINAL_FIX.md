# 🔴 最终修复方案 - 无法添加 Leads

## 问题诊断

如果仍然无法添加 leads，请按以下步骤操作：

### 步骤 1: 确认 RLS 已禁用

在 Supabase SQL Editor 中运行：

```sql
-- 检查 RLS 状态
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'leads';

-- 如果 rls_enabled 是 true，运行以下命令禁用：
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments DISABLE ROW LEVEL SECURITY;
```

### 步骤 2: 确认表存在

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'leads';

-- 如果不存在，创建表
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

ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
```

### 步骤 3: 测试直接插入

在 Supabase SQL Editor 中运行：

```sql
INSERT INTO leads (name, email, status) 
VALUES ('Direct Test', 'direct@test.com', 'new')
RETURNING *;
```

如果这个也失败，说明是数据库层面的问题。

### 步骤 4: 检查环境变量

确保 `.env.local` 文件中有正确的配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
```

**重要：** `SUPABASE_SERVICE_ROLE_KEY` 必须是 **service_role** key，不是 anon key！

### 步骤 5: 重启开发服务器

修改 `.env.local` 或运行 SQL 后，必须重启：

1. 停止服务器（Ctrl+C）
2. 运行 `npm run dev`

### 步骤 6: 查看详细错误

现在添加 lead 时，查看：

1. **浏览器控制台**（F12 > Console）- 查看前端错误
2. **服务器终端**（运行 npm run dev 的窗口）- 查看后端日志

现在会显示详细的错误信息，包括：
- 错误消息
- 错误详情
- 错误提示

## 常见错误和解决方案

### 错误 1: "permission denied for table leads"

**解决方案：** 运行 `ALTER TABLE leads DISABLE ROW LEVEL SECURITY;`

### 错误 2: "relation 'leads' does not exist"

**解决方案：** 表不存在，运行创建表的 SQL

### 错误 3: "Invalid supabaseUrl"

**解决方案：** 检查 `.env.local` 中的 URL 格式

### 错误 4: "Missing Supabase environment variables"

**解决方案：** 检查 `.env.local` 文件是否存在且配置正确

## 一键修复脚本

运行项目中的 `disable-rls-only.sql` 文件，它会：
1. 创建表（如果不存在）
2. 禁用 RLS
3. 测试插入

## 如果仍然失败

请提供以下信息：

1. **浏览器控制台的错误信息**
2. **服务器终端的日志输出**
3. **Supabase SQL Editor 中直接插入是否成功**

这样我可以更准确地帮你解决问题。
