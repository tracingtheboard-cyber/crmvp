# 修复 Supabase URL 错误

## 错误信息
```
Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

## 问题原因

`.env.local` 文件中的 `NEXT_PUBLIC_SUPABASE_URL` 值格式不正确。可能的原因：

1. **仍然是占位符值** - 还没有替换成真实的 Supabase URL
2. **缺少协议** - URL 没有 `https://` 前缀
3. **格式错误** - URL 格式不正确
4. **多余的空格或引号** - 值前后有空格或被引号包围

## 解决步骤

### 1. 获取正确的 Supabase URL

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单 **Settings** (设置)
4. 点击 **API**
5. 找到 **Project URL** 字段
6. 复制完整的 URL（应该类似：`https://xxxxx.supabase.co`）

### 2. 编辑 `.env.local` 文件

打开项目根目录下的 `.env.local` 文件，确保 `NEXT_PUBLIC_SUPABASE_URL` 的值：

✅ **正确格式：**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

❌ **错误格式示例：**
```env
# 错误 1: 仍然是占位符
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# 错误 2: 缺少 https://
NEXT_PUBLIC_SUPABASE_URL=abcdefghijklmnop.supabase.co

# 错误 3: 有多余的空格
NEXT_PUBLIC_SUPABASE_URL= https://abcdefghijklmnop.supabase.co 

# 错误 4: 被引号包围
NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijklmnop.supabase.co"
```

### 3. 检查文件格式

确保 `.env.local` 文件格式正确：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要提示：**
- 不要使用引号包围值
- 不要在等号前后加空格
- 不要在值前后加空格
- 确保 URL 以 `https://` 开头

### 4. 重启开发服务器

修改 `.env.local` 后，必须重启开发服务器：

1. 停止当前服务器（在终端按 `Ctrl+C`）
2. 重新运行 `npm run dev`

### 5. 验证修复

访问健康检查端点：
```
http://localhost:3000/api/health
```

如果修复成功，你应该看到：
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

## 示例

**正确的 `.env.local` 文件内容：**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnopqrst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU3ODkwMDAsImV4cCI6MTk2MTM2NTAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTc4OTAwMCwiZXhwIjoxOTYxMzY1MDAwfQ.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

## 仍然有问题？

如果按照以上步骤操作后仍有问题，请检查：

1. 是否已创建 Supabase 项目？
2. 是否从正确的项目复制了 URL？
3. 文件保存后是否重启了服务器？
4. 浏览器控制台是否有其他错误信息？
