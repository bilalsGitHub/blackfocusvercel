import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase-route-handler";

export async function POST() {
  try {
    console.log("🔥 [API] DELETE ALL DATA request received");

    const supabase = await createRouteHandlerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("❌ [API] Unauthorized - No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`👤 [API] User ID: ${user.id}`);
    console.log("🗑️ [API] Calling delete_all_user_data function...");

    // Call the Supabase function to delete all user data
    const { data, error } = await supabase.rpc("delete_all_user_data", {
      target_user_id: user.id,
    });

    if (error) {
      console.error("❌ [API] Supabase RPC error:", error);
      throw error;
    }

    console.log("✅ [API] Delete result:", data);
    console.log(`   📊 Deleted ${data.deleted_sessions} sessions`);
    console.log(`   📊 Deleted ${data.deleted_tasks} tasks`);
    console.log(`   📊 Deleted ${data.deleted_settings} settings`);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("❌ [API] DELETE ALL DATA error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
