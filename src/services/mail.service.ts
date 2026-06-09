import { createTransport } from "nodemailer";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/database/drizzle/schema";
import { customAlphabet } from "nanoid";
import { config } from "../config/config";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);

export class MailService {
  /** Brand color — dark green, matching the app's light-theme primary. */
  private static readonly BRAND_COLOR = "#0b6b34";

  /** Display name shown as the email sender. */
  private static readonly SENDER_NAME = "Integems Limited";

  private readonly defaultEmailSettings = {
    emailSmtpServer: config.getEnv("SMTP_HOST") as string,
    emailSmtpEmail: config.getEnv("SMTP_FROM") as string,
    emailSmtpUsername: config.getEnv("SMTP_USER") as string,
    emailSmtpPassword: config.getEnv("SMTP_PASS") as string,
    emailSmtpSslPort: config.getEnv("SMTP_PORT") as string,
    emailSmtpTlsPort: config.getEnv("SMTP_PORT") as string,
    emailSmtpIsSsl: true,
    emailSmtpIsTls: true,
    emailSmtpAuthentication: true,
    isDefault: true,
  };

  constructor(private db: NodePgDatabase<typeof schema>) {}

  private paginateResponse<T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number,
  ) {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      metadata: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Sends an OTP email using default settings.
   * @param email Recipient email.
   * @param otp One-time password.
   * @param context Optional logging context.
   */
  async sendOtp(
    email: string,
    otp: string,
    context?: {
      senderName?: string;
      sendUserId?: string;
      recipientUserId?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const emailSettings = this.defaultEmailSettings;

      const transporter = createTransport({
        host: emailSettings.emailSmtpServer,
        port: Number(
          emailSettings.emailSmtpTlsPort || emailSettings.emailSmtpSslPort,
        ),
        secure: Number(emailSettings.emailSmtpSslPort) === 465,
        auth: {
          user: emailSettings.emailSmtpUsername,
          pass: emailSettings.emailSmtpPassword,
        },
      });

      const messageData = {
        from: `${MailService.SENDER_NAME} <${emailSettings.emailSmtpUsername}>`,
        to: email,
        subject: "Your verification code",
        html: this.getOtpTemplate("Verify Your Account", otp),
      };

      const info = await transporter.sendMail(messageData);

      if (!info || !info.messageId) {
        return {
          success: false,
          message: "Failed to send email OTP: No message ID received",
        };
      }

      return { success: true, message: "OTP email sent successfully" };
    } catch (error) {
      // this.logger.log(error)
      return {
        success: false,
        message: `Failed to send OTP email: ${error}`,
      };
    }
  }

  /**
   * Sends a verification email with OTP.
   * @param email Recipient email.
   * @param otp One-time password.
   * @param context Logging context.
   */
  async sendVerificationEmail(
    email: string,
    otp: string,
    context: {
      senderName: string;
      sendUserId?: string;
      recipientUserId?: string;
    },
  ) {
    return this.sendOtp(email, otp, context);
  }

  /**
   * Sends a password reset email with OTP.
   * @param email Recipient email.
   * @param otp One-time password.
   * @param context Logging context.
   */
  async sendPasswordResetEmail(
    email: string,
    otp: string,
    context: {
      senderName: string;
      sendUserId?: string;
      recipientUserId?: string;
    },
  ) {
    return this.sendOtp(email, otp, context);
  }

  /**
   * Sends an email containing user credentials with a styled HTML template.
   * @param to Recipient email.
   * @param credentials User credentials (email and password).
   * @param context Logging context.
   */
  async sendCredentialsEmail(
    to: string,
    credentials: { email: string; password: string },
    context: {
      senderName: string;
      sendUserId?: string;
      recipientUserId?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    const subject = "Your Account Credentials";
    const html = this.getCredentialsTemplate(
      credentials.email,
      credentials.password,
    );
    return this.sendMail(to, subject, html, context);
  }

  /**
   * Sends a contact-form submission to the company inbox.
   * The reply-to is set to the sender so replies go straight to them.
   * @param payload Contact form fields.
   */
  async sendContactEmail(payload: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const emailSettings = this.defaultEmailSettings;
      const to = (config.getEnv("SMTP_FROM") as string) || emailSettings.emailSmtpEmail;

      const transporter = createTransport({
        host: emailSettings.emailSmtpServer,
        port: Number(emailSettings.emailSmtpSslPort),
        secure: Number(emailSettings.emailSmtpSslPort) === 465,
        auth: {
          user: emailSettings.emailSmtpUsername,
          pass: emailSettings.emailSmtpPassword,
        },
      });

      const subject = payload.subject?.trim()
        ? `Contact form: ${payload.subject.trim()}`
        : `New contact message from ${payload.name}`;

      const info = await transporter.sendMail({
        from: `${MailService.SENDER_NAME} <${emailSettings.emailSmtpUsername}>`,
        to,
        replyTo: `${payload.name} <${payload.email}>`,
        subject,
        html: this.getContactTemplate(payload),
      });

      if (!info || !info.messageId) {
        return {
          success: false,
          message: "Failed to send contact message: No message ID received",
        };
      }

      return { success: true, message: "Contact message sent successfully" };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to send contact message: ${error.message}`,
      };
    }
  }

  /**
   * Sends a generic email with provided content.
   * @param to Recipient email.
   * @param subject Email subject.
   * @param html Email HTML content.
   * @param context Logging context.
   * @returns Promise with success status and message.
   */
  private async sendMail(
    to: string,
    subject: string,
    html: string,
    context: {
      senderName: string;
      sendUserId?: string;
      recipientUserId?: string;
      businessId?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const emailSettings = this.defaultEmailSettings;

      const transporter = createTransport({
        host: emailSettings.emailSmtpServer,
        port: Number(
          emailSettings.emailSmtpTlsPort || emailSettings.emailSmtpSslPort,
        ),
        secure: Number(emailSettings.emailSmtpSslPort) === 465,
        auth: {
          user: emailSettings.emailSmtpUsername,
          pass: emailSettings.emailSmtpPassword,
        },
      });

      const messageData = {
        from: `${MailService.SENDER_NAME} <${emailSettings.emailSmtpUsername}>`,
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(messageData);

      if (!info || !info.messageId) {
        return {
          success: false,
          message: "Failed to send email: No message ID received",
        };
      }

      return {
        success: true,
        message: `Email sent successfully: ${info.messageId}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to send email: ${error.message}`,
      };
    }
  }

  /**
   * Generates HTML template for OTP emails.
   * @param title Email title.
   * @param otp One-time password.
   * @returns HTML string.
   */
  private getOtpTemplate(title: string, otp: string): string {
    const brand = MailService.BRAND_COLOR;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#ffffff;">
        <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
          <div style="font-size:24px;font-weight:800;letter-spacing:2px;color:${brand};margin-bottom:20px;">EMS</div>
          <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">${title}</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
            Use the verification code below to continue. This code is valid for 10 minutes.
          </p>
          <div style="font-size:40px;font-weight:700;letter-spacing:10px;color:${brand};margin:0 0 20px;">${otp}</div>
          <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
            If you didn't request this code, you can safely ignore this email.
          </p>
          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
            &copy; ${new Date().getFullYear()} EMS — Environmental Monitoring System
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates HTML template for credentials emails.
   * @param email User email.
   * @param password User password.
   * @returns HTML string.
   */
  /**
   * Generates the HTML template for a contact-form submission.
   */
  private getContactTemplate(payload: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): string {
    const brand = MailService.BRAND_COLOR;
    const safeMessage = (payload.message || "").replace(/\n/g, "<br/>");
    const row = (label: string, value: string) => `
      <div style="margin:0 0 14px;">
        <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-bottom:4px;">${label}</div>
        <div style="font-size:15px;color:#111827;word-break:break-word;">${value}</div>
      </div>`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f0f2f5;">
        <div style="max-width:600px;margin:0 auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <div style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <div style="background-color:${brand};padding:28px 32px;text-align:center;">
              <span style="font-size:28px;font-weight:800;letter-spacing:2px;color:#ffffff;">EMS</span>
            </div>
            <div style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">New contact message</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
                You received a new message through the EMS contact form.
              </p>
              <div style="background-color:#f0f2f5;border:1px solid #e5e7eb;border-radius:10px;padding:20px;">
                ${row("Name", payload.name)}
                ${row("Email", payload.email)}
                ${payload.subject?.trim() ? row("Subject", payload.subject.trim()) : ""}
                ${row("Message", safeMessage)}
              </div>
              <a href="mailto:${payload.email}" style="display:inline-block;margin-top:24px;padding:12px 24px;background-color:${brand};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                Reply to ${payload.name}
              </a>
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin:16px 0 0;">
            &copy; ${new Date().getFullYear()} EMS — Environmental Monitoring System
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private getCredentialsTemplate(email: string, password: string): string {
    const brand = MailService.BRAND_COLOR;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f0f2f5;">
        <div style="max-width:600px;margin:0 auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <div style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <div style="background-color:${brand};padding:28px 32px;text-align:center;">
              <span style="font-size:28px;font-weight:800;letter-spacing:2px;color:#ffffff;">EMS</span>
            </div>
            <div style="padding:32px;color:#374151;">
              <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">Your account credentials</h1>
              <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
                Your account has been created successfully. Below are your login credentials — please keep them secure and do not share them with anyone.
              </p>
              <div style="background-color:#f0f2f5;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin:0 0 12px;">
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-bottom:4px;">Email</div>
                <div style="font-size:16px;color:${brand};word-break:break-all;">${email}</div>
              </div>
              <div style="background-color:#f0f2f5;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
                <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-bottom:4px;">Password</div>
                <div style="font-size:16px;color:${brand};word-break:break-all;">${password}</div>
              </div>
              <p style="margin:0 0 24px;font-size:13px;color:#b45309;line-height:1.6;">
                For your security, we recommend changing your password after your first login.
              </p>
              <a href="${config.getEnv("SIGNIN_REDIRECT_URL")}" style="display:inline-block;padding:12px 24px;background-color:${brand};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
                Log in to your account
              </a>
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#9ca3af;margin:16px 0 0;line-height:1.6;">
            If you did not request this email, please contact our support team immediately.<br/>
            &copy; ${new Date().getFullYear()} EMS — Environmental Monitoring System
          </p>
        </div>
      </body>
      </html>
    `;
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    context?: {
      senderName?: string;
      sendUserId?: string;
      recipientUserId?: string;
    },
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const emailSettings = this.defaultEmailSettings;

      const transporter = createTransport({
        host: emailSettings.emailSmtpServer,
        port: Number(
          emailSettings.emailSmtpTlsPort || emailSettings.emailSmtpSslPort,
        ),
        secure: Number(emailSettings.emailSmtpSslPort) === 465,
        auth: {
          user: emailSettings.emailSmtpUsername,
          pass: emailSettings.emailSmtpPassword,
        },
      });

      const messageData = {
        from: `${MailService.SENDER_NAME} <${emailSettings.emailSmtpUsername}>`,
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(messageData);

      if (!info || !info.messageId) {
        return {
          success: false,
          message: "Failed to send email: No message ID received",
        };
      }
      return {
        success: true,
        message: `Email sent successfully: ${info.messageId}`,
        data: info,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to send email: ${error.message}`,
      };
    }
  }

  async sendBulkEmail(
    messages: Array<{
      to: string;
      subject: string;
      html: string;
    }>,
    context?: {
      senderName?: string;
      sendUserId?: string;
    },
  ): Promise<{ success: boolean; message: string; results?: any[] }> {
    try {
      const emailSettings = this.defaultEmailSettings;

      if (!messages?.length) {
        return {
          success: false,
          message: "No messages provided for bulk send",
        };
      }

      const transporter = createTransport({
        host: emailSettings.emailSmtpServer,
        port: Number(
          emailSettings.emailSmtpTlsPort || emailSettings.emailSmtpSslPort,
        ),
        secure: Number(emailSettings.emailSmtpSslPort) === 465,
        auth: {
          user: emailSettings.emailSmtpUsername,
          pass: emailSettings.emailSmtpPassword,
        },
      });

      const results = await Promise.all(
        messages.map(async (msg) => {
          try {
            const messageData = {
              from: `${MailService.SENDER_NAME} <${emailSettings.emailSmtpUsername}>`,
              ...msg,
            };

            const info = await transporter.sendMail(messageData);

            return {
              success: true,
              to: msg.to,
              messageId: info.messageId,
            };
          } catch (error) {
            return {
              success: false,
              to: msg.to,
              error: error,
            };
          }
        }),
      );

      const successCount = results.filter((r) => r.success).length;

      return {
        success: successCount > 0,
        message: `Successfully sent ${successCount}/${messages.length} emails`,
        results,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send bulk email: ${error}`,
      };
    }
  }
}
