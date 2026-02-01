# 快速设置指南

## 步骤 1: 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project" 创建新项目
4. 填写项目信息（项目名称、数据库密码等）
5. 等待项目创建完成（约 2 分钟）

## 步骤 2: 获取 API Keys

1. 在 Supabase 项目仪表板中，点击左侧菜单的 **Settings** (设置)
2. 点击 **API** 选项
3. 你会看到以下信息：
   - **Project URL** - 复制这个值
   - **anon public** key - 复制这个值
   - **service_role** key - 复制这个值（⚠️ 保密！）

## 步骤 3: 配置环境变量

1. 打开项目根目录下的 `.env.local` 文件
2. 将以下值替换为你从 Supabase 复制的值：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 步骤 4: 创建数据库表

1. 在 Supabase 项目中，点击左侧菜单的 **SQL Editor**
2. 点击 **New query**
3. 打开项目中的 `supabase-schema.sql` 文件
4. 复制所有 SQL 代码
5. 粘贴到 Supabase SQL Editor 中
6. 点击 **Run** 执行 SQL

## 步骤 5: 重启开发服务器

如果开发服务器正在运行，需要重启它来加载新的环境变量：

1. 停止当前服务器（Ctrl+C）
2. 运行 `npm run dev` 重新启动

## 验证设置

完成以上步骤后，访问 http://localhost:3000，你应该能够：
- 看到 Dashboard 页面
- 添加新的 Leads
- 导入 CSV 文件

如果遇到错误，请检查：
- `.env.local` 文件中的值是否正确
- 是否已执行 `supabase-schema.sql` 创建数据库表
- 开发服务器是否已重启
