# 验证 Service Role Key 配置

## 🔴 当前错误
```
Database connection test failed: permission denied for table leads
```

这个错误通常意味着：
1. RLS 仍然启用，或
2. service_role key 配置不正确

## ✅ 解决步骤

### 步骤 1: 确认 Service Role Key

**重要：** 必须使用 **service_role** key，不是 anon key！

1. 在 Supabase Dashboard 中，点击 **Settings** > **API**
2. 找到 **service_role** key（通常在页面底部，有警告标志）
3. 复制这个 key
4. 更新 `.env.local` 文件：

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDU3ODkwMDAsImV4cCI6MTk2MTM2NTAwMH0...
```

**注意：** service_role key 的 JWT payload 中应该包含 `"role":"service_role"`

### 步骤 2: 运行完整修复脚本

1. 在 Supabase SQL Editor 中
2. 打开项目中的 `complete-fix.sql` 文件
3. 复制所有 SQL 代码
4. 粘贴到 SQL Editor
5. 点击 **Run** 执行

这个脚本会：
- ✅ 删除所有策略
- ✅ 创建表（如果不存在）
- ✅ **强制禁用 RLS**
- ✅ 验证 RLS 状态
- ✅ 测试插入权限

### 步骤 3: 验证 RLS 已禁用

运行以下 SQL 检查：

```sql
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'leads';
```

**应该显示 `rls_enabled = false`**

如果显示 `true`，运行：
```sql
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
```

### 步骤 4: 重启开发服务器

修改 `.env.local` 后，必须重启：

1. 停止服务器（Ctrl+C）
2. 运行 `npm run dev`

### 步骤 5: 测试

1. 访问 `http://localhost:3000/api/health`
2. 应该看到所有表都是 `true`
3. 尝试添加 lead

## 🔍 如何验证 Service Role Key

在 Node.js 中，你可以解码 JWT 来验证：

```javascript
// 在浏览器控制台运行（仅用于调试）
const token = '你的SUPABASE_SERVICE_ROLE_KEY';
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Role:', payload.role); // 应该显示 "service_role"
```

或者检查 `.env.local` 文件，service_role key 通常比 anon key 更长。

## ⚠️ 常见错误

### 错误 1: 使用了 anon key 而不是 service_role key

**症状：** 即使禁用 RLS 仍然有权限错误

**解决：** 确保使用 service_role key

### 错误 2: RLS 没有真正禁用

**症状：** SQL 显示已禁用，但应用仍然报错

**解决：** 再次运行 `ALTER TABLE leads DISABLE ROW LEVEL SECURITY;`

### 错误 3: 表不存在

**症状：** "relation 'leads' does not exist"

**解决：** 运行 `complete-fix.sql` 创建表

## 🆘 如果仍然失败

请提供：
1. `complete-fix.sql` 的执行结果
2. RLS 状态查询的结果
3. `.env.local` 中 key 的前几个字符（用于验证格式）
