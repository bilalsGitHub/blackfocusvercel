import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase-route-handler";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createRouteHandlerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("sessions")
      .update({
        task_id: body.taskId || null,
      })
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
    console.log(`🗑️ [API] DELETE session request - ID: ${id}`);

    const supabase = await createRouteHandlerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log(`❌ [API] Unauthorized - No user found`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`👤 [API] User ID: ${user.id}`);

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(`❌ [API] Supabase delete error:`, error);
      throw error;
    }

    console.log(`✅ [API] Session deleted successfully - ID: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`❌ [API] DELETE session error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
