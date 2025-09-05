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
import { WaterData } from "@/types/common.types";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { FrontendWaterService } from "@/frontend-services/water.service";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import UpdateWaterDataForm from "./UpdateWaterDataForm";

interface WaterDataTableRowProps {
  data: WaterData;
}

const waterService = new FrontendWaterService();

const WaterDataTableRow: React.FC<WaterDataTableRowProps> = ({ data }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deleteWaterDataMutation = useMutation({
    mutationFn: async (waterDataId: string) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      await waterService.deleteWaterData(currentUser.token, waterDataId);
    },
    onSuccess: () => {
      toast.success("Water data deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["water-data"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error("Failed to delete water data");
    },
  });

  const handleDelete = () => {
    deleteWaterDataMutation.mutate(data.waterDataId);
  };

  return (
    <>
      <TableRow>
        <TableCell>{data.location?.name}</TableCell>
        <TableCell>{data.ph}</TableCell>
        <TableCell>{data.temperature}</TableCell>
        <TableCell>{data.turbidity}</TableCell>
        <TableCell>{data.dissolvedOxygen}</TableCell>
        <TableCell>{data.bod}</TableCell>
        <TableCell>{data.cod}</TableCell>
        <TableCell>{data.totalDissolvedSolids}</TableCell>
        <TableCell>{data.conductivity}</TableCell>
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
              This action cannot be undone. This will permanently delete the water
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
              disabled={deleteWaterDataMutation.isPending}
            >
              {deleteWaterDataMutation.isPending && (
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
            <DialogTitle>Edit Water Data</DialogTitle>
          </DialogHeader>
          <UpdateWaterDataForm data={data} onClose={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WaterDataTableRow;
