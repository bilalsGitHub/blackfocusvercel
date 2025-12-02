import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase-route-handler";

export async function POST() {
  try {
    console.log("👑 [API] Upgrade to Pro request received");

    const supabase = await createRouteHandlerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ [API] Supabase auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    if (!user) {
      console.log("❌ [API] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`👤 [API] Upgrading user ${user.id}`);

    const payload = {
      id: user.id,
      display_name: user.email?.split("@")[0] ?? "BlackFocus Pro",
      is_pro: true,
      upgraded_at: new Date().toISOString(),
      pro_plan: "test-pro",
    };

    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("id, is_pro, upgraded_at, pro_plan")
      .single();

    if (error) {
      console.error("❌ [API] Failed to update profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ [API] User upgraded to Pro", profile);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("❌ [API] Upgrade error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
