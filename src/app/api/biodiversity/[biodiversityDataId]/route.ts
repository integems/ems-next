import { UpdateBiodiversityDataDto } from "@/dtos/biodiversity.dto";
import { BiodiversityService } from "@/services/biodiversity.service";
import { authenticateRequest } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

const biodiversityService = new BiodiversityService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ biodiversityDataId: string }> },
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
    const { biodiversityDataId } = await params;
    const biodiversityData =
      await biodiversityService.findBiodiversityDataById(biodiversityDataId);
    return NextResponse.json(biodiversityData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ biodiversityDataId: string }> },
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

    const { biodiversityDataId } = await params;
    const biodiversityDataDto: UpdateBiodiversityDataDto = await request.json();
    const updatedBiodiversityData =
      await biodiversityService.updateBiodiversityData(
        biodiversityDataId,
        biodiversityDataDto,
        auth.user,
      );
    return NextResponse.json(updatedBiodiversityData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ biodiversityDataId: string }> },
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

    const { biodiversityDataId } = await params;
    await biodiversityService.deleteBiodiversityData(
      biodiversityDataId,
      auth.user,
    );
    return NextResponse.json({
      message: "Biodiversity data deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
