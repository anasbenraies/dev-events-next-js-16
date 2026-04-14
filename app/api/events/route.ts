import  Event  from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
    // Handle GET request for events
    return NextResponse.json({ message: "Events retrieved successfully" });
}

export async function POST(request: NextRequest, response: NextResponse) {
    // Handle POST request for creating events
    try {
        await connectDB(); // Ensure database connection is established
        // take data from request and save it to the database using your Event model

        const formData = await request.formData();
        let event;
        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: "Invalid form data", error: e instanceof Error ? e.message : "Unknown error" }, { status: 400 });
        }
        const newEvent = await Event.create(event);
        return NextResponse.json({ event: newEvent, message: "Event created successfully" }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ message: "Error creating event", error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
    }
}