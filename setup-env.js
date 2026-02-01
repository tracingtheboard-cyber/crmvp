// 环境变量快速设置脚本
// 运行: node setup-env.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '.env.local');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🔧 Supabase 环境变量配置向导\n');
  console.log('请按照以下步骤获取密钥：');
  console.log('1. 打开 https://supabase.com/dashboard');
  console.log('2. 选择你的项目');
  console.log('3. 点击 Settings > API');
  console.log('4. 复制 Project URL、anon public key 和 service_role key\n');

  // 检查文件是否已存在
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env.local 文件已存在，是否覆盖？(y/n): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('已取消。');
      rl.close();
      return;
    }
  }

  const supabaseUrl = await question('请输入 NEXT_PUBLIC_SUPABASE_URL (例如: https://xxxxx.supabase.co): ');
  const anonKey = await question('请输入 NEXT_PUBLIC_SUPABASE_ANON_KEY: ');
  const serviceKey = await question('请输入 SUPABASE_SERVICE_ROLE_KEY: ');

  // 验证输入
  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.log('❌ 所有字段都必须填写！');
    rl.close();
    return;
  }

  // 创建 .env.local 内容
  const envContent = `# Supabase 环境变量配置
# 自动生成于 ${new Date().toLocaleString()}

# Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl.trim()}

# Supabase Anon Key (公开密钥，可在客户端使用)
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey.trim()}

# Supabase Service Role Key (服务端密钥，请保密！)
SUPABASE_SERVICE_ROLE_KEY=${serviceKey.trim()}
`;

  // 写入文件
  try {
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('\n✅ .env.local 文件已创建！');
    console.log('\n📝 下一步：');
    console.log('1. 重启开发服务器（如果正在运行）');
    console.log('2. 访问 http://localhost:3000/api/health 验证配置');
    console.log('\n⚠️  重要：请确保 .env.local 已添加到 .gitignore，不要提交到 Git！');
  } catch (error) {
    console.error('❌ 创建文件失败:', error.message);
  }

  rl.close();
}

setup().catch(console.error);
