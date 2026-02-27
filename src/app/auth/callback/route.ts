import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure profile exists (handles case where DB trigger doesn't exist)
      await ensureProfileAndDefaults(supabase, data.user)

      // Check if this user is a person (viewer) invited by someone
      // Link their auth user_id to their person record
      const { data: personRecords } = await supabase
        .from("persons")
        .select("id, owner_id")
        .eq("email", data.user.email!)
        .eq("has_user_account", false)

      if (personRecords && personRecords.length > 0) {
        for (const person of personRecords) {
          await supabase
            .from("persons")
            .update({
              user_id: data.user.id,
              has_user_account: true,
            })
            .eq("id", person.id)
        }

        // Redirect viewers to the view page
        return NextResponse.redirect(`${origin}/view`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page
  return NextResponse.redirect(`${origin}/login?error=auth`)
}

async function ensureProfileAndDefaults(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> }
) {
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (existingProfile) {
    return // Profile already exists, nothing to do
  }

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string) ?? null,
  })

  if (profileError) {
    console.error("Failed to create profile:", profileError)
    return
  }

  // Seed default roles and categories via RPC
  const { error: seedError } = await supabase.rpc("seed_user_defaults", {
    p_user_id: user.id,
  })

  if (seedError) {
    console.error("Failed to seed defaults:", seedError)
  }
}
