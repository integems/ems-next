import { ContactDtoSchema } from "@/dtos/contact.dto";
import { db } from "@/database/client";
import { MailService } from "@/services/mail.service";
import { NextRequest, NextResponse } from "next/server";

const mailService = new MailService(db);

/**
 * Handles the POST request for the contact form.
 * Validates the payload and emails it to the company inbox.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contactDto = ContactDtoSchema.parse(body);

    const result = await mailService.sendContactEmail(contactDto);

    if (!result.success) {
      return NextResponse.json(
        {
          message:
            "We couldn't send your message right now. Please try again shortly.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { message: "Thanks for reaching out! We'll get back to you soon." },
      { status: 200 },
    );
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { message: "Please fill in all fields correctly." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
