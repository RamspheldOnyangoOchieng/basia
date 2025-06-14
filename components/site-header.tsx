import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">AI Character Explorer</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
