import { CreateWasteDataDto, wasteDataFilterDto } from "@/dtos/waste.dto";
import { WasteService } from "@/services/waste.service";
import { authenticateRequest } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

const wasteService = new WasteService();

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
    // if (!auth.user) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }
    const { searchParams } = new URL(request.url);
    const filter = wasteDataFilterDto.parse({
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

    const wasteData = await wasteService.findAllWasteData(filter);
    return NextResponse.json(wasteData);
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

    const wasteDataDto: CreateWasteDataDto = await request.json();
    const newWasteData = await wasteService.createWasteData(
      wasteDataDto,
      auth.user,
    );
    return NextResponse.json(newWasteData, { status: 201 });
  } catch (error: any) {
    // console.log({error})
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
