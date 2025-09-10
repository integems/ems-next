import { CreateWaterDataDto, waterDataFilterDto } from "@/dtos/water.dto";
import { WaterService } from "@/services/water.service";
import { CurrentUser } from "@/types/common.types";
import { NextRequest, NextResponse } from "next/server";

interface AuthenticatedRequest extends NextRequest {
  user?: CurrentUser;
}

const waterService = new WaterService();

export async function GET(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = waterDataFilterDto.parse({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      locationId: searchParams.get("locationId") || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate") as string) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate") as string) : undefined,
      timeOfDay: searchParams.get("timeOfDay") || undefined,
      locationType: searchParams.get("locationType") || undefined,
      waterSource: searchParams.get("waterSource") || undefined,
    });

    const waterData = await waterService.findAllWaterData(filter);
    return NextResponse.json(waterData);
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

export async function POST(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const waterDataDto: CreateWaterDataDto = await request.json();
    const newWaterData = await waterService.createWaterData(
      waterDataDto,
      request.user,
    );
    return NextResponse.json(newWaterData, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
