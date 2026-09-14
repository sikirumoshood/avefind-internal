"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bike, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { StatCard } from "@/components/common/stat-card"
import { Timeline, type TimelineItem } from "@/components/common/timeline"
import type { OrderCustomer, OrderDeliveryAddress, OrderDeliveryAgentSummary, OrderStore } from "@/lib/types"
import { resolveImageUrl } from "@/lib/utils"

import { assignDeliveryAgentAction, searchDeliveryAgentsAction, type DeliveryAgentOption } from "../actions"

type DeliveryTabProps = {
  orderId: string
  deliveryAgent?: OrderDeliveryAgentSummary
  store: OrderStore | null
  deliveryAddress: OrderDeliveryAddress
  customer: OrderCustomer
  timelineItems: TimelineItem[]
  deliveryRequestItems: TimelineItem[]
  riderOngoingDeliveries?: number
}

function initials(firstName: string, lastName: string) {
  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? ""}`.toUpperCase()
}

function formatAddress(address: OrderDeliveryAddress | OrderStore) {
  return [address.addressLine1, address.addressLine2, address.addressCity, address.addressState]
    .filter(Boolean)
    .join(", ")
}

export function DeliveryTab({
  orderId,
  deliveryAgent,
  store,
  deliveryAddress,
  customer,
  timelineItems,
  deliveryRequestItems,
  riderOngoingDeliveries,
}: DeliveryTabProps) {
  const router = useRouter()
  const [assignOpen, setAssignOpen] = useState(false)

  return (
    <div className="space-y-6">
      {deliveryAgent && riderOngoingDeliveries !== undefined ? (
        <StatCard label="Rider's ongoing delivery count" value={riderOngoingDeliveries} icon={Bike} />
      ) : null}

      <div className="flex justify-end">
        <Button onClick={() => setAssignOpen(true)}>
          <Bike /> {deliveryAgent ? "Reassign rider" : "Assign rider"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {deliveryAgent ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={deliveryAgent.user.profileUrl ? resolveImageUrl(deliveryAgent.user.profileUrl) : undefined}
                      alt=""
                    />
                    <AvatarFallback>{initials(deliveryAgent.user.firstName, deliveryAgent.user.lastName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {deliveryAgent.user.firstName} {deliveryAgent.user.lastName}
                    </p>
                    <p className="text-muted-foreground">{deliveryAgent.user.phoneNumber}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{deliveryAgent.isOnline ? "Online" : "Offline"}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/delivery-agents/${deliveryAgent.id}`}>View rider details</Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Not assigned yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {store?.merchant ? (
                <Avatar size="sm">
                  <AvatarImage src={store.merchant.logoUrl ? resolveImageUrl(store.merchant.logoUrl) : undefined} alt="" />
                  <AvatarFallback className="text-xs">{store.merchant.name.at(0)}</AvatarFallback>
                </Avatar>
              ) : null}
              Pickup — {store?.name ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {store ? (
              <>
                <p className="text-muted-foreground">{formatAddress(store)}</p>
                <p>{store.contactNumber ?? "No contact number"}</p>
              </>
            ) : (
              <p className="text-muted-foreground">No confirmed store yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Avatar size="sm">
                <AvatarImage src={customer.profileUrl ? resolveImageUrl(customer.profileUrl) : undefined} alt="" />
                <AvatarFallback className="text-xs">{customer.firstName.at(0)}</AvatarFallback>
              </Avatar>
              Drop-off
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">
              {customer.firstName} {customer.lastName}
            </p>
            {customer.phoneNumber ? <p className="text-muted-foreground">{customer.phoneNumber}</p> : null}
            <p className="text-muted-foreground">{deliveryAddress.nickname ?? formatAddress(deliveryAddress)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery status timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline items={timelineItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline items={deliveryRequestItems} emptyLabel="No delivery requests have been sent yet." />
          </CardContent>
        </Card>
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign delivery agent</DialogTitle>
            <DialogDescription>
              {deliveryAgent
                ? `Currently assigned to ${deliveryAgent.user.firstName} ${deliveryAgent.user.lastName}. Selecting a new agent reassigns the order.`
                : "Search for an approved, active agent to assign to this order."}
            </DialogDescription>
          </DialogHeader>
          {assignOpen ? (
            <AssignAgentForm orderId={orderId} onClose={() => setAssignOpen(false)} onDone={() => router.refresh()} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Mounted only while its dialog is open, so local state starts fresh every time — no reset effect needed. */
function AssignAgentForm({ orderId, onClose, onDone }: { orderId: string; onClose: () => void; onDone: () => void }) {
  const [options, setOptions] = useState<DeliveryAgentOption[]>([])
  const [selected, setSelected] = useState<DeliveryAgentOption | null>(null)
  const [comboOpen, setComboOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [pending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleQueryChange(value: string) {
    setSearching(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const result = await searchDeliveryAgentsAction(value)
      setOptions(result)
      setSearching(false)
    }, 300)
  }

  function handleConfirm() {
    if (!selected) return
    startTransition(async () => {
      const result = await assignDeliveryAgentAction(orderId, selected.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`${selected.name} assigned.`)
      onClose()
      onDone()
    })
  }

  return (
    <>
      <Popover open={comboOpen} onOpenChange={setComboOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-start font-normal">
            {selected ? selected.name : "Search agents…"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search by name or email…" onValueChange={handleQueryChange} />
            <CommandList>
              {searching ? (
                <div className="p-3 text-sm text-muted-foreground">Searching…</div>
              ) : (
                <>
                  <CommandEmpty>No agents found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((agent) => (
                      <CommandItem
                        key={agent.id}
                        value={agent.id}
                        onSelect={() => {
                          setSelected(agent)
                          setComboOpen(false)
                        }}
                      >
                        {agent.name}
                        {agent.isOnline ? <span className="ml-auto text-xs text-success">Online</span> : null}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={pending || !selected}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Assign
        </Button>
      </DialogFooter>
    </>
  )
}
