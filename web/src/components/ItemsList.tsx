import type { Item } from '../lib/api'

interface ItemsListProps {
  items: Item[]
  onAddToCart: (itemId: string) => void
}

export function ItemsList({ items, onAddToCart }: ItemsListProps) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Items</h2>
      {items.length === 0 ? (
        <p style={{ opacity: 0.8 }}>No items yet. Create one below.</p>
      ) : (
        <ul style={{ paddingLeft: 0, margin: 0 }}>
          {items.filter((item) => item.stock > 0).map((item) => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee', listStyle: 'none' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: 13, color: '#666' }}>¥{item.price} / stock: {item.stock}</div>
              </div>
              <button onClick={() => onAddToCart(item.id)} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
