"use client";
import { z } from "zod";
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
import { createUserDto } from "@/dtos/user.dto";
import { RoleName } from "@/types/common.types";
import { FrontendUserService } from "@/frontend-services/user.service";
import { useEffect, useState } from "react";
import { RoleService } from "@/frontend-services/role.service";
import { Role } from "@/types/common.types";

const userService = new FrontendUserService();
const roleService = new RoleService();

type CreateUserFormValues = z.infer<typeof createUserDto>;

const CreateUserPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  return (
    <div>
      <h1>User form</h1>
    </div>
  );
};

export default CreateUserPage;
