"use client";

import { useState } from "react";
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
import { CreateUserDto, createUserDto } from "@/dtos/user.dto";
import { RoleName } from "@/types/common.types";
import { FrontendUserService } from "@/frontend-services/user.service";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";
import { z } from "zod";

interface CreateUserFormProps {
  onClose: () => void;
  roles: { roleId: string; roleName: RoleName }[];
}

const userService = new FrontendUserService();

type CreateUserFormData = z.infer<typeof createUserDto>;

export default function CreateUserForm({
  onClose,
  roles,
}: CreateUserFormProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateUserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleName: RoleName.Authenticated,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserFormData | "server", string | string[]>>
  >({});

  const mutation = useMutation({
    mutationFn: (userData: CreateUserDto) => {
      const token = currentUser?.token;
      if (!token) {
        throw new Error("User not authenticated");
      }
      return userService.createUser(token, userData);
    },
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (error: any) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 409) {
        setErrors({ server: message || "Email already exists" });
      } else if (status === 400 && message) {
        // Validation errors from the server are safe to show.
        setErrors({ server: message });
      } else {
        setErrors({ server: "Couldn't create user. Please try again." });
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, roleName: value as RoleName }));
    setErrors((prev) => ({ ...prev, roleName: undefined, server: undefined }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const result = createUserDto.safeParse(formData);
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
            value={formData.firstName}
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
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName[0]}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="roleName">Role</Label>
        <Select onValueChange={handleSelectChange} value={formData.roleName}>
          <SelectTrigger id="roleName">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.roleId} value={role.roleName}>
                {role.roleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.roleName && (
          <p className="text-xs text-red-500">{errors.roleName[0]}</p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create User
        </Button>
      </div>
    </form>
  );
}
