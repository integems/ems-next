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
import { AirData } from "@/types/common.types";
import { MoreHorizontal, Pencil, Trash2, LoaderIcon } from "lucide-react";
import { FrontendAirService } from "@/frontend-services/air.service";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import UpdateAirDataForm from "./UpdateAirDataForm";

interface AirDataTableRowProps {
  data: AirData;
}

const airService = new FrontendAirService();

const AirDataTableRow: React.FC<AirDataTableRowProps> = ({ data }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deleteAirDataMutation = useMutation({
    mutationFn: async (airDataId: string) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      await airService.deleteAirData(currentUser.token, airDataId);
    },
    onSuccess: () => {
      toast.success("Air data deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["air-data"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error("Failed to delete air data");
    },
  });

  const handleDelete = () => {
    deleteAirDataMutation.mutate(data.airDataId);
  };

  return (
    <>
      <TableRow>
        <TableCell>{data.location?.name ?? "N/A"}</TableCell>
        <TableCell>{data.timeOfDay ?? "N/A"}</TableCell>
        <TableCell>{data.locationType ?? "N/A"}</TableCell>
        <TableCell>{data.temperature ?? "N/A"}</TableCell>
        <TableCell>{data.humidity ?? "N/A"}</TableCell>
        <TableCell>
          {data.measurementTime
            ? `${new Date(data.measurementTime).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })} ${new Date(data.measurementTime).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}`
            : "N/A"}
        </TableCell>
        <TableCell>{data.pm25 ?? "N/A"}</TableCell>
        <TableCell>{data.pm10 ?? "N/A"}</TableCell>
        <TableCell>{data.no2 ?? "N/A"}</TableCell>
        <TableCell>{data.o3 ?? "N/A"}</TableCell>
        <TableCell>{data.co ?? "N/A"}</TableCell>
        <TableCell>{data.so2 ?? "N/A"}</TableCell>
        <TableCell className="text-wrap">{data.notes ?? "N/A"}</TableCell>
        <TableCell>
          {data.createdAt
            ? new Date(data.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "N/A"}
        </TableCell>
        <TableCell>
          {data.updatedAt
            ? new Date(data.updatedAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "N/A"}
        </TableCell>
        <TableCell>{data.createdBy ?? "N/A"}</TableCell>
        <TableCell>{data.updatedBy ?? "N/A"}</TableCell>
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
              This action cannot be undone. This will permanently delete the air
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
              disabled={deleteAirDataMutation.isPending}
            >
              {deleteAirDataMutation.isPending && (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="md:min-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Air Data</DialogTitle>
          </DialogHeader>
          <UpdateAirDataForm
            data={data}
            onClose={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AirDataTableRow;
