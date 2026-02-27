import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { personId } = await request.json()

  if (!personId) {
    return NextResponse.json(
      { error: "personId is required" },
      { status: 400 }
    )
  }

  // Get the person
  const { data: person, error: personError } = await supabase
    .from("persons")
    .select("*")
    .eq("id", personId)
    .eq("owner_id", user.id)
    .single()

  if (personError || !person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 })
  }

  // Get owner profile for the invitation email context
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  // Send a magic link invitation to the person's email
  // This will create their account if they don't have one
  const { error: inviteError } = await supabase.auth.signInWithOtp({
    email: person.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${request.headers.get("origin") || ""}/view`,
      data: {
        full_name: person.full_name,
        invited_by: ownerProfile?.full_name || "A MyLifeFolio user",
        owner_id: user.id,
      },
    },
  })

  if (inviteError) {
    return NextResponse.json(
      { error: inviteError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
