"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordValidatorProps {
  password?: string;
  confirmPassword?: string;
}

export const PasswordValidator: React.FC<PasswordValidatorProps> = ({
  password = "",
  confirmPassword = "",
}) => {
  const validations = [
    { rule: /.{8,}/, message: "Minimum 8 characters" },
    { rule: /[A-Z]/, message: "At least one uppercase letter" },
    { rule: /[a-z]/, message: "At least one lowercase letter" },
    { rule: /[0-9]/, message: "At least one number" },
  ];

  const passwordMatch = password === confirmPassword && confirmPassword !== "";

  return (
    <div className="mt-2 mb-2">
      {validations.map((validation, index) => (
        <div key={index} className="flex items-center mb-1">
          {validation.rule.test(password) ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-primary opacity-45" />
          )}
          <span className="ml-2 text-sm">{validation.message}</span>
        </div>
      ))}
      <div className="flex items-center mb-1">
        {passwordMatch ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-primary opacity-45" />
        )}
        <span className="ml-2 text-sm">Passwords match</span>
      </div>
    </div>
  );
};
