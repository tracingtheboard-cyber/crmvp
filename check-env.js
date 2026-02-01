// 简单的环境变量检查脚本
// 运行: node check-env.js

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

console.log('🔍 检查环境变量配置...\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local 文件不存在！');
  console.log('请创建 .env.local 文件并添加以下内容：\n');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

let supabaseUrl = '';
let supabaseAnonKey = '';
let supabaseServiceKey = '';

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') || !trimmed) return;
  
  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('=').trim();
  
  if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
    supabaseUrl = value;
  } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
    supabaseAnonKey = value;
  } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
    supabaseServiceKey = value;
  }
});

console.log('当前配置：\n');

// 检查 Supabase URL
if (!supabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: 未设置');
} else if (supabaseUrl.includes('your_supabase') || supabaseUrl === 'your_supabase_project_url') {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: 仍然是占位符值');
  console.log(`   当前值: ${supabaseUrl}`);
  console.log('   ⚠️  请替换为你的实际 Supabase URL');
} else if (!supabaseUrl.startsWith('https://')) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: 缺少 https:// 前缀');
  console.log(`   当前值: ${supabaseUrl}`);
  console.log('   ⚠️  URL 应该以 https:// 开头');
} else {
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
}

// 检查 Anon Key
if (!supabaseAnonKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: 未设置');
} else if (supabaseAnonKey.includes('your_') || supabaseAnonKey === 'your_supabase_anon_key') {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: 仍然是占位符值');
  console.log('   ⚠️  请替换为你的实际 anon key');
} else {
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 30)}...`);
}

// 检查 Service Role Key
if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY: 未设置');
} else if (supabaseServiceKey.includes('your_') || supabaseServiceKey === 'your_supabase_service_role_key') {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY: 仍然是占位符值');
  console.log('   ⚠️  请替换为你的实际 service role key');
} else {
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 30)}...`);
}

console.log('\n📝 如何获取正确的值：');
console.log('1. 访问 https://supabase.com/dashboard');
console.log('2. 选择你的项目');
console.log('3. 点击 Settings > API');
console.log('4. 复制以下值：');
console.log('   - Project URL → NEXT_PUBLIC_SUPABASE_URL');
console.log('   - anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   - service_role key → SUPABASE_SERVICE_ROLE_KEY');
console.log('\n💡 提示：修改 .env.local 后需要重启开发服务器！');
