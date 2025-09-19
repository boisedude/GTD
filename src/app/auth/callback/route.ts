import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("Auth callback - code:", code ? "present" : "missing");
  console.log("Auth callback - next:", next);
  console.log("Auth callback - origin:", origin);

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      console.log("Auth callback - exchange result:", {
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        error: error?.message
      });

      if (!error && data?.session) {
        console.log("Auth callback - success, redirecting to:", `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (error) {
        console.error("Auth callback - error:", error);
        const errorUrl = `${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`;
        return NextResponse.redirect(errorUrl);
      }
    } catch (err) {
      console.error("Auth callback - exception:", err);
      const errorUrl = `${origin}/auth/auth-code-error?error=${encodeURIComponent("Unexpected error during authentication")}`;
      return NextResponse.redirect(errorUrl);
    }
  }

  // No code parameter - redirect to error page
  console.log("Auth callback - no code parameter");
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent("Missing authentication code")}`);
}
