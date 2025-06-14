import { Suspense, type ReactNode } from "react"
import { SidebarProvider } from "@/components/sidebar-context"
import AdminSidebarContent from "@/components/admin-sidebar-content"
import AdminMobileNav from "@/components/admin-mobile-nav"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="flex min-h-screen">
          {/* Admin Sidebar */}
          <aside className="w-64 bg-card border-r border-border hidden md:block">
            <div className="p-4 border-b border-border flex items-center">
              <Link href="/" className="flex items-center text-primary hover:text-primary/90">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to App
              </Link>
            </div>
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              <AdminSidebarContent />
            </Suspense>
          </aside>

          {/* Mobile Admin Header */}
          <div className="md:hidden w-full bg-card border-b border-border p-4 fixed top-0 z-10">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <Link href="/" className="text-primary hover:text-primary/90">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Mobile Admin Sidebar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-10">
            <div className="flex justify-around p-2">
              <Suspense fallback={<div>Loading...</div>}>
                <AdminMobileNav />
              </Suspense>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-background">
            <div className="md:p-8 p-4 md:pt-8 pt-16 pb-20 md:pb-8 max-w-7xl mx-auto">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  )
}
