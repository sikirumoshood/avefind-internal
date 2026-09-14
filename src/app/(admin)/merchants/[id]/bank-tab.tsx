"use client"

import { useRef, useState, useTransition } from "react"
import { format } from "date-fns"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Bank, PaymentMethod } from "@/lib/types"

import { createBankAccountAction, deleteBankAccountAction, searchBanksAction } from "./actions"

function formatDate(value: string | null) {
  return value ? format(new Date(value), "MMM d, yyyy p") : "—"
}

export function BankTab({ merchantId, paymentMethods }: { merchantId: string; paymentMethods: PaymentMethod[] }) {
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)

  const hasActiveAccount = paymentMethods.some((method) => method.deletedAt === null)

  async function handleDelete(): Promise<boolean> {
    if (!deleteTarget) return false
    const result = await deleteBankAccountAction(deleteTarget.id, merchantId)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success("Bank account deleted.")
    return true
  }

  const columns: ColumnDef<PaymentMethod>[] = [
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="ID" /> },
    { accessorKey: "type", header: ({ column }) => <DataTableColumnHeader column={column} title="Type" /> },
    { accessorKey: "accountName", header: ({ column }) => <DataTableColumnHeader column={column} title="Account name" /> },
    { accessorKey: "bankName", header: ({ column }) => <DataTableColumnHeader column={column} title="Bank name" /> },
    { accessorKey: "accountNumber", header: ({ column }) => <DataTableColumnHeader column={column} title="Account number" /> },
    {
      id: "transferRecipient",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Transfer recipient" />,
      cell: ({ row }) => row.original.transferRecipientApiCode ?? row.original.transferRecipientApiId ?? "—",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: "deletedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Deleted" />,
      cell: ({ getValue }) => formatDate(getValue() as string | null),
    },
    { accessorKey: "apiId", header: ({ column }) => <DataTableColumnHeader column={column} title="API ID" /> },
    { accessorKey: "apiToken", header: ({ column }) => <DataTableColumnHeader column={column} title="API token" /> },
    { accessorKey: "merchantId", header: ({ column }) => <DataTableColumnHeader column={column} title="Merchant ID" /> },
    {
      id: "actions",
      cell: ({ row }) =>
        row.original.deletedAt === null ? (
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setDeleteTarget(row.original)}>
            <Trash2 className="size-4" />
          </Button>
        ) : null,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-warning/25 bg-warning/10 p-3 text-sm text-warning">
        You must delete existing bank account before a new one can be added.
      </div>

      <DataTable
        columns={columns}
        data={paymentMethods}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        hidePagination
        pageSize={100}
        emptyState={<EmptyState title="No bank accounts" description="This merchant has no bank accounts on file." />}
        toolbar={
          <div className="flex items-center justify-between gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search bank accounts…" />
            <div className="flex gap-2">
              <ReloadButton />
              <Button onClick={() => setCreateOpen(true)} disabled={hasActiveAccount}>
                <Plus /> Create new bank account
              </Button>
            </div>
          </div>
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create bank account</DialogTitle>
            <DialogDescription>Search for the merchant&apos;s bank and enter their account number.</DialogDescription>
          </DialogHeader>
          {createOpen ? <CreateBankAccountForm merchantId={merchantId} onClose={() => setCreateOpen(false)} /> : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete bank account?"
        description="This cannot be undone. The merchant will need a new bank account added before payouts can resume."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}

function CreateBankAccountForm({ merchantId, onClose }: { merchantId: string; onClose: () => void }) {
  const [options, setOptions] = useState<Bank[]>([])
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [comboOpen, setComboOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [accountNumber, setAccountNumber] = useState("")
  const [pending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleQueryChange(value: string) {
    setSearching(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const banks = await searchBanksAction(value)
      setOptions(banks)
      setSearching(false)
    }, 300)
  }

  function handleConfirm() {
    if (!selectedBank) return
    startTransition(async () => {
      const result = await createBankAccountAction(merchantId, accountNumber.trim(), selectedBank.code)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Bank account created.")
      onClose()
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Bank</Label>
          <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-start font-normal">
                {selectedBank ? selectedBank.name : "Search banks…"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search by bank name…" onValueChange={handleQueryChange} />
                <CommandList>
                  {searching ? (
                    <div className="p-3 text-sm text-muted-foreground">Searching…</div>
                  ) : (
                    <>
                      <CommandEmpty>No banks found.</CommandEmpty>
                      <CommandGroup>
                        {options.map((bank) => (
                          <CommandItem
                            key={bank.id}
                            value={bank.id}
                            onSelect={() => {
                              setSelectedBank(bank)
                              setComboOpen(false)
                            }}
                          >
                            {bank.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="merchant-bank-account-number">Account number</Label>
          <Input
            id="merchant-bank-account-number"
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
            placeholder="10-digit account number"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={pending || !selectedBank || !accountNumber.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Create
        </Button>
      </DialogFooter>
    </>
  )
}
