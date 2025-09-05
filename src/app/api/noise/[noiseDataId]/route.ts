import { UpdateNoiseDataDto } from "@/dtos/noise.dto";
import { NoiseService } from "@/services/noise.service";
import { authenticateRequest } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

const noiseService = new NoiseService();

export async function GET(
  request: NextRequest,
  { params }: { params: { noiseDataId: string } },
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
    const { noiseDataId } = params;
    const noiseData = await noiseService.findNoiseDataById(noiseDataId);
    return NextResponse.json(noiseData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { noiseDataId: string } },
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

    const { noiseDataId } = params;
    const noiseDataDto: UpdateNoiseDataDto = await request.json();
    const updatedNoiseData = await noiseService.updateNoiseData(
      noiseDataId,
      noiseDataDto,
      auth.user,
    );
    return NextResponse.json(updatedNoiseData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { noiseDataId: string } },
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

    const { noiseDataId } = params;
    await noiseService.deleteNoiseData(noiseDataId, auth.user);
    return NextResponse.json({ message: "Noise data deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
