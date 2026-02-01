# 🔧 修复 Leads 表权限错误

## 错误信息
```
Database connection test failed: permission denied for table leads. 
Please check if RLS is disabled or policies are configured correctly.
```

## ✅ 快速修复步骤

### 步骤 1: 在 Supabase 中运行修复脚本

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query** 按钮
5. 打开项目中的 `fix-leads-permission.sql` 文件
6. **复制所有 SQL 代码**
7. 粘贴到 Supabase SQL Editor 中
8. 点击 **Run** 按钮（或按 `F5`）执行

这个脚本会：
- ✅ 创建所有必需的表（如果不存在）
- ✅ 删除所有现有策略
- ✅ **禁用 RLS（Row Level Security）**
- ✅ 授予必要的权限
- ✅ 创建/更新触发器
- ✅ 测试插入权限

### 步骤 2: 验证修复

运行脚本后，你应该看到：
```
✅ 修复完成！所有表已创建，RLS 已禁用，权限已配置。
```

### 步骤 3: 验证 RLS 状态（可选）

如果你想确认 RLS 已禁用，运行以下 SQL：

```sql
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'enquiries', 'enrolments');
```

所有表的 `rls_enabled` 应该显示为 `false`。

### 步骤 4: 测试应用

1. 重启你的开发服务器（如果正在运行）：
   ```bash
   # 停止服务器 (Ctrl+C)
   # 然后重新启动
   npm run dev
   ```

2. 访问健康检查端点：
   ```
   http://localhost:3000/api/health
   ```

3. 应该看到所有表都是 `true`：
   ```json
   {
     "supabaseConnection": true,
     "databaseTables": {
       "leads": true,
       "enquiries": true,
       "enrolments": true
     },
     "errors": []
   }
   ```

## 🔍 如果问题仍然存在

### 检查 1: 确认 Service Role Key

确保你的 `.env.local` 文件中使用的是 **service_role** key，不是 anon key：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ← 这个很重要！
```

**如何获取 service_role key：**
1. 在 Supabase Dashboard 中，点击 **Settings** > **API**
2. 找到 **service_role** key（通常在页面底部，有警告标志）
3. 复制这个 key 到 `.env.local`

### 检查 2: 确认表存在

运行以下 SQL 检查表是否存在：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'enquiries', 'enrolments');
```

如果表不存在，运行 `fix-leads-permission.sql` 脚本。

### 检查 3: 确认 RLS 已禁用

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'leads';
```

如果 `rowsecurity` 是 `true`，手动禁用：

```sql
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments DISABLE ROW LEVEL SECURITY;
```

## 📝 注意事项

- **Service Role Key** 应该能够绕过 RLS，但为了确保兼容性，我们禁用了 RLS
- 在生产环境中，你可能想要启用 RLS 并配置适当的策略
- 修改 `.env.local` 后必须重启开发服务器

## 🆘 仍然有问题？

如果以上步骤都无法解决问题，请检查：
1. Supabase 项目是否正常运行
2. 网络连接是否正常
3. Service Role Key 是否正确（不是 anon key）
4. 表是否真的存在（运行检查 SQL）
