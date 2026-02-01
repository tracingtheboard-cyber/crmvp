# 配置 Supabase 环境变量 - 详细步骤

## ⚠️ 当前问题

你的 `.env.local` 文件中 `NEXT_PUBLIC_SUPABASE_URL` 仍然是占位符值，需要替换为真实的 Supabase URL。

## 📋 步骤 1: 获取 Supabase 配置信息

### 如果你还没有 Supabase 项目：

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 **"Start your project"** 或 **"Sign in"**
3. 登录后，点击 **"New Project"**
4. 填写项目信息：
   - **Name**: 给你的项目起个名字（如：CRM System）
   - **Database Password**: 设置一个强密码（记住它！）
   - **Region**: 选择离你最近的区域
5. 点击 **"Create new project"**
6. 等待项目创建完成（约 2 分钟）

### 获取 API Keys：

1. 在 Supabase Dashboard 中，点击左侧菜单的 **⚙️ Settings**
2. 点击 **API** 选项
3. 你会看到以下信息：

   **Project URL**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   复制这个完整的 URL（包括 https://）

   **anon public key**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1Nzg5MDAwLCJleHAiOjE5NjEzNjUwMDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   点击旁边的复制按钮复制这个 key

   **service_role key** (⚠️ 保密！)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDU3ODkwMDAsImV4cCI6MTk2MTM2NTAwMH0.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```
   点击旁边的复制按钮复制这个 key（这个 key 有完整权限，不要泄露！）

## 📝 步骤 2: 编辑 .env.local 文件

1. 在项目根目录找到 `.env.local` 文件
2. 用文本编辑器打开（VS Code、记事本等）
3. 找到以下行并替换：

   **替换前（错误）：**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   ```

   **替换后（正确）：**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   ```

4. 同样替换其他两个值：

   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **保存文件**

## ✅ 步骤 3: 验证配置

运行检查脚本：
```bash
node check-env.js
```

或者访问健康检查端点：
```
http://localhost:3000/api/health
```

## 🔄 步骤 4: 重启开发服务器

**重要：** 修改 `.env.local` 后必须重启服务器！

1. 在运行 `npm run dev` 的终端窗口按 `Ctrl+C` 停止服务器
2. 重新运行 `npm run dev`

## 📊 步骤 5: 创建数据库表

配置完成后，还需要创建数据库表：

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 **New query**
3. 打开项目中的 `supabase-schema.sql` 文件
4. 复制所有 SQL 代码
5. 粘贴到 Supabase SQL Editor 中
6. 点击 **Run** 或按 `F5` 执行

## 🎯 完整示例

你的 `.env.local` 文件应该看起来像这样：

```env
# Supabase Configuration
# Get these values from: https://supabase.com/dashboard/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnopqrst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU3ODkwMDAsImV4cCI6MTk2MTM2NTAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTc4OTAwMCwiZXhwIjoxOTYxMzY1MDAwfQ.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

**注意：**
- 不要使用引号
- 不要在等号前后加空格
- URL 必须以 `https://` 开头
- 确保没有多余的空格或换行

## ❓ 常见问题

**Q: 我找不到 .env.local 文件**
A: 它可能在项目根目录，但被隐藏了。在 VS Code 中，确保显示隐藏文件。

**Q: 修改后还是不行**
A: 确保：
1. 文件已保存
2. 开发服务器已重启
3. URL 格式正确（以 https:// 开头）
4. 没有多余的空格或引号

**Q: 如何确认配置正确？**
A: 访问 `http://localhost:3000/api/health`，应该看到 `supabaseConnection: true`
