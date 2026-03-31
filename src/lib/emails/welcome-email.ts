/**
 * Premium Welcome Email Template for Syllabi.ai
 * ──────────────────────────────────────────────
 * Beautiful HTML email with confetti-style decorative elements,
 * gradient branding, and a compelling CTA.
 *
 * Note: Email clients don't support JS animations, so we use
 * CSS keyframe animations (supported by Apple Mail, Gmail app,
 * some Outlook versions) with static fallback for others.
 */

interface WelcomeEmailProps {
  userName?: string;
  email: string;
}

export function generateWelcomeEmail({ userName, email }: WelcomeEmailProps): string {
  const displayName = userName || email.split("@")[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://syllabi.ai";

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Welcome to Syllabi.ai</title>
  <style>
    /* Reset */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0; padding: 0; width: 100% !important; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse !important; }

    /* Confetti animation (works in Apple Mail, Gmail app, some others) */
    @keyframes confettiFall1 {
      0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
    }
    @keyframes confettiFall2 {
      0% { transform: translateY(-15px) rotate(45deg); opacity: 0; }
      15% { opacity: 1; }
      100% { transform: translateY(90px) rotate(-270deg); opacity: 0; }
    }
    @keyframes confettiFall3 {
      0% { transform: translateY(-25px) rotate(-30deg); opacity: 0; }
      8% { opacity: 1; }
      100% { transform: translateY(70px) rotate(300deg); opacity: 0; }
    }
    @keyframes fadeInUp {
      0% { transform: translateY(30px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes scaleIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .confetti-1 { animation: confettiFall1 3s ease-in-out infinite; }
    .confetti-2 { animation: confettiFall2 3.5s ease-in-out 0.3s infinite; }
    .confetti-3 { animation: confettiFall3 2.8s ease-in-out 0.6s infinite; }
    .confetti-4 { animation: confettiFall1 3.2s ease-in-out 0.9s infinite; }
    .confetti-5 { animation: confettiFall2 3.8s ease-in-out 0.2s infinite; }
    .confetti-6 { animation: confettiFall3 3.1s ease-in-out 0.5s infinite; }
    .confetti-7 { animation: confettiFall1 2.9s ease-in-out 0.8s infinite; }
    .confetti-8 { animation: confettiFall2 3.4s ease-in-out 0.1s infinite; }

    .fade-in { animation: fadeInUp 0.8s ease-out forwards; }
    .scale-in { animation: scaleIn 0.6s ease-out 0.3s forwards; opacity: 0; }

    .cta-button {
      animation: scaleIn 0.6s ease-out 0.5s forwards;
      opacity: 0;
    }
    .cta-button:hover {
      transform: scale(1.05) !important;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a2e !important; }
      .card-bg { background-color: #16162a !important; }
      .text-primary { color: #f1f1f1 !important; }
      .text-secondary { color: #b0b0c0 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3ff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #f5f3ff;">
    Welcome to Syllabi.ai! Your AI-powered course creation journey starts now.
  </div>

  <!-- Main wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff;" class="email-bg">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Email card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- ═══════════════════════════════════════════ -->
          <!--  HEADER with gradient + confetti           -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%); border-radius: 24px 24px 0 0; padding: 48px 40px 56px; position: relative; overflow: hidden;">

              <!-- Confetti elements (CSS animated) -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none;">
                <!-- Row 1 -->
                <div class="confetti-1" style="position: absolute; top: 12px; left: 8%; width: 10px; height: 10px; background: #FCD34D; border-radius: 2px; transform: rotate(15deg);"></div>
                <div class="confetti-2" style="position: absolute; top: 8px; left: 22%; width: 8px; height: 14px; background: #34D399; border-radius: 2px; transform: rotate(-20deg);"></div>
                <div class="confetti-3" style="position: absolute; top: 15px; left: 38%; width: 12px; height: 6px; background: #F472B6; border-radius: 2px; transform: rotate(40deg);"></div>
                <div class="confetti-4" style="position: absolute; top: 5px; left: 55%; width: 8px; height: 8px; background: #60A5FA; border-radius: 50%; transform: rotate(-10deg);"></div>
                <div class="confetti-5" style="position: absolute; top: 18px; left: 70%; width: 14px; height: 6px; background: #FBBF24; border-radius: 2px; transform: rotate(25deg);"></div>
                <div class="confetti-6" style="position: absolute; top: 10px; left: 82%; width: 6px; height: 12px; background: #A78BFA; border-radius: 2px; transform: rotate(-35deg);"></div>
                <div class="confetti-7" style="position: absolute; top: 20px; left: 92%; width: 10px; height: 8px; background: #F87171; border-radius: 2px; transform: rotate(55deg);"></div>
                <div class="confetti-8" style="position: absolute; top: 3px; left: 48%; width: 8px; height: 8px; background: #2DD4BF; border-radius: 50%;"></div>

                <!-- Row 2 -->
                <div class="confetti-3" style="position: absolute; top: -5px; left: 15%; width: 6px; height: 10px; background: #FB923C; border-radius: 2px;"></div>
                <div class="confetti-1" style="position: absolute; top: -10px; left: 65%; width: 10px; height: 6px; background: #E879F9; border-radius: 2px;"></div>
                <div class="confetti-5" style="position: absolute; top: -8px; left: 35%; width: 8px; height: 8px; background: #4ADE80; border-radius: 50%;"></div>
                <div class="confetti-7" style="position: absolute; top: -3px; left: 88%; width: 12px; height: 5px; background: #FDE68A; border-radius: 2px;"></div>
              </div>

              <!-- Logo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <!-- Inline SVG logo mark -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background: rgba(255,255,255,0.2); border-radius: 20px; padding: 16px 24px;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <!-- Icon circle -->
                              <td style="vertical-align: middle; padding-right: 12px;">
                                <div style="width: 44px; height: 44px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 44px;">
                                  <span style="font-size: 24px;">&#x1F393;</span>
                                </div>
                              </td>
                              <!-- Text -->
                              <td style="vertical-align: middle;">
                                <span style="font-size: 28px; font-weight: 800; color: white; letter-spacing: -1px;">syllabi</span><span style="font-size: 28px; font-weight: 800; color: #FCD34D; letter-spacing: -1px;">.ai</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" class="fade-in">
                    <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 800; color: white; line-height: 1.2; letter-spacing: -0.5px;">
                      Welcome aboard, ${displayName}! &#x1F389;
                    </h1>
                    <p style="margin: 0; font-size: 17px; color: rgba(255,255,255,0.9); line-height: 1.6; max-width: 440px;">
                      You just joined the smartest way to create professional courses with AI. Let's build something amazing.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════ -->
          <!--  MAIN BODY                                 -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="background: white; padding: 48px 40px 40px;" class="card-bg">

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
                <tr>
                  <td align="center" class="cta-button">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #A855F7); color: white; text-decoration: none; font-size: 17px; font-weight: 700; padding: 16px 48px; border-radius: 14px; letter-spacing: 0.3px; box-shadow: 0 4px 24px rgba(124, 58, 237, 0.35); transition: transform 0.2s;">
                      Create Your First Course &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 36px;">
                <tr>
                  <td style="height: 1px; background: linear-gradient(to right, transparent, #E9D5FF, transparent);"></td>
                </tr>
              </table>

              <!-- What you can do heading -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #7C3AED; text-transform: uppercase; letter-spacing: 2px;">
                      Here's what you can do
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature cards (2x2 grid) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 36px;">
                <!-- Row 1 -->
                <tr>
                  <td width="50%" style="padding: 0 8px 16px 0; vertical-align: top;">
                    <div style="background: linear-gradient(135deg, #FAF5FF, #F3E8FF); border-radius: 16px; padding: 24px 20px; border: 1px solid #EDE9FE;">
                      <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #7C3AED, #A855F7); border-radius: 12px; text-align: center; line-height: 44px; margin-bottom: 14px;">
                        <span style="font-size: 22px;">&#x26A1;</span>
                      </div>
                      <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1E1B4B;">AI-Generated Courses</p>
                      <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.5;">Full curriculum with modules, lessons, quizzes &amp; pacing in seconds.</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 0 0 16px 8px; vertical-align: top;">
                    <div style="background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border-radius: 16px; padding: 24px 20px; border: 1px solid #BFDBFE;">
                      <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #2563EB, #3B82F6); border-radius: 12px; text-align: center; line-height: 44px; margin-bottom: 14px;">
                        <span style="font-size: 22px;">&#x1F4E5;</span>
                      </div>
                      <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1E1B4B;">Multi-Format Export</p>
                      <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.5;">PDF, Word, Notion, Slides, SCORM packages &amp; shareable links.</p>
                    </div>
                  </td>
                </tr>
                <!-- Row 2 -->
                <tr>
                  <td width="50%" style="padding: 0 8px 0 0; vertical-align: top;">
                    <div style="background: linear-gradient(135deg, #ECFDF5, #D1FAE5); border-radius: 16px; padding: 24px 20px; border: 1px solid #A7F3D0;">
                      <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #059669, #10B981); border-radius: 12px; text-align: center; line-height: 44px; margin-bottom: 14px;">
                        <span style="font-size: 22px;">&#x1F9E0;</span>
                      </div>
                      <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1E1B4B;">Rich Lesson Content</p>
                      <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.5;">Detailed explanations, real sources, exercises &amp; pro tips in every lesson.</p>
                    </div>
                  </td>
                  <td width="50%" style="padding: 0 0 0 8px; vertical-align: top;">
                    <div style="background: linear-gradient(135deg, #FFF7ED, #FFEDD5); border-radius: 16px; padding: 24px 20px; border: 1px solid #FED7AA;">
                      <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #EA580C, #F97316); border-radius: 12px; text-align: center; line-height: 44px; margin-bottom: 14px;">
                        <span style="font-size: 22px;">&#x1F3AF;</span>
                      </div>
                      <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1E1B4B;">Quizzes &amp; Assessment</p>
                      <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.5;">Auto-generated quizzes with explanations to test knowledge retention.</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 36px;">
                <tr>
                  <td style="height: 1px; background: linear-gradient(to right, transparent, #E9D5FF, transparent);"></td>
                </tr>
              </table>

              <!-- Quick start steps -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 36px;">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #7C3AED; text-transform: uppercase; letter-spacing: 2px;">
                      Get started in 3 steps
                    </p>
                  </td>
                </tr>
                <!-- Step 1 -->
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="48" style="vertical-align: top; padding-right: 16px;">
                          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7C3AED, #A855F7); border-radius: 50%; text-align: center; line-height: 40px; font-size: 16px; font-weight: 800; color: white;">1</div>
                        </td>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #1E1B4B;">Describe your course</p>
                          <p style="margin: 0; font-size: 13px; color: #6B7280;">Tell us the topic, audience, and difficulty level.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Step 2 -->
                <tr>
                  <td style="padding-bottom: 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="48" style="vertical-align: top; padding-right: 16px;">
                          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7C3AED, #A855F7); border-radius: 50%; text-align: center; line-height: 40px; font-size: 16px; font-weight: 800; color: white;">2</div>
                        </td>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #1E1B4B;">AI generates your curriculum</p>
                          <p style="margin: 0; font-size: 13px; color: #6B7280;">Modules, lessons, quizzes, pacing, and rich content appear instantly.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Step 3 -->
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="48" style="vertical-align: top; padding-right: 16px;">
                          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7C3AED, #A855F7); border-radius: 50%; text-align: center; line-height: 40px; font-size: 16px; font-weight: 800; color: white;">3</div>
                        </td>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #1E1B4B;">Export &amp; share</p>
                          <p style="margin: 0; font-size: 13px; color: #6B7280;">Download as PDF, Word, Slides, or share with a single link.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Secondary CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/#examples" target="_blank" style="display: inline-block; background: #F5F3FF; color: #7C3AED; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 32px; border-radius: 10px; border: 2px solid #E9D5FF; letter-spacing: 0.2px;">
                      Browse Example Courses
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ═══════════════════════════════════════════ -->
          <!--  FOOTER                                    -->
          <!-- ═══════════════════════════════════════════ -->
          <tr>
            <td style="background: #1E1B4B; border-radius: 0 0 24px 24px; padding: 32px 40px; text-align: center;">

              <!-- Logo small -->
              <p style="margin: 0 0 12px; font-size: 18px; font-weight: 700;">
                <span style="color: white;">syllabi</span><span style="color: #A855F7;">.ai</span>
              </p>

              <p style="margin: 0 0 20px; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6;">
                AI-Powered Course Generation for Course Creators
              </p>

              <!-- Social / links row -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${appUrl}" style="color: #A78BFA; text-decoration: none; font-size: 13px; font-weight: 500;">Website</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.2); font-size: 13px;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="${appUrl}/#pricing" style="color: #A78BFA; text-decoration: none; font-size: 13px; font-weight: 500;">Pricing</a>
                  </td>
                  <td style="color: rgba(255,255,255,0.2); font-size: 13px;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="${appUrl}/#examples" style="color: #A78BFA; text-decoration: none; font-size: 13px; font-weight: 500;">Examples</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.6;">
                You're receiving this because you signed up for Syllabi.ai<br/>
                &copy; ${new Date().getFullYear()} Syllabi.ai &mdash; All rights reserved.
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
