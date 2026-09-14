"use client"

import { useMemo } from "react"
import { ChevronDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type FilterMultiSelectOption = { value: string; label: string }

type FilterMultiSelectProps = {
  label: string
  options: FilterMultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  className?: string
}

/** Checkbox dropdown for filters whose backing API param accepts an array — pairs multiple values with OR semantics. */
export function FilterMultiSelect({ label, options, selected, onChange, className }: FilterMultiSelectProps) {
  const sortedOptions = useMemo(
    () => [...options].sort((a, b) => a.label.localeCompare(b.label)),
    [options],
  )

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-between font-normal sm:w-auto", className)}>
          {selected.length > 0 ? `${label} (${selected.length})` : label}
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {selected.length > 0 ? (
          <>
            <DropdownMenuCheckboxItem
              checked={false}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={() => onChange([])}
              className="text-muted-foreground"
            >
              <X className="size-3.5" />
              Clear all
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {sortedOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => toggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
