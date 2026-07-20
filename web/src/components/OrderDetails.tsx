import type { Item, Order } from '../lib/api'

interface OrderDetailsProps {
  items: Item[]
  selectedOrderId: string | null
  selectedOrder: Order | null
  error: string | null
  isLoading: boolean
  isCancelling: boolean
  onCancel: () => void
}

export function OrderDetails({ items, selectedOrderId, selectedOrder, error, isLoading, isCancelling, onCancel }: OrderDetailsProps) {
  return <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
    <h3 style={{ marginTop: 0 }}>Detail</h3>
    {!selectedOrderId ? <p style={{ opacity: 0.8 }}>Select an order from the list</p> : isLoading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : !selectedOrder ? <p style={{ opacity: 0.8 }}>No detail</p> : <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', marginBottom: 16 }}>
        <span style={{ fontWeight: 'bold' }}>ID:</span><span>{selectedOrder.id}</span>
        <span style={{ fontWeight: 'bold' }}>Status:</span><span style={{ color: selectedOrder.status === 'CANCELLED' ? '#c00' : selectedOrder.status === 'CONFIRMED' ? '#080' : '#666' }}>{selectedOrder.status}</span>
        <span style={{ fontWeight: 'bold' }}>Total:</span><span>¥{selectedOrder.total}</span>
      </div>
      <h4 style={{ marginBottom: 8 }}>Order Lines</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead><tr style={{ borderBottom: '1px solid #ddd' }}><th style={{ textAlign: 'left', padding: '8px 0' }}>Item</th><th style={{ textAlign: 'right', padding: '8px 0' }}>Qty</th><th style={{ textAlign: 'right', padding: '8px 0' }}>Unit Price</th></tr></thead>
        <tbody>{selectedOrder.lines.map((line) => {
          const itemName = items.find((item) => item.id === line.itemId)?.name ?? line.itemId
          return <tr key={line.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px 0' }}>{itemName}</td><td style={{ textAlign: 'right', padding: '8px 0' }}>{line.quantity}</td><td style={{ textAlign: 'right', padding: '8px 0' }}>¥{line.unitPrice}</td></tr>
        })}</tbody>
      </table>
      <button onClick={onCancel} disabled={isCancelling || selectedOrder.status === 'CANCELLED'} style={{ padding: '8px 16px', background: selectedOrder.status === 'CANCELLED' ? '#ccc' : '#c00', color: '#fff', border: 'none', borderRadius: 4, cursor: selectedOrder.status === 'CANCELLED' ? 'not-allowed' : 'pointer' }}>
        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
      </button>
      {selectedOrder.status === 'CANCELLED' && <p style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>This order has been cancelled</p>}
    </div>}
  </div>
}
