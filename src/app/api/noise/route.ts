import { NextRequest, NextResponse } from "next/server";
import { NoiseService } from "@/services/noise.service";
import {
  CreateNoiseDataDto,
  NoiseDataFilterDto,
  noiseDataFilterDto,
} from "@/dtos/noise.dto";
import { CurrentUser } from "@/types/common.types";
import { authenticateRequest } from "@/utils/util";

const noiseService = new NoiseService();

export async function GET(request: NextRequest) {
  try {
    // const authHeader = request.headers.get("authorization");
    // const auth = await authenticateRequest(authHeader);

    // if (auth.status === "error") {
    //   return NextResponse.json(
    //     { error: auth.error },
    //     { status: auth.statusCode },
    //   );
    // }
    const { searchParams } = new URL(request.url);
    const filter = noiseDataFilterDto.parse({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      locationIds: searchParams.get("locationIds")?.split(",") || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate") as string)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate") as string)
        : undefined,
      timeOfDay: searchParams.get("timeOfDay") || undefined,
      locationType: searchParams.get("locationType") || undefined,
    });

    const noiseData = await noiseService.findAllNoiseData(filter);
    return NextResponse.json(noiseData);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid filter parameters", errors: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const noiseDataDto: CreateNoiseDataDto = await request.json();
    const newNoiseData = await noiseService.createNoiseData(
      noiseDataDto,
      auth.user,
    );
    return NextResponse.json(newNoiseData, { status: 201 });
  } catch (error: any) {
    // console.log({error})
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
