"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContactDto, ContactDtoSchema } from "@/dtos/contact.dto";
import { frontendContactService } from "@/frontend-services/contact.service";
import { useMutation } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { LoaderIcon, Mail, MapPin, Phone, Send } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const initialForm: ContactDto = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "info@integems.com",
    href: "mailto:info@integems.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+232 79 628526",
    href: "tel:+23279628526",
  },
  {
    icon: MapPin,
    label: "Office",
    value:
      "8H Technical Institute Drive, Off Motor Road, Congo Cross, Freetown",
  },
];

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const [form, setForm] = useState<ContactDto>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactDto, string>>>(
    {},
  );

  const mutation = useMutation({
    mutationFn: (data: ContactDto) => frontendContactService.sendContact(data),
    onSuccess: (data) => {
      toast.success(data?.message || "Thanks for reaching out!");
      setForm(initialForm);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Couldn't send your message.");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = ContactDtoSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        subject: fieldErrors.subject?.[0],
        message: fieldErrors.message?.[0],
      });
      return;
    }
    mutation.mutate(result.data);
  };

  return (
    <section id="contact" ref={ref} className="py-10 md:py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: intro + details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Get in touch
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Contact <span className="text-primary">us</span>
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
              Have a question about environmental monitoring or want to work
              with us? Send a message and our team will get back to you.
            </p>

            <ul className="mt-8 space-y-5">
              {contactDetails.map((detail) => {
                const Icon = detail.icon;
                const content = (
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {detail.label}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {detail.value}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <li key={detail.label}>
                    {detail.href ? (
                      <a
                        href={detail.href}
                        className="transition-opacity hover:opacity-80"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="shadow-xl shadow-black/10 dark:shadow-black/40">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                        aria-invalid={!!errors.name}
                        className="h-11"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        aria-invalid={!!errors.email}
                        className="h-11"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">
                      Subject{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What's this about?"
                      value={form.subject}
                      onChange={handleChange}
                      aria-invalid={!!errors.subject}
                      className="h-11"
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500">{errors.subject}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How can we help?"
                      value={form.message}
                      onChange={handleChange}
                      aria-invalid={!!errors.message}
                      className="min-h-32 resize-y"
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 w-full text-base"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Send message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
