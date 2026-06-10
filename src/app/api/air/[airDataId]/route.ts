import { UpdateAirDataDto } from "@/dtos/air.dto";
import { AirService } from "@/services/air.service";
import { authenticateRequest, authorizeRoles } from "@/utils/util";
import { RoleName } from "@/types/common.types";
import { NextRequest, NextResponse } from "next/server";

const airService = new AirService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ airDataId: string }> },
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
    const { airDataId } = await params;
    const airData = await airService.findAirDataById(airDataId);
    return NextResponse.json(airData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ airDataId: string }> },
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

    const { airDataId } = await params;
    const airDataDto: UpdateAirDataDto = await request.json();
    const updatedAirData = await airService.updateAirData(
      airDataId,
      airDataDto,
      auth.user,
    );
    return NextResponse.json(updatedAirData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ airDataId: string }> },
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

    const { airDataId } = await params;
    await airService.deleteAirData(airDataId, auth.user);
    return NextResponse.json({ message: "Air data deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
