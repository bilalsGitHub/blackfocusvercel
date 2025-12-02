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
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("ended_at", { ascending: false });

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
      .from("sessions")
      .insert({
        user_id: user.id,
        mode: body.mode,
        duration_seconds: body.duration,
        started_at: body.startedAt || new Date().toISOString(),
        ended_at: body.completedAt || new Date().toISOString(),
        is_completed: body.wasCompleted !== undefined ? body.wasCompleted : true,
        was_interrupted: !body.wasCompleted,
        task_id: body.taskId || null,
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

