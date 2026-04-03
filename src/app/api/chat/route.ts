import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

const CHAT_SYSTEM_PROMPT = `Você é o assistente virtual da Action, uma loja de descontos online. Responda em português por padrão. Ajude com perguntas sobre produtos, entregas, devoluções, política da loja. 

Regras importantes:
- Entregas ao domicílio são grátis acima de 19,90€, caso contrário 4,90€
- Prazo de entrega: até 7 dias úteis
- Devoluções em até 14 dias
- Preços competitivos com até 40% de desconto
- Loja online com entregas em Portugal, França, Espanha, Itália, Holanda, Alemanha, Bélgica, Luxemburgo e Brasil
- Seja simpático, profissional e prestativo
- Responda de forma concisa e direta
- Se não souber a resposta, sugira contactar o apoio ao cliente`;

// Basic rate limiter for chat
const chatRateLimits = new Map<string, { count: number; resetAt: number }>();
const CHAT_RATE_LIMIT = 20; // requests per minute
const CHAT_RATE_WINDOW = 60_000;

function checkChatRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = chatRateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    chatRateLimits.set(ip, { count: 1, resetAt: now + CHAT_RATE_WINDOW });
    return true;
  }
  if (entry.count >= CHAT_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip") || "unknown";
    if (!checkChatRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: "Message too long" },
        { status: 400 }
      );
    }

    // Build messages array for LLM
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
    ];

    // Add conversation history (limit to last 10 messages for context)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    // Call z-ai-web-dev-sdk for chat completion
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Desculpe, não consegui processar a sua mensagem. Tente novamente.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in chat endpoint:", error);

    // Fallback response
    return NextResponse.json({
      reply:
        "Desculpe, estou com dificuldades técnicas neste momento. Por favor, tente novamente em instantes ou contacte o nosso apoio ao cliente.",
    });
  }
}
