# 🔴 紧急修复权限错误

## 当前问题
```
Failed to import any leads. Check errors for details. 
Errors: Batch 1: permission denied for table leads
```

## ✅ 立即执行以下步骤

### 步骤 1: 在 Supabase 中禁用 RLS

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query**
5. **复制并运行以下 SQL**：

```sql
-- 禁用 RLS（解决权限问题）
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments DISABLE ROW LEVEL SECURITY;
```

6. 点击 **Run** 执行

### 步骤 2: 验证表存在

如果表不存在，运行以下 SQL：

```sql
-- 创建 leads 表
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

-- 创建 enquiries 表
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

-- 创建 enrolments 表
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

-- 再次确保 RLS 已禁用
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments DISABLE ROW LEVEL SECURITY;
```

### 步骤 3: 测试插入

运行以下 SQL 测试插入是否工作：

```sql
INSERT INTO leads (name, email, status) 
VALUES ('Test', 'test@example.com', 'new')
RETURNING *;
```

如果成功，你应该看到插入的记录。

### 步骤 4: 验证修复

1. 访问 `http://localhost:3000/api/health`
2. 应该看到所有表都是 `true`
3. 尝试在应用中导入 CSV

## 🔍 如果仍然失败

### 检查 1: 确认使用了正确的 key

确保 `.env.local` 中的 `SUPABASE_SERVICE_ROLE_KEY` 是 **service_role** key：

1. 在 Supabase Dashboard 中，点击 **Settings** > **API**
2. 找到 **service_role** key（不是 anon key）
3. 复制它
4. 更新 `.env.local` 文件
5. **重启开发服务器**

### 检查 2: 运行诊断脚本

在 Supabase SQL Editor 中运行 `test-db-permissions.sql` 来诊断问题。

### 检查 3: 查看服务器日志

在运行 `npm run dev` 的终端中，查看详细的错误信息。

## 📝 完整的一键修复脚本

如果你想一次性修复所有问题，运行项目中的 `disable-rls-only.sql` 文件。
