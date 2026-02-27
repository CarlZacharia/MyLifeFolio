import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Users, Lock, FileText } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-serif text-2xl font-bold text-primary">
            MyLifeFolio
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-5xl font-bold leading-tight text-primary">
            Everything they need to know,
            <br />
            <span className="text-gold">when they need to know it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            MyLifeFolio is a secure, comprehensive life documentation platform.
            Document your medical wishes, financial accounts, business interests,
            and personal legacy — with role-based access for your family and advisors.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gold text-gold-foreground hover:bg-gold/90"
              >
                Create Your Folio
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-3xl font-bold text-primary">
            Built for what matters most
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Role-Based Access",
                description:
                  "Control exactly who sees what — your spouse, attorney, healthcare agent, and financial team each see only what they need.",
              },
              {
                icon: FileText,
                title: "20 Life Categories",
                description:
                  "From medical directives to business interests, firearms to funeral wishes — every corner of your life, organized.",
              },
              {
                icon: Lock,
                title: "Bank-Level Security",
                description:
                  "Row-level security, encrypted sensitive fields, and complete audit logging of every access event.",
              },
              {
                icon: Users,
                title: "Family & Advisor Access",
                description:
                  "Invite family members and professional advisors with read-only access to their relevant categories.",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary/5">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MyLifeFolio. All rights reserved.</p>
      </footer>
    </div>
  )
}
