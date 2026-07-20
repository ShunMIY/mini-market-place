import type { Order } from '../lib/api'

interface OrdersListProps {
  orders: Order[]
  selectedOrderId: string | null
  onSelectOrder: (orderId: string) => void
}

export function OrdersList({ orders, selectedOrderId, onSelectOrder }: OrdersListProps) {
  return <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
    <h3 style={{ marginTop: 0 }}>List</h3>
    {orders.length === 0 ? <p style={{ opacity: 0.8 }}>No orders yet</p> : <ul style={{ paddingLeft: 16, margin: 0 }}>
      {orders.map((order) => <li key={order.id} style={{ marginBottom: 8, listStyle: 'none' }}>
        <button onClick={() => onSelectOrder(order.id)} style={{ textAlign: 'left', width: '100%', padding: 12, border: selectedOrderId === order.id ? '2px solid #666' : '1px solid #ccc', borderRadius: 6, background: selectedOrderId === order.id ? '#f5f5f5' : '#fff', cursor: 'pointer' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{order.id.slice(0, 8)}...</div>
          <div style={{ fontSize: 13, color: '#666' }}>{order.status} / ¥{order.total}</div>
        </button>
      </li>)}
    </ul>}
  </div>
}
