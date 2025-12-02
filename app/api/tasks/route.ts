import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase-route-handler";

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("order_index", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: body.title,
        description: body.description,
        estimated_pomodoros: body.estimatedPomodoros || 1,
        completed_pomodoros: body.completedPomodoros || 0,
        priority: body.priority || "medium",
        scheduled_date: body.scheduledDate,
        is_completed: body.isCompleted || false,
        is_chrono_log: body.isChronoLog || false,
        chrono_duration_seconds: body.chronoDurationSeconds || 0,
        order_index: body.order || 0,
        completed_at: body.completedAt || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

