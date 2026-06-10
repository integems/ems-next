import { UpdateSoilDataDto } from "@/dtos/soil.dto";
import { SoilService } from "@/services/soil.service";
import { authenticateRequest, authorizeRoles } from "@/utils/util";
import { RoleName } from "@/types/common.types";
import { NextRequest, NextResponse } from "next/server";

const soilService = new SoilService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ soilDataId: string }> },
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
    const { soilDataId } = await params;
    const soilData = await soilService.findSoilDataById(soilDataId);
    return NextResponse.json(soilData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ soilDataId: string }> },
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

    const { soilDataId } = await params;
    const soilDataDto: UpdateSoilDataDto = await request.json();
    const updatedSoilData = await soilService.updateSoilData(
      soilDataId,
      soilDataDto,
      auth.user,
    );
    return NextResponse.json(updatedSoilData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ soilDataId: string }> },
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

    const { soilDataId } = await params;
    await soilService.deleteSoilData(soilDataId, auth.user);
    return NextResponse.json({ message: "Soil data deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
