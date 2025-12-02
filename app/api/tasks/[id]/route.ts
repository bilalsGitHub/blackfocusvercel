import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.estimatedPomodoros !== undefined)
      updates.estimated_pomodoros = body.estimatedPomodoros;
    if (body.completedPomodoros !== undefined)
      updates.completed_pomodoros = body.completedPomodoros;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.scheduledDate !== undefined)
      updates.scheduled_date = body.scheduledDate;
    if (body.isCompleted !== undefined) updates.is_completed = body.isCompleted;
    if (body.isChronoLog !== undefined)
      updates.is_chrono_log = body.isChronoLog;
    if (body.chronoDurationSeconds !== undefined)
      updates.chrono_duration_seconds = body.chronoDurationSeconds;
    if (body.order !== undefined) updates.order_index = body.order;
    if (body.completedAt !== undefined) updates.completed_at = body.completedAt;

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🗑️ [API] DELETE task request - ID: ${id}`);

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log(`❌ [API] Unauthorized - No user found`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`👤 [API] User ID: ${user.id}`);

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(`❌ [API] Supabase delete error:`, error);
      throw error;
    }

    console.log(`✅ [API] Task deleted successfully - ID: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`❌ [API] DELETE task error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
