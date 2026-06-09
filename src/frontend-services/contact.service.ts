import axios from "axios";
import { ContactDto } from "@/dtos/contact.dto";

/**
 * Frontend service for the contact form.
 */
export class FrontendContactService {
  async sendContact(dto: ContactDto) {
    try {
      const response = await axios.post("/api/contact", dto);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "An error occurred while sending your message.",
      );
    }
  }
}

export const frontendContactService = new FrontendContactService();
