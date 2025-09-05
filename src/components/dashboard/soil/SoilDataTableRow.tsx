"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { SoilData } from "@/types/common.types";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { FrontendSoilService } from "@/frontend-services/soil.service";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import UpdateSoilDataForm from "./UpdateSoilDataForm";

interface SoilDataTableRowProps {
  data: SoilData;
}

const soilService = new FrontendSoilService();

const SoilDataTableRow: React.FC<SoilDataTableRowProps> = ({ data }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deleteSoilDataMutation = useMutation({
    mutationFn: async (soilDataId: string) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      await soilService.deleteSoilData(currentUser.token, soilDataId);
    },
    onSuccess: () => {
      toast.success("Soil data deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["soil-data"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error("Failed to delete soil data");
    },
  });

  const handleDelete = () => {
    deleteSoilDataMutation.mutate(data.soilDataId);
  };

  return (
    <>
      <TableRow>
        <TableCell>{data.location?.name}</TableCell>
        <TableCell>{data.ph}</TableCell>
        <TableCell>{data.moisture}</TableCell>
        <TableCell>{data.nitrogen}</TableCell>
        <TableCell>{data.phosphorus}</TableCell>
        <TableCell>{data.potassium}</TableCell>
        <TableCell>{data.organicMatter}</TableCell>
        <TableCell>
          {new Date(data.measurementTime).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}{ " "}
          {new Date(data.measurementTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}
        </TableCell>
        <TableCell className="text-wrap">{data.notes}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background border-border"
            >
              <DropdownMenuLabel className="text-foreground">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setIsEditDialogOpen(true)}
                className="text-foreground hover:bg-accent"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the soil
              data record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSoilDataMutation.isPending}
            >
              {deleteSoilDataMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Soil Data</DialogTitle>
          </DialogHeader>
          <UpdateSoilDataForm data={data} onClose={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SoilDataTableRow;
