import nodemailer from "nodemailer";

// Configuração do transporter Brevo
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://chaveiro-saas.vercel.app";
  const resetLink = `${baseUrl}${resetUrl}`;

  await transporter.sendMail({
    from: `"Chaveiro Pro" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "🔑 Resetar sua senha - Chaveiro Pro",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: #0f0500; color: #f59e0b; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .content h2 { color: #111827; margin-top: 0; }
            .button {
              background: #f59e0b;
              color: white;
              padding: 14px 28px;
              border-radius: 6px;
              text-decoration: none;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
              text-align: center;
            }
            .button:hover { background: #d97706; }
            .footer {
              background: #f3f4f6;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Chaveiro Pro</h1>
            </div>

            <div class="content">
              <h2>Resetar Sua Senha</h2>
              <p>Olá,</p>
              <p>Você solicitou para resetar sua senha no Chaveiro Pro. Clique no botão abaixo para criar uma nova senha:</p>

              <center>
                <a href="${resetLink}" class="button">Resetar Senha</a>
              </center>

              <div class="warning">
                <strong>⏰ Atenção:</strong> Este link expira em 1 hora por segurança.
              </div>

              <p>Se você não solicitou essa alteração, pode ignorar este email com segurança. Sua conta não será alterada.</p>

              <p style="color: #6b7280; font-size: 14px;">
                <strong>Link não funciona?</strong> Copie e cole no navegador:<br>
                <span style="word-break: break-all; font-family: monospace; background: #f3f4f6; padding: 8px; display: inline-block; border-radius: 4px;">
                  ${resetLink}
                </span>
              </p>
            </div>

            <div class="footer">
              <p>&copy; 2026 Chaveiro Pro. Todos os direitos reservados.</p>
              <p>Dúvidas? <a href="mailto:suporte@chaveiro.com" style="color: #f59e0b; text-decoration: none;">Contate nosso suporte</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
