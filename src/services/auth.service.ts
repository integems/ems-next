import { db } from "@/database/client";
import * as schema from "@/database/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  SignUpDto,
  SignInDto,
  VerifyOtpDto,
  ResendOtpDto,
  NewPasswordDto,
  ForgotPasswordDto,
  OAuthDto,
} from "@/dtos/auth.dto";
import { sign } from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { customAlphabet } from "nanoid";

import { MailService } from "./mail.service";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { config } from "@/config/config";
import { CurrentUser, RoleName, UserStatus } from "@/types/common.types";

// Custom ID generator for lowercase alphanumeric IDs with 'int' prefix, total 25 characters
const generateId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);

// Generate a secure random password for OAuth users
const generateRandomPassword = () => {
  return customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*",
    12,
  )();
};

/**
 * Service for handling authentication-related operations.
 */
export class AuthService {
  mailService: MailService;
  private db: NodePgDatabase<typeof schema>;

  constructor() {
    this.mailService = new MailService(db);
    this.db = db;
  }

  /**
   * Checks for conflicts in user email or phone number.
   * @param params User data to check.
   */
  async checkUserConflicts(params: { email?: string; phoneNumber?: string }) {
    const { email, phoneNumber } = params;

    if (email) {
      const existingEmail = await this.db.query.users.findFirst({
        where: eq(schema.users.email, email),
      });
      if (existingEmail) {
        throw new Error("An account with this email already exists");
      }
    }

    if (phoneNumber) {
      const existingPhone = await this.db.query.users.findFirst({
        where: eq(schema.users.phoneNumber, phoneNumber),
      });
      if (existingPhone) {
        throw new Error("An account with this phone number already exists");
      }
    }
  }

  /**
   * Removes password from user object for security.
   * @param user User object with optional password.
   * @returns User object without password.
   */
  private excludePassword<T extends { password?: string }>(
    user: T,
  ): Omit<T, "password"> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Generates a secure 6-digit OTP.
   * @returns OTP string.
   */
  private generateOtp(): string {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }

