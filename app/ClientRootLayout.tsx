"use client"

import type React from "react"
import "./globals.css"
import { SiteProvider } from "@/components/site-context"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { AuthProvider } from "@/components/auth-context"
import { CharacterProvider } from "@/components/character-context"
import { ImageSuggestionsProvider } from "@/components/image-suggestions-context"
import { BannerProvider } from "@/components/banner-context"
import AppSidebar from "@/components/app-sidebar"
import { ErrorBoundary } from "@/components/error-boundary"
import { LanguageProvider } from "@/components/language-context"

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isOpen ? "md:ml-64" : "md:ml-16"}`}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  )
}

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProvider>
      <AuthProvider>
        <LanguageProvider>
          <SidebarProvider>
            <CharacterProvider>
              <BannerProvider>
                <ImageSuggestionsProvider>
                  <RootLayoutContent>{children}</RootLayoutContent>
                </ImageSuggestionsProvider>
              </BannerProvider>
            </CharacterProvider>
          </SidebarProvider>
        </LanguageProvider>
      </AuthProvider>
    </SiteProvider>
  )
}
