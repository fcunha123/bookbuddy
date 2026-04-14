// supabase/functions/send-invite/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_KEY   = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL      = Deno.env.get("APP_URL") ?? "https://bookbuddy-eta.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth: require logged-in user ────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "E-mail inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Get inviter profile ─────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome, avatar_emoji")
      .eq("id", user.id)
      .single();

    const nome  = profile?.nome         ?? "Um amigo";
    const emoji = profile?.avatar_emoji ?? "📚";

    // ── Save invite record ──────────────────────────────────────────────────
    const { data: invite } = await supabase
      .from("invites")
      .insert({ inviter_id: user.id, email })
      .select("token")
      .single();

    const link = `${APP_URL}?convite=${invite?.token ?? ""}`;

    // ── Send via Resend ─────────────────────────────────────────────────────
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    "BookBuddy <convites@bookbuddy.app>",
        to:      [email],
        subject: `${emoji} ${nome} convidou-te para o BookBuddy!`,
        html: `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Convite BookBuddy</title>
</head>
<body style="margin:0;padding:0;background:#FFFBF0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:24px;border:3px solid #1A2025;
          box-shadow:4px 6px 0 #1A2025;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#FF4757;padding:32px;text-align:center;">
          <div style="font-size:56px;margin-bottom:8px;">📚</div>
          <h1 style="font-size:32px;color:#fff;margin:0;font-weight:900;">BookBuddy</h1>
          <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0;">
            Troca livros com os teus amigos!
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="font-size:18px;font-weight:700;color:#1A2025;margin:0 0 12px;">
            ${emoji} ${nome} convidou-te!
          </p>
          <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 28px;">
            <strong>${nome}</strong> quer trocar livros contigo no <strong>BookBuddy</strong> —
            a app onde podes emprestar e pedir livros aos teus amigos de forma segura e divertida!
          </p>

          <!-- Steps -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="padding:8px 0;">
              <table width="100%"><tr>
                <td width="40" style="vertical-align:top;padding-right:12px;">
                  <div style="width:36px;height:36px;border-radius:10px;background:#FFD93D;
                    border:2px solid #1A2025;text-align:center;line-height:36px;
                    font-size:16px;font-weight:900;color:#1A2025;">1</div>
                </td>
                <td>
                  <p style="font-size:14px;font-weight:700;color:#1A2025;margin:0;">Abre o link abaixo</p>
                  <p style="font-size:13px;color:#777;margin:2px 0 0;">Vai direto para a app</p>
                </td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:8px 0;">
              <table width="100%"><tr>
                <td width="40" style="vertical-align:top;padding-right:12px;">
                  <div style="width:36px;height:36px;border-radius:10px;background:#00D2D3;
                    border:2px solid #1A2025;text-align:center;line-height:36px;
                    font-size:16px;font-weight:900;color:#1A2025;">2</div>
                </td>
                <td>
                  <p style="font-size:14px;font-weight:700;color:#1A2025;margin:0;">Cria a tua conta grátis</p>
                  <p style="font-size:13px;color:#777;margin:2px 0 0;">Com este mesmo e-mail</p>
                </td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:8px 0;">
              <table width="100%"><tr>
                <td width="40" style="vertical-align:top;padding-right:12px;">
                  <div style="width:36px;height:36px;border-radius:10px;background:#6BCB77;
                    border:2px solid #1A2025;text-align:center;line-height:36px;
                    font-size:16px;font-weight:900;color:#1A2025;">3</div>
                </td>
                <td>
                  <p style="font-size:14px;font-weight:700;color:#1A2025;margin:0;">Começa a trocar livros!</p>
                  <p style="font-size:13px;color:#777;margin:2px 0 0;">Com ${nome} e outros amigos 📚</p>
                </td>
              </tr></table>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%"><tr><td align="center">
            <a href="${link}"
              style="display:inline-block;background:#FF4757;color:#fff;
                text-decoration:none;font-size:18px;font-weight:900;
                padding:16px 36px;border-radius:18px;border:3px solid #1A2025;
                box-shadow:4px 4px 0 #1A2025;">
              🚀 Aceitar Convite
            </a>
          </td></tr></table>

          <p style="font-size:12px;color:#aaa;text-align:center;margin:20px 0 0;line-height:1.5;">
            Se não conheces ${nome}, podes ignorar este e-mail.<br>
            <a href="${link}" style="color:#aaa;word-break:break-all;">${link}</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f4ec;padding:20px;text-align:center;border-top:2px solid #eee;">
          <p style="font-size:12px;color:#999;margin:0;">
            © 2025 BookBuddy · Leitura segura e divertida 📚
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Falha ao enviar e-mail" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, email }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