  /**
   * Registers a new user and sends verification OTP.
   * @param signUpDto Signup data.
   * @returns Registered user data and message.
   */
  async signUp(signUpDto: SignUpDto) {
    try {
      return await this.db.transaction(async (tx) => {
        await this.checkUserConflicts({
          email: signUpDto.email,
          phoneNumber: signUpDto.phoneNumber,
        });

        const userId = `int${generateId()}`;
        const userAuthId = `int${generateId()}`;
        const userRoleId = `int${generateId()}`;
        const roleId = `int${generateId()}`;
        const now = new Date();
        const createdBy = signUpDto.fullName || signUpDto.email;

        // Hash password
        const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
        const fullName = signUpDto.fullName || signUpDto.email;

        const status =
          signUpDto.status === UserStatus.All
            ? UserStatus.Active
            : signUpDto.status;
        // Insert user
        const [user] = await tx
          .insert(schema.users)
          .values({
            userId,
            firstName: signUpDto.firstName,
            lastName: signUpDto.lastName,
            fullName: fullName,
            middleName: signUpDto.middleName,
            phoneNumber: signUpDto.phoneNumber,
            email: signUpDto.email,
            password: hashedPassword,
            status: status || UserStatus.Active,
            verified: false,
            gender: signUpDto.gender,
            createdBy,
            createdAt: now,
            updatedBy: createdBy,
            updatedAt: now,
          })
          .returning();

        // Insert user_auths
        const otp = this.generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await tx.insert(schema.userAuths).values({
          userAuthId,
          userId,
          otp,
          otpExpiry,
          createdBy,
          createdAt: now,
          updatedBy: createdBy,
          updatedAt: now,
        });

        // Find or create Authenticated role
        let authenticatedRole = await tx.query.roles.findFirst({
          where: eq(schema.roles.roleName, RoleName.Authenticated),
        });
        if (!authenticatedRole) {
          [authenticatedRole] = await tx
            .insert(schema.roles)
            .values({
              roleId,
              roleName: RoleName.Authenticated,
              createdBy: "System",
              createdAt: now,
              updatedBy: "System",
              updatedAt: now,
            })
            .returning();
        }

        // Insert user_roles
        await tx.insert(schema.userRoles).values({
          userRoleId,
          userId,
          roleId: authenticatedRole.roleId,
          createdBy,
          createdAt: now,
          updatedBy: createdBy,
          updatedAt: now,
        });

        // Send OTP
        const context = { senderName: createdBy };
        let message = "";
        if (signUpDto.email) {
          const emailResult = await this.mailService.sendOtp(
            signUpDto.email,
            otp,
            context,
          );
          if (!emailResult.success) {
            throw new Error("Failed to send OTP to email");
          }
          message = `New verification code sent to the email ${signUpDto.email}.`;
        } else {
          throw new Error("No contact method provided for OTP");
        }

        return {
          message,
          data: this.excludePassword(user),
        };
      });
    } catch (error: any) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Authenticates a user and generates JWT token.
   * @param signInDto Signin data.
   * @returns Token and user data.
   */
  async signIn(signInDto: SignInDto) {
    try {
      return await this.db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({
          where: eq(schema.users.email, signInDto.email),
          with: {
            userAuth: true,
            userRole: {
              with: {
                role: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          signInDto.password,
          user.password,
        );
        if (!isPasswordValid) {
          throw new Error("Password is incorrect");
        }

        const now = new Date();
        await tx
          .update(schema.userAuths)
          .set({
            lastLoginAt: now,
            updatedBy: user.fullName || user.email,
            updatedAt: now,
          })
          .where(eq(schema.userAuths.userId, user.userId));

        const payload: CurrentUser = {
          userId: user.userId,
          email: user.email,
          isAuthenticated: true,
          role:
            (user.userRole?.role?.roleName as RoleName) ||
            RoleName.Authenticated,
          fullName: user.fullName,
          image: user.profileImage || "",
        };

        return {
          token: sign(payload, config.getEnv("JWT_SECRET") as string),
          message: "Sign-in successful",
          user: this.excludePassword(user),
        };
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Verifies OTP and generates JWT token.
   * @param verifyOtpDto OTP verification data.
   * @returns Token and user data.
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({
          where: eq(schema.users.email, verifyOtpDto.email),
          with: {
            userAuth: true,
            userRole: {
              with: {
                role: true,
              },
            },
          },
        });

        if (!user || !user.userAuth?.otp) {
          throw new Error("Invalid OTP request");
        }

        if (user.userAuth.otp !== verifyOtpDto.otp) {
          throw new Error("Invalid OTP");
        }

        if (user.userAuth.otpExpiry) {
          const expiryDate = new Date(user.userAuth.otpExpiry);
          const now = new Date();
          if (now.getTime() > expiryDate.getTime()) {
            throw new Error("OTP has expired");
          }
        }

        const now = new Date();
        await tx
          .update(schema.userAuths)
          .set({
            otp: null,
            otpExpiry: null,
            updatedBy: user.fullName || user.email,
            updatedAt: now,
          })
          .where(eq(schema.userAuths.userId, user.userId));

        const [newUser] = await tx
          .update(schema.users)
          .set({
            verified: true,
            updatedBy: user.fullName || user.email,
            updatedAt: now,
          })
          .where(eq(schema.users.userId, user.userId))
          .returning();

        const payload: CurrentUser = {
          userId: newUser.userId,
          email: newUser.email,
          isAuthenticated: true,
          role:
            (user.userRole?.role?.roleName as RoleName) ||
            RoleName.Authenticated,
          fullName: newUser.fullName,
          image: newUser.profileImage || "",
        };

        return {
          token: sign(payload, config.getEnv("JWT_SECRET") as string),
          message: `Successfully verified email ${newUser.email}`,
          user: this.excludePassword(newUser),
        };
      });
    } catch (error: any) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Resends OTP for verification.
   * @param resendOtp Resend OTP data.
   * @returns Message indicating OTP sent.
   */
  async resendOtp(resendOtp: ResendOtpDto) {
    try {
      return await this.db.transaction(async (tx) => {
        const { email } = resendOtp;
        const user = await tx.query.users.findFirst({
          where: eq(schema.users.email, email),
          with: { userAuth: true },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const otp = this.generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await tx
          .update(schema.userAuths)
          .set({
            otp,
            otpExpiry,
            updatedBy: user.fullName || user.email,
            updatedAt: new Date(),
          })
          .where(eq(schema.userAuths.userId, user.userId));

        const context = {
          senderName: user.fullName || user.email,
        };
        let message = "";
        if (email) {
          const emailResult = await this.mailService.sendOtp(
            email,
            otp,
            context,
          );
          if (!emailResult.success) {
            throw new Error("Failed to send OTP to email");
          }
          message = `New verification code sent to the email ${email}.`;
        } else {
          throw new Error("No contact method provided for OTP resend");
        }

        return { message };
      });
    } catch (error: any) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Initiates password reset by sending OTP.
   * @param resetPasswordDto Reset password data.
   * @returns Message indicating OTP sent.
   */
  async forgotPassword(resetPasswordDto: ForgotPasswordDto) {
    try {
      return await this.db.transaction(async (tx) => {
        const { email } = resetPasswordDto;
        const user = await tx.query.users.findFirst({
          where: eq(schema.users.email, email),
          with: { userAuth: true },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const otp = this.generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await tx
          .update(schema.userAuths)
          .set({
            otp,
            otpExpiry,
            updatedBy: user.fullName || user.email,
            updatedAt: new Date(),
          })
          .where(eq(schema.userAuths.userId, user.userId));

        const context = {
          senderName: user.fullName || user.email,
        };
        let message = "";
        if (email) {
          const emailResult = await this.mailService.sendOtp(
            email,
            otp,
            context,
          );
          if (!emailResult.success) {
            throw new Error("Failed to send OTP to email");
          }
          message = `New verification code sent to the email ${email}.`;
        } else {
          throw new Error("No contact method provided for OTP resend");
        }

        return { message };
      });
    } catch (error: any) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Resets user password after OTP verification.
   * @param newPasswordDto New password data.
   * @returns Success message.
   */
  async resetPassword(newPasswordDto: NewPasswordDto) {
    try {
      return await this.db.transaction(async (tx) => {
        const { email, otp, newPassword } = newPasswordDto;
        const user = await tx.query.users.findFirst({
          where: eq(schema.users.email, email),
          with: { userAuth: true },
        });

        const now = new Date();
        if (
          !user ||
          !user.userAuth?.otp ||
          user.userAuth.otp !== otp ||
          !user.userAuth.otpExpiry ||
          user.userAuth.otpExpiry < now
        ) {
          throw new Error("Invalid or expired OTP");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await tx
          .update(schema.userAuths)
          .set({
            otp: null,
            otpExpiry: null,
            updatedBy: user.fullName || user.email,
            updatedAt: now,
          })
          .where(eq(schema.userAuths.userId, user.userId));

        await tx
          .update(schema.users)
          .set({
            password: hashedPassword,
            updatedBy: user.fullName || user.email,
            updatedAt: now,
          })
          .where(eq(schema.users.userId, user.userId));

        return { message: "Password reset successful" };
      });
    } catch (error: any) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Handles Google OAuth callback for user authentication or registration.
   * @param userData OAuth user data from Google.
   * @returns Token and redirect URL.
   */
  async googleOAuthCallback(userData: OAuthDto) {
    try {
      return await this.db.transaction(async (tx) => {
        if (!userData.email) {
          throw new Error("Email is required from Google OAuth provider");
        }
        const {
          email,
          fullName,
          firstName,
          lastName,
          middleName,
          profileImage,
        } = userData;

        const existingUser = await tx.query.users.findFirst({
          where: eq(schema.users.email, email),
          with: {
            userAuth: true,
            userRole: {
              with: { role: true },
            },
          },
        });

        if (existingUser) {
          const now = new Date();
          await tx
            .update(schema.userAuths)
            .set({
              lastLoginAt: now,
              updatedBy: existingUser.fullName || existingUser.email,
              updatedAt: now,
            })
            .where(eq(schema.userAuths.userId, existingUser.userId));

          const payload: CurrentUser = {
            userId: existingUser.userId,
            email: existingUser.email,
            isAuthenticated: true,
            role:
              (existingUser.userRole?.role?.roleName as RoleName) ||
              RoleName.Authenticated,
            fullName: existingUser.fullName,
            image: existingUser.profileImage || "",
          };

          const token = sign(payload, config.getEnv("JWT_SECRET") as string);
          const redirectUrl = `/signin?token=${encodeURIComponent(token)}`;

          return { token, redirectUrl };
        }

        const userId = `int${generateId()}`;
        const userAuthId = `int${generateId()}`;
        const userRoleId = `int${generateId()}`;
        const roleId = `int${generateId()}`;
        const now = new Date();
        const createdBy = fullName || email;
        const password = generateRandomPassword();

        // Insert user
        const [user] = await tx
          .insert(schema.users)
          .values({
            userId,
            email,
            fullName: fullName || email,
            firstName: firstName || "",
            lastName: lastName || "",
            middleName,
            profileImage,
            password: await bcrypt.hash(password, 10),
            verified: true,
            status: UserStatus.Active,
            createdBy,
            createdAt: now,
            updatedBy: createdBy,
            updatedAt: now,
          })
          .returning();

        // Insert user_auths
        await tx.insert(schema.userAuths).values({
          userAuthId,
          userId,
          lastLoginAt: now,
          createdBy,
          createdAt: now,
          updatedBy: createdBy,
          updatedAt: now,
        });

        // Find or create Authenticated role
        let authenticatedRole = await tx.query.roles.findFirst({
          where: eq(schema.roles.roleName, RoleName.Authenticated),
        });
        if (!authenticatedRole) {
          [authenticatedRole] = await tx
            .insert(schema.roles)
            .values({
              roleId,
              roleName: RoleName.Authenticated,
              createdBy: "System",
              createdAt: now,
              updatedBy: "System",
              updatedAt: now,
            })
            .returning();
        }

        // Insert user_roles
        await tx.insert(schema.userRoles).values({
          userRoleId,
          userId,
          roleId: authenticatedRole.roleId,
          createdBy,
          createdAt: now,
          updatedBy: createdBy,
          updatedAt: now,
        });

        // Send credentials email
        const credentialsResult = await this.mailService.sendCredentialsEmail(
          user.email,
          { email: user.email, password },
          { senderName: createdBy },
        );
        if (!credentialsResult.success) {
          // console.warn(
          //   `Failed to send credentials email: ${credentialsResult.message}`,
          // );
        }

        const payload: CurrentUser = {
          userId: user.userId,
          email: user.email,
          isAuthenticated: true,
          role: RoleName.Authenticated,
          fullName: user.fullName,
          image: user.profileImage || "",
        };

        const token = sign(payload, config.getEnv("JWT_SECRET") as string);
        const redirectUrl = `/signin?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}&firstTime=true`;

        return { token, redirectUrl };
      });
    } catch (error: any) {
      throw new Error(`Error in googleOAuthCallback: ${error?.message}`);
    }
  }
}
