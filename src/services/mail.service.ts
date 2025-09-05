import { createTransport } from "nodemailer";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/database/drizzle/schema";
import { customAlphabet } from "nanoid";
import { config } from "../config/config";

const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);

export class MailService {
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
        secure: emailSettings.emailSmtpTlsPort ? false : true,
        auth: {
          user: emailSettings.emailSmtpUsername,
          pass: emailSettings.emailSmtpPassword,
        },
      });

      const messageData = {
        from: emailSettings.emailSmtpUsername,
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
        secure: emailSettings.emailSmtpTlsPort ? false : true,
        auth: {
          user: emailSettings.emailSmtpUsername,
          pass: emailSettings.emailSmtpPassword,
        },
      });

      const messageData = {
        from: emailSettings.emailSmtpUsername,
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
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .otp-container {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 5px;
            margin: 20px 0;
          }
          .expiry-text {
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-header">
            <h1>${title}</h1>
          </div>
          <div class="email-body">
            <div class="otp-container">
              <div class="otp-code">${otp}</div>
              <p class="expiry-text">This code will expire in 10 minutes</p>
            </div>
          </div>
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
  private getCredentialsTemplate(email: string, password: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: #f4f4f4;
          }
          .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 30px;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
          }
          .header img {
            max-width: 150px;
          }
          .content {
            padding: 20px 0;
            color: #333333;
          }
          .credential-box {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
          }
          .credential-label {
            font-weight: bold;
            color: #555555;
            margin-bottom: 5px;
          }
          .credential-value {
            font-size: 16px;
            color: #007bff;
            word-break: break-all;
          }
          .warning {
            color: #dc3545;
            font-size: 14px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="header">
              <h1>Your Account Credentials</h1>
            </div>
            <div class="content">
              <p>Dear User,</p>
              <p>Your account has been successfully created. Below are your login credentials. Please keep this information secure and do not share it with anyone.</p>
              <div class="credential-box">
                <div class="credential-label">Email:</div>
                <div class="credential-value">${email}</div>
              </div>
              <div class="credential-box">
                <div class="credential-label">Password:</div>
                <div class="credential-value">${password}</div>
              </div>
              <p class="warning">For security reasons, we recommend changing your password after your first login.</p>
              <a href="${config.getEnv("SIGNIN_REDIRECT_URL")}" class="button">Login to Your Account</a>
            </div>
            <div class="footer">
              <p>If you did not request this email, please contact our support team immediately.</p>
            </div>
          </div>
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
        secure: emailSettings.emailSmtpTlsPort ? false : true,
        auth: {
          user: emailSettings.emailSmtpUsername,
          pass: emailSettings.emailSmtpPassword,
        },
      });

      const messageData = {
        from: emailSettings.emailSmtpUsername,
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
        secure: !emailSettings.emailSmtpTlsPort,
        auth: {
          user: emailSettings.emailSmtpUsername,
          pass: emailSettings.emailSmtpPassword,
        },
      });

      const results = await Promise.all(
        messages.map(async (msg) => {
          try {
            const messageData = {
              from: emailSettings.emailSmtpUsername,
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
