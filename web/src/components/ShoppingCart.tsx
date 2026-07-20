import type { Item } from '../lib/api'

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

export function ShoppingCart({ cartLines, items, error, insufficient, isSubmitting, onQuantityChange, onSubmit, onClear }: ShoppingCartProps) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Checkout</h2>
      {error && <div style={{ border: '1px solid #f99', padding: 12, marginBottom: 12 }}>
        <b>{error}</b>
        {insufficient && insufficient.length > 0 && <div style={{ marginTop: 8 }}>
          <div><b>Insufficient items:</b></div>
          <ul style={{ paddingLeft: 16 }}>
            {insufficient.map((row, index) => {
              const name = items.find((item) => item.id === row.itemId)?.name ?? row.itemId
              return <li key={index}>{name}{typeof row.required === 'number' && typeof row.available === 'number' ? ` (required: ${row.required}, available: ${row.available})` : row.message ? ` (${row.message})` : ''}</li>
            })}
          </ul>
        </div>}
      </div>}
      {cartLines.length === 0 ? <p style={{ opacity: 0.8 }}>Cart is empty. Click “Add” on an item.</p> : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th align="left">Item</th><th align="left">Qty</th></tr></thead>
        <tbody>{cartLines.map((line) => <tr key={line.itemId}>
          <td style={{ padding: '8px 0' }}>{line.item?.name ?? line.itemId}</td>
          <td><input type="number" min={0} step={1} value={line.qty} onChange={(event) => onQuantityChange(line.itemId, Number(event.target.value))} style={{ width: 80, padding: 6 }} /></td>
        </tr>)}</tbody>
      </table>}
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={onSubmit} disabled={isSubmitting}>{isSubmitting ? 'Placing...' : 'Place order'}</button>
        <button onClick={onClear} disabled={isSubmitting}>Clear cart</button>
      </div>
    </div>
  )
}
