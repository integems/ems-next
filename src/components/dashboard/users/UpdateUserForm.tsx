"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateUserDto, updateUserDto } from "@/dtos/user.dto";
import { User, UserStatus } from "@/types/common.types";
import { FrontendUserService } from "@/frontend-services/user.service";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

interface UpdateUserFormProps {
  onClose: () => void;
  user: User;
}

const userService = new FrontendUserService();

type UpdateUserFormData = z.infer<typeof updateUserDto>;

export default function UpdateUserForm({ onClose, user }: UpdateUserFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateUserFormData>({});
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateUserFormData | "server", string | string[]>>
  >({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName || undefined,
        phoneNumber: user.phoneNumber || undefined,
        gender: user.gender || undefined,
        status: user.status,
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (userData: UpdateUserDto) => {
      const token = currentUser?.token;
      if (!token) {
        throw new Error("User not authenticated");
      }
      return userService.updateUser(token, user.userId, userData);
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (error: any) => {
      setErrors({ server: "Failed to update user" });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const result = updateUserDto.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }
    mutation.mutate(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.server && <p className="text-sm text-red-500">{errors.server}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
          />
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName[0]}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          onValueChange={(value) => handleSelectChange("status", value)}
          value={formData.status || ""}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-xs text-red-500">
            {Array.isArray(errors.status) ? errors.status[0] : errors.status}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
