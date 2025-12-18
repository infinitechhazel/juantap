"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
// Types for payment
export type Payment = {
  id: number
  user: { name: string; email: string; profile?: { phone?: string } }
  template: { name: string; price: number }
  payment_method: string
  reference_number: string
  notes: string
  receipt_img?: string
  status: "approved" | "disapproved" | "pending"
  submitted_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL!

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },

  {
    id: "userName",
    header: "User",
    accessorFn: (row) => row.user?.name ?? "-",
    cell: ({ row }) => <div className="truncate max-w-[100px] md:max-w-none">{row.original.user?.name ?? "-"}</div>,
  },
  {
    id: "templateName",
    header: "Template",
    accessorFn: (row) => row.template?.name ?? "-",
    cell: ({ row }) => <div className="truncate max-w-[100px] md:max-w-none">{row.original.template?.name ?? "-"}</div>,
  },
  {
    accessorKey: "payment_method",
    header: "Method",
    cell: ({ row }) => <span className="capitalize">{row.original.payment_method}</span>,
  },
  {
    accessorKey: "reference_number",
    header: "Reference",
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.original.notes
      if (!notes) return "-"

      const isLong = notes.length > 50
      const preview = isLong ? notes.substring(0, 50) + "..." : notes

      return (
        <div>
          {preview}
          {isLong && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-blue-600">
                  See more
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notes</DialogTitle>
                </DialogHeader>
                <div className="whitespace-pre-wrap text-sm text-gray-700">{notes}</div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )
    },
  },

  {
    id: "userEmail",
    header: "Email",
    accessorFn: (row) => row.user?.email ?? "-",
  },
  {
    id: "userContact",
    header: "Contact",
    accessorFn: (row) => row.user?.profile?.phone ?? "-",
  },
  {
    id: "templatePrice",
    header: "Price",
    accessorFn: (row) => {
      const price = row.template?.price
      const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price
      return numericPrice ? `₱${numericPrice.toFixed(2)}` : "₱0.00"
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const styles: Record<string, string> = {
        approved: "bg-green-100 text-green-800 hover:bg-green-100",
        disapproved: "bg-red-100 text-red-800 hover:bg-red-100",
        pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      }
      return <Badge className={`${styles[status]} text-[10px] md:text-sm px-1 md:px-2 py-0.5 md:py-1`}>{status}</Badge>
    },
  },
  {
    accessorKey: "submitted_at",
    header: "Submitted At",
    cell: ({ row }) => {
      const date = new Date(row.original.submitted_at)
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    },
  },
  {
    accessorKey: "receipt_img",
    header: "Receipt",
    cell: ({ row }) =>
      row.original.receipt_img ? (
        <Button variant="ghost" size="sm" onClick={() => window.open(`${IMAGE_URL}/${row.original.receipt_img}`, "_blank")}>
          <Eye className="w-4 h-4" />
        </Button>
      ) : (
        "-"
      ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const payment = row.original

      const handleAction = async (id: number, action: "approve" | "disapprove") => {
        try {
          const res = await fetch(`${API_URL}/admin/payments/${id}/${action}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })

          if (!res.ok) throw new Error("Failed to update payment status")

          toast.success(action === "approve" ? "Payment approved successfully!" : "Payment disapproved successfully!")

          if ((table.options.meta as any)?.refreshData) {
            ;(table.options.meta as any).refreshData()
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(error.message)
          } else {
            toast.error("Something went wrong")
          }
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="space-y-1">
            {payment.status !== "approved" && (
              <DropdownMenuItem asChild>
                <Button size="sm" className="w-full bg-green-400 hover:bg-green-700 text-white" onClick={() => handleAction(payment.id, "approve")}>
                  Approve
                </Button>
              </DropdownMenuItem>
            )}
            {payment.status !== "disapproved" && (
              <DropdownMenuItem asChild>
                <Button size="sm" className="w-full bg-red-400 hover:bg-red-700 text-white" onClick={() => handleAction(payment.id, "disapprove")}>
                  Disapprove
                </Button>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
