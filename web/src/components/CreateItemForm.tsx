import type { FormEvent } from 'react'

interface CreateItemFormProps {
  name: string
  price: number
  stock: number
  error: string | null
  isSubmitting: boolean
  onNameChange: (name: string) => void
  onPriceChange: (price: number) => void
  onStockChange: (stock: number) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function CreateItemForm({ name, price, stock, error, isSubmitting, onNameChange, onPriceChange, onStockChange, onSubmit }: CreateItemFormProps) {
  const inputStyle = { display: 'block', width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }
  const labelStyle = { display: 'block', marginBottom: 4, fontWeight: 'bold' } as const

  return <section style={{ marginTop: 32, borderTop: '2px solid #ddd', paddingTop: 24 }}>
    <h2 style={{ margin: '0 0 16px 0' }}>Create Item</h2>
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, maxWidth: 400 }}>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label><span style={labelStyle}>Name</span><input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="e.g. T-shirt" style={inputStyle} /></label>
        <label><span style={labelStyle}>Price</span><input type="number" value={price} onChange={(event) => onPriceChange(Number(event.target.value))} style={inputStyle} /></label>
        <label><span style={labelStyle}>Stock</span><input type="number" value={stock} onChange={(event) => onStockChange(Number(event.target.value))} style={inputStyle} /></label>
        <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
          {isSubmitting ? 'Creating...' : 'Create Item'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
    </div>
  </section>
}
