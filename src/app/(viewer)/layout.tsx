import { AuthProvider } from "@/components/auth/auth-provider"

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white px-6 py-4">
          <div className="mx-auto max-w-5xl">
            <span className="font-serif text-xl font-bold text-primary">
              MyLifeFolio
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </AuthProvider>
  )
}
