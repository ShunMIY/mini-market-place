import type { Item, Order } from '../lib/api'
import { OrderDetails } from './OrderDetails'
import { OrdersList } from './OrdersList'

interface OrdersSectionProps {
  items: Item[]
  orders: Order[]
  error: string | null
  isLoading: boolean
  selectedOrderId: string | null
  selectedOrder: Order | null
  detailError: string | null
  isDetailLoading: boolean
  isCancelling: boolean
  onRefresh: () => void
  onSelectOrder: (orderId: string) => void
  onCancelOrder: () => void
}

export function OrdersSection(props: OrdersSectionProps) {
  return <section style={{ marginTop: 32, borderTop: '2px solid #ddd', paddingTop: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <h2 style={{ margin: 0 }}>Orders</h2>
      <button onClick={props.onRefresh} disabled={props.isLoading}>{props.isLoading ? 'Loading...' : 'Refresh'}</button>
    </div>
    {props.error && <p style={{ color: 'red' }}>{props.error}</p>}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
      <OrdersList orders={props.orders} selectedOrderId={props.selectedOrderId} onSelectOrder={props.onSelectOrder} />
      <OrderDetails items={props.items} selectedOrderId={props.selectedOrderId} selectedOrder={props.selectedOrder} error={props.detailError} isLoading={props.isDetailLoading} isCancelling={props.isCancelling} onCancel={props.onCancelOrder} />
    </div>
  </section>
}
