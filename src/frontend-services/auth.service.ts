import axios from "axios";
import {
  SignUpDto,
  SignInDto,
  VerifyOtpDto,
  ResendOtpDto,
  ForgotPasswordDto,
  NewPasswordDto,
  OAuthDto,
} from "@/dtos/auth.dto";

const API_BASE_URL = "/api/auth";

/**
 * Frontend service for handling authentication-related API calls.
 */
export class FrontendAuthService {
  /**
   * Registers a new user.
   * @param signUpDto - The signup data.
   * @returns The server response.
   */
  async signUp(signUpDto: SignUpDto) {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, signUpDto);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Couldn't sign up. Please try again.",
      );
    }
  }

  /**
   * Authenticates a user.
   * @param signInDto - The signin data.
   * @returns The server response.
   */
  async signIn(signInDto: SignInDto) {
    try {
      const response = await axios.post(`${API_BASE_URL}/signin`, signInDto);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Couldn't sign in. Please try again.",
      );
    }
  }

  /**
   * Authenticates a user.
   * @param OAuthDto - The signin data.
   * @returns The server response.
   */
  async oAuthSignIn(signInDto: OAuthDto) {
    try {
      const response = await axios.post(`${API_BASE_URL}/google`, signInDto);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Couldn't sign in. Please try again.",
      );
    }
  }

  /**
   * Verifies an OTP.
   * @param verifyOtpDto - The OTP verification data.
   * @returns The server response.
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/verify-otp`,
        verifyOtpDto,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Couldn't verify your email. Please try again.",
      );
    }
  }

  /**
   * Resends an OTP.
   * @param resendOtpDto - The resend OTP data.
   * @returns The server response.
   */
  async resendOtp(resendOtpDto: ResendOtpDto) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/resend-otp`,
        resendOtpDto,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Couldn't resend the code. Please try again.",
      );
    }
  }

  /**
   * Initiates the forgot password process.
   * @param forgotPasswordDto - The forgot password data.
   * @returns The server response.
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/forgot-password`,
        forgotPasswordDto,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Couldn't send the reset code. Please try again.",
      );
    }
  }

  /**
   * Resets the user's password.
   * @param newPasswordDto - The new password data.
   * @returns The server response.
   */
  async resetPassword(newPasswordDto: NewPasswordDto) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reset-password`,
        newPasswordDto,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Couldn't reset your password. Please try again.",
      );
    }
  }
}

export const frontendAuthService = new FrontendAuthService();
