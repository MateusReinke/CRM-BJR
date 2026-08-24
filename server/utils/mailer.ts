import nodemailer from "nodemailer";

// Sends transactional e-mail via SMTP when configured. Mirrors the
// ENCRYPTION_KEY fallback pattern in server/utils/crypto.ts: without SMTP_HOST
// set, the message is logged instead of sent, so password reset still works
// end-to-end in local/dev environments that don't have a mail provider wired
// up yet.
function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;

  const port = SMTP_PORT ? Number(SMTP_PORT) : 587;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const transport = getTransport();
  const subject = "Redefinição de senha - BJR Centro Automotivo";
  const text = [
    "Recebemos uma solicitação para redefinir a senha da sua conta.",
    "",
    `Clique no link abaixo para escolher uma nova senha (válido por 1 hora):`,
    resetUrl,
    "",
    "Se você não solicitou isso, ignore este e-mail - sua senha continua a mesma.",
  ].join("\n");

  if (!transport) {
    console.log(`[mailer] SMTP não configurado - link de redefinição de senha para ${to}:\n${resetUrl}`);
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || "BJR Centro Automotivo <no-reply@bjrautomotivo.com.br>",
    to,
    subject,
    text,
  });
}
