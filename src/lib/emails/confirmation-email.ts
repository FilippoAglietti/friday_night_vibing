/**
 * Supabase Auth Confirmation Email Template
 * ──────────────────────────────────────────────
 * This HTML template is designed to be pasted into:
 * Supabase Dashboard → Authentication → Email Templates → Confirm signup
 *
 * Variables used by Supabase:
 * {{ .ConfirmationURL }} — The verification link
 * {{ .Email }} — The user's email
 * {{ .SiteURL }} — The site URL configured in Supabase
 *
 * To use: Copy the output of getConfirmationEmailHTML() and paste
 * it into the Supabase dashboard email template editor.
 */

export function getConfirmationEmailHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Verify your email — Syllabi.ai</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0; padding: 0; width: 100% !important; }
    img { border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3ff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #f5f3ff;">
    Verify your email to start creating AI-powered courses with Syllabi.ai
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 36px; text-align: center;">
              <!-- Logo -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
                <tr>
                  <td style="background: rgba(255,255,255,0.2); border-radius: 16px; padding: 12px 20px;">
                    <span style="font-size: 24px; font-weight: 800; color: white; letter-spacing: -0.5px;">syllabi</span><span style="font-size: 24px; font-weight: 800; color: #FCD34D; letter-spacing: -0.5px;">.ai</span>
                  </td>
                </tr>
              </table>

              <h1 style="margin: 0 0 8px; font-size: 26px; font-weight: 800; color: white; line-height: 1.3;">
                Verify your email &#x2709;&#xFE0F;
              </h1>
              <p style="margin: 0; font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.5;">
                One click and you're in. Let's get you creating courses.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background: white; padding: 40px;">

              <p style="margin: 0 0 24px; font-size: 15px; color: #374151; line-height: 1.6; text-align: center;">
                Click the button below to verify <strong>{{ .Email }}</strong> and activate your Syllabi.ai account.
              </p>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #A855F7); color: white; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 44px; border-radius: 12px; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);">
                      Verify My Email &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin: 0 0 8px; font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5;">
                Button not working? Copy and paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; color: #A78BFA; text-align: center; word-break: break-all; line-height: 1.5;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #1E1B4B; border-radius: 0 0 24px 24px; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">
                <span style="color: white;">syllabi</span><span style="color: #A855F7;">.ai</span>
              </p>
              <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.6;">
                If you didn't sign up for Syllabi.ai, you can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} Syllabi.ai
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
