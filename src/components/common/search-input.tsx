"use client"

import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** Search box with a leading icon and a trailing clear (×) button, shown once there's text to clear. */
export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={cn("relative w-full sm:max-w-xs", className)}>
      <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn("pl-8", value ? "pr-8" : undefined)}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}
