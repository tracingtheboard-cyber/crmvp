# 修复权限错误

## 🔴 当前问题

错误信息：`permission denied for table leads/enquiries/enrolments`

这通常意味着：
1. **数据库表还没有创建** - 最常见的原因
2. **RLS 策略配置不正确**

## ✅ 解决步骤

### 方法 1: 运行修复脚本（推荐）

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 **New query**
3. 打开项目中的 `fix-permissions.sql` 文件
4. 复制所有 SQL 代码
5. 粘贴到 Supabase SQL Editor 中
6. 点击 **Run** 或按 `F5` 执行

### 方法 2: 运行原始 schema 脚本

如果方法 1 不行，尝试运行原始的 schema：

1. 在 Supabase Dashboard 中，点击 **SQL Editor**
2. 点击 **New query**
3. 打开项目中的 `supabase-schema.sql` 文件
4. 复制所有 SQL 代码
5. 粘贴到 Supabase SQL Editor 中
6. 点击 **Run** 执行

### 方法 3: 手动创建表（如果上述方法都失败）

如果表已经存在但权限有问题，可以尝试：

1. 在 Supabase SQL Editor 中运行：

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'enquiries', 'enrolments');

-- 如果表存在，删除并重新创建策略
DROP POLICY IF EXISTS "Allow all operations on leads" ON leads;
DROP POLICY IF EXISTS "Allow all operations on enquiries" ON enquiries;
DROP POLICY IF EXISTS "Allow all operations on enrolments" ON enrolments;

-- 重新创建策略
CREATE POLICY "Allow all operations on leads" ON leads
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on enquiries" ON enquiries
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on enrolments" ON enrolments
  FOR ALL USING (true) WITH CHECK (true);
```

## 🔍 验证修复

运行 SQL 后，访问健康检查端点：
```
http://localhost:3000/api/health
```

应该看到：
```json
{
  "supabaseConnection": true,
  "databaseTables": {
    "leads": true,
    "enquiries": true,
    "enrolments": true
  }
}
```

## 📝 注意事项

1. **确保使用 service_role key** - 在 `.env.local` 中，`SUPABASE_SERVICE_ROLE_KEY` 应该设置为 service_role key（不是 anon key）

2. **service_role 应该绕过 RLS** - 但为了确保兼容性，我们仍然创建了允许所有操作的策略

3. **如果仍然有权限问题** - 检查：
   - 是否使用了正确的 service_role key
   - 表是否真的创建成功
   - 在 Supabase Dashboard 的 Table Editor 中查看表是否存在

## 🆘 仍然有问题？

如果运行 SQL 后仍然有权限错误：

1. 在 Supabase Dashboard 中，点击 **Table Editor**
2. 检查 `leads`、`enquiries`、`enrolments` 表是否存在
3. 如果表不存在，说明 SQL 执行失败，检查 SQL Editor 中的错误信息
4. 如果表存在，检查 **Authentication > Policies** 查看 RLS 策略是否正确
