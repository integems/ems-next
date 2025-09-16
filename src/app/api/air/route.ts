import { airDataFilterDto, CreateAirDataDto } from "@/dtos/air.dto";
import { AirService } from "@/services/air.service";
import { authenticateRequest } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

const airService = new AirService();

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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const  locationIds =  searchParams.get("locationIds")?.split(",") || undefined;
    const search = searchParams.get("search");
    const timeOfDay = searchParams.get("timeOfDay");
    const locationType = searchParams.get("locationType");

    const filter = airDataFilterDto.parse({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: search || undefined,
      locationIds: locationIds || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      timeOfDay: timeOfDay || undefined,
      locationType: locationType || undefined,
    });

    console.log({filter})

    const airData = await airService.findAllAirData(filter);
    return NextResponse.json(airData);
  } catch (error: any) {
    console.error(error)
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Invalid filter parameters",
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: error.message || "An internal server error occurred",
        error:
          process.env.NODE_ENV === "development" ? error.toString() : undefined,
      },
      { status: 500 },
    );
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
    const airDataDto: CreateAirDataDto = await request.json();
    const newAirData = await airService.createAirData(airDataDto, auth.user);
    return NextResponse.json(newAirData, { status: 201 });
  } catch (error: any) {
    // console.log({error})
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
