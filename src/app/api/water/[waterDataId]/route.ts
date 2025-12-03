import { UpdateWaterDataDto } from "@/dtos/water.dto";
import { WaterService } from "@/services/water.service";
import { authenticateRequest } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

const waterService = new WaterService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ waterDataId: string }> },
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
    const { waterDataId } = await params;
    const waterData = await waterService.findWaterDataById(waterDataId);
    return NextResponse.json(waterData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ waterDataId: string }> },
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

    const { waterDataId } = await params;
    const waterDataDto: UpdateWaterDataDto = await request.json();
    const updatedWaterData = await waterService.updateWaterData(
      waterDataId,
      waterDataDto,
      auth.user,
    );
    return NextResponse.json(updatedWaterData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ waterDataId: string }> },
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

    const { waterDataId } = await params;
    await waterService.deleteWaterData(waterDataId, auth.user);
    return NextResponse.json({ message: "Water data deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
