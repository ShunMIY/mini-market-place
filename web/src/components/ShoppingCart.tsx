import type { Item } from '../lib/api'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export interface InsufficientRow {
  itemId: string
  required?: number
  available?: number
  message?: string
}

interface CartLine {
  itemId: string
  qty: number
  item?: Item
}

interface ShoppingCartProps {
  cartLines: CartLine[]
  items: Item[]
  error: string | null
  insufficient: InsufficientRow[] | null
  isSubmitting: boolean
  onQuantityChange: (itemId: string, quantity: number) => void
  onSubmit: () => void
  onClear: () => void
}

export function ShoppingCart({
  cartLines,
  items,
  error,
  insufficient,
  isSubmitting,
  onQuantityChange,
  onSubmit,
  onClear,
}: ShoppingCartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="border border-destructive rounded-md p-3 mb-3">
            <b>{error}</b>

            {insufficient && insufficient.length > 0 && (
              <div className="mt-2">
                <div>
                  <b>Insufficient items:</b>
                </div>

                <ul className="pl-4 list-disc">
                  {insufficient.map((row, index) => {
                    const name =
                      items.find((item) => item.id === row.itemId)?.name ??
                      row.itemId

                    return (
                      <li key={index}>
                        {name}
                        {typeof row.required === 'number' &&
                        typeof row.available === 'number'
                          ? ` (required: ${row.required}, available: ${row.available})`
                          : row.message
                            ? ` (${row.message})`
                            : ''}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {cartLines.length === 0 ? (
          <p className="text-muted-foreground">
            Cart is empty. Click "Add" on an item.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-left">Qty</th>
              </tr>
            </thead>

            <tbody>
              {cartLines.map((line) => (
                <tr key={line.itemId}>
                  <td className="py-2">
                    {line.item?.name ?? line.itemId}
                  </td>

                  <td>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={line.qty}
                      onChange={(event) =>
                        onQuantityChange(
                          line.itemId,
                          Number(event.target.value)
                        )
                      }
                      className="w-20"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-3 flex gap-2">
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Placing...' : 'Place order'}
          </Button>

          <Button
            variant="outline"
            onClick={onClear}
            disabled={isSubmitting}
          >
            Clear cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}