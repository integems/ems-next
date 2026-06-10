import { UpdateWasteDataDto } from "@/dtos/waste.dto";
import { WasteService } from "@/services/waste.service";
import { authenticateRequest, authorizeRoles } from "@/utils/util";
import { RoleName } from "@/types/common.types";
import { NextRequest, NextResponse } from "next/server";

const wasteService = new WasteService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wasteDataId: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const auth = await authenticateRequest(authHeader);

    if (auth.status === "error") {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode },
      );
    }
    if (!auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { wasteDataId } = await params;
    const wasteData = await wasteService.findWasteDataById(wasteDataId);
    return NextResponse.json(wasteData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ wasteDataId: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const auth = await authenticateRequest(authHeader);

    if (auth.status === "error") {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode },
      );
    }
    if (!auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminCheck = authorizeRoles(auth.user, [RoleName.Admin, RoleName.SuperAdmin]);
    if (adminCheck) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.statusCode },
      );
    }

    const { wasteDataId } = await params;
    const wasteDataDto: UpdateWasteDataDto = await request.json();
    const updatedWasteData = await wasteService.updateWasteData(
      wasteDataId,
      wasteDataDto,
      auth.user,
    );
    return NextResponse.json(updatedWasteData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ wasteDataId: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    const auth = await authenticateRequest(authHeader);

    if (auth.status === "error") {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.statusCode },
      );
    }
    if (!auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const adminCheck = authorizeRoles(auth.user, [RoleName.Admin, RoleName.SuperAdmin]);
    if (adminCheck) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.statusCode },
      );
    }

    const { wasteDataId } = await params;
    await wasteService.deleteWasteData(wasteDataId, auth.user);
    return NextResponse.json({ message: "Waste data deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
