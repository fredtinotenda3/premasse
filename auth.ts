// auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Resend } from "resend";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CLIENT";
    } & DefaultSession["user"];
  }
  interface User {
    role: "ADMIN" | "CLIENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CLIENT";
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  debug: true,

  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/portal/verify",
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              accounts: {
                where: { provider: "credentials" },
                select: { access_token: true },
              },
            },
          });

          if (!user || user.role !== "ADMIN") return null;

          const hashedPassword = user.accounts[0]?.access_token;
          if (!hashedPassword) return null;

          const match = await compare(password, hashedPassword);
          if (!match) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          // A thrown error here (as opposed to returning null) is what
          // produces NextAuth's generic `error=unknown` page instead of a
          // normal "invalid credentials" message. Most commonly this is a
          // database connectivity issue (e.g. Neon's compute endpoint
          // scaling to zero and taking a few seconds to wake on the first
          // local request) rather than a wrong password. Logging it here
          // (safe — no credentials or secrets) makes the real cause visible
          // in the server console instead of being swallowed into
          // "unknown".
          console.error("[auth][authorize] Unexpected error during credential check:", err);
          return null;
        }
      },
    }),

    {
      id: "email",
      name: "Email",
      type: "email" as const,
      from: process.env.EMAIL_FROM ?? "Premasse <onboarding@resend.dev>",
      server: {},
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest({ identifier: email, url }) {
        console.log(`📧 Sending magic link to: ${email}`);
        
        // Check if user exists and is CLIENT
        const user = await prisma.user.findUnique({
          where: { email },
          select: { role: true, name: true },
        });

        if (!user) {
          console.log(`❌ No user found for: ${email}`);
          return;
        }

        if (user.role !== "CLIENT") {
          console.log(`❌ User ${email} has role ${user.role}, not CLIENT`);
          return;
        }

        console.log(`✅ Sending magic link to CLIENT: ${email}`);

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "Premasse <onboarding@resend.dev>",
          to: [email],
          subject: "🔐 Your Premasse sign-in link",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="color-scheme" content="light">
              <meta name="supported-color-schemes" content="light">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; background: #f5f5f5; }
                .container { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .header { text-align: center; margin-bottom: 32px; }
                .logo { font-size: 28px; font-weight: bold; color: #1B5E20; margin: 0; }
                .sub { color: #C9A84C; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
                h2 { color: #1B5E20; font-size: 22px; margin: 0 0 16px; }
                p { color: #4A5568; line-height: 1.6; margin: 0 0 16px; }
                .button { display: inline-block; background: #C9A84C; color: #1B5E20; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; margin: 16px 0; }
                .warning { background: #FFF3E0; border-left: 3px solid #FF9800; padding: 12px 16px; margin: 24px 0; border-radius: 8px; font-size: 13px; }
                .warning-title { font-weight: bold; color: #E65100; margin-bottom: 8px; }
                hr { border: none; border-top: 1px solid #E2E8F0; margin: 24px 0 16px; }
                .footer { text-align: center; color: #A0AEC0; font-size: 12px; }
                .spam-instruction { background: #E8F5E9; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 13px; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 class="logo">Premasse</h1>
                  <div class="sub">Business Services</div>
                </div>
                
                <h2>Sign in to your portal</h2>
                
                <p>Hello ${user.name?.split(" ")[0] ?? "there"},</p>
                
                <p>Click the button below to sign in to your Premasse client portal. This link expires in 24 hours.</p>
                
                <div style="text-align: center;">
                  <a href="${url}" class="button">Sign in to portal →</a>
                </div>
                
                <!-- SPAM PREVENTION INSTRUCTION -->
                <div class="spam-instruction">
                  <strong>📧 Didn't receive the email?</strong><br>
                  Check your <strong>Spam/Junk folder</strong> and mark this email as "Not Spam".<br>
                  Then add <strong>noreply@resend.dev</strong> to your contacts.
                </div>
                
                <div class="warning">
                  <div class="warning-title">⚠️ Important Security Notice</div>
                  <div>This link is one-time use and expires in 24 hours. If you didn't request this email, you can safely ignore it.</div>
                </div>
                
                <hr>
                
                <div class="footer">
                  <p>Premasse Business Services · Harare, Zimbabwe</p>
                  <p style="font-size: 11px;">This is an automated message. Please do not reply to this email.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        if (error) {
          console.error(`❌ Resend error for ${email}:`, JSON.stringify(error, null, 2));
          throw new Error(`Failed to send email: ${error.message}`);
        }
        
        if (data) {
          console.log(`✅ Resend success for ${email}:`, JSON.stringify(data, null, 2));
        }
        
        console.log(`✅ Magic link sent to: ${email}`);
      },
    },
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CLIENT";
      }
      return session;
    },
  },
});