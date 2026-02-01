# 快速修复权限错误

## 🔴 错误信息
```
Error: permission denied for table leads
```

## ✅ 快速解决方案

### 方法 1: 禁用 RLS（最简单，用于开发环境）

1. 在 Supabase Dashboard 中，点击 **SQL Editor**
2. 点击 **New query**
3. 复制并运行以下 SQL：

```sql
-- 禁用 RLS（仅用于开发/测试）
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments DISABLE ROW LEVEL SECURITY;
```

4. 点击 **Run** 执行

**注意：** 这会禁用行级安全，允许所有操作。适合开发环境，但不适合生产环境。

### 方法 2: 运行完整修复脚本（推荐）

1. 在 Supabase Dashboard 中，点击 **SQL Editor**
2. 点击 **New query**
3. 打开项目中的 `fix-permissions-complete.sql` 文件
4. 复制所有 SQL 代码
5. 粘贴到 SQL Editor 中
6. 点击 **Run** 执行

这个脚本会：
- 创建表（如果不存在）
- 删除旧的策略
- **暂时禁用 RLS**（解决权限问题）
- 创建触发器
- 验证设置

### 方法 3: 检查并修复策略（如果 RLS 必须启用）

如果必须启用 RLS，运行以下 SQL：

```sql
-- 1. 删除所有现有策略
DROP POLICY IF EXISTS "Allow all operations on leads" ON leads;
DROP POLICY IF EXISTS "Allow all operations on enquiries" ON enquiries;
DROP POLICY IF EXISTS "Allow all operations on enrolments" ON enrolments;

-- 2. 确保 RLS 已启用
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments ENABLE ROW LEVEL SECURITY;

-- 3. 创建允许所有操作的策略
CREATE POLICY "Allow all operations on leads" ON leads
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on enquiries" ON enquiries
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on enrolments" ON enrolments
  FOR ALL USING (true) WITH CHECK (true);
```

## 🔍 验证修复

运行 SQL 后：

1. **测试插入**（在 Supabase SQL Editor 中）：
```sql
INSERT INTO leads (name, email, status) 
VALUES ('Test', 'test@example.com', 'new')
RETURNING *;
```

如果成功，应该返回插入的记录。

2. **检查应用**：
   - 访问 `http://localhost:3000/api/health`
   - 应该看到所有表都是 `true`
   - 尝试在应用中添加或导入 leads

## ⚠️ 重要提示

### 关于 service_role key

`service_role` key 应该能够绕过 RLS，但有时配置可能有问题。确保：

1. `.env.local` 中的 `SUPABASE_SERVICE_ROLE_KEY` 是 **service_role** key（不是 anon key）
2. 在 Supabase Dashboard 的 Settings > API 中，复制的是 **service_role** key

### 关于 RLS

- **开发环境**：可以暂时禁用 RLS 来快速解决问题
- **生产环境**：应该启用 RLS 并配置适当的策略

## 🆘 仍然有问题？

如果运行 SQL 后仍然有权限错误：

1. **检查表是否存在**：
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'enquiries', 'enrolments');
```

2. **检查 RLS 状态**：
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'enquiries', 'enrolments');
```

3. **检查策略**：
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('leads', 'enquiries', 'enrolments');
```

4. **查看详细错误**：
   - 在应用终端查看服务器日志
   - 在浏览器控制台查看错误信息
