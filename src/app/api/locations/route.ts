import { CreateLocationDto, locationFilterDto } from "@/dtos/location.dto";
import { LocationService } from "@/services/location.service";
import { Category } from "@/types/common.types";
import { authenticateRequest } from "@/utils/util";
import { NextRequest, NextResponse } from "next/server";

const locationService = new LocationService();

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
    const filter = locationFilterDto.parse({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
    });
    const locations = await locationService.findAllLocations(filter);
    return NextResponse.json(locations);
  } catch (error: any) {
    // console.error(error);
    // Zod errors will have a 'name' property of 'ZodError'
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
    const locationDto: CreateLocationDto = await request.json();
    const newLocation = await locationService.createLocation(
      locationDto,
      auth.user,
    );
    return NextResponse.json(newLocation, { status: 201 });
  } catch (error: any) {
    console.log({ error });
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
