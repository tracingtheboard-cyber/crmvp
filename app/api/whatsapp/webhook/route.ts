import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// 这个接口是给 WhatsApp Cloud API 调用的 Webhook
// 文档结构大致为：
// entry[0].changes[0].value.messages[0] 里包含 from（手机号）、text.body（消息）

// 建议你在 Meta 后台配置的 verify_token
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'CHANGE_ME_VERIFY_TOKEN';

// GET /api/whatsapp/webhook
// 用于 WhatsApp 第一次验证 Webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN && challenge) {
    // 验证通过，按 WhatsApp 要求原样返回 challenge
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST /api/whatsapp/webhook
// 用于接收 WhatsApp Cloud API 发送过来的消息事件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 先记录完整 payload，方便你在日志里对照官方文档调试
    console.log('[WhatsApp Webhook] Incoming payload:', JSON.stringify(body, null, 2));

    // 按 WhatsApp Cloud API 的结构安全地取第一个消息
    const entry = Array.isArray(body.entry) && body.entry[0];
    const changes = entry && Array.isArray(entry.changes) && entry.changes[0];
    const value = changes && changes.value;
    const messages = value && Array.isArray(value.messages) && value.messages[0];

    if (!messages) {
      // 不是我们关心的消息事件（可能是状态回调等），直接返回 200 即可
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const from = messages.from as string | undefined; // 发送方手机号（含国家码）
    const textBody =
      (messages.text && messages.text.body) ||
      (messages.type === 'text' ? messages.body : undefined);

    const subject = from ? `WhatsApp from ${from}` : 'WhatsApp Enquiry';
    const messageContent =
      textBody || `WhatsApp message received at ${new Date().toISOString()}`;

    // 插入一条 Enquiry 记录
    const { error } = await supabaseAdmin.from('enquiries').insert([
      {
        subject,
        message: messageContent,
        status: 'open',
        priority: 'medium',
      },
    ]);

    if (error) {
      console.error('[WhatsApp Webhook] Failed to insert enquiry:', error);
      // 不把详细错误返回给 WhatsApp，只在日志里记录
    }

    // 按 WhatsApp 要求返回 200
    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (err: any) {
    console.error('[WhatsApp Webhook] Error handling request:', err);
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}

