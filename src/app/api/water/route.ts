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
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      locationId: searchParams.get("locationId"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
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
