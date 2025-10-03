import {
  biodiversityDataFilterDto,
  CreateBiodiversityDataDto,
} from "@/dtos/biodiversity.dto";
import { BiodiversityService } from "@/services/biodiversity.service";
import { authenticateRequest } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

const biodiversityService = new BiodiversityService();

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
    const filter = biodiversityDataFilterDto.parse({
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

    const biodiversityData =
      await biodiversityService.findAllBiodiversityData(filter);
    return NextResponse.json(biodiversityData);
  } catch (error: any) {
    // console.log(error)
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

    const biodiversityDataDto: CreateBiodiversityDataDto = await request.json();
    const newBiodiversityData =
      await biodiversityService.createBiodiversityData(
        biodiversityDataDto,
        auth.user,
      );
    return NextResponse.json(newBiodiversityData, { status: 201 });
  } catch (error: any) {
    // console.log({ error });
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
