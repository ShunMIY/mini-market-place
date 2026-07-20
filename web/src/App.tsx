import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { CreateItemForm } from './components/CreateItemForm'
import { ItemsList } from './components/ItemsList'
import { OrdersSection } from './components/OrdersSection'
import { type InsufficientRow, ShoppingCart } from './components/ShoppingCart'
import { api, ApiError, type Item, type Order } from './lib/api'
import './App.css'

type Cart = Record<string, number>

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [stock, setStock] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [cart, setCart] = useState<Cart>({})
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [insufficient, setInsufficient] = useState<InsufficientRow[] | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDetailError, setOrderDetailError] = useState<string | null>(null)
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false)
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  async function loadItems() {
    setError(null)
    try {
      setItems(await api.getItems())
    } catch (e) {
      console.error(e)
      setError('Failed to load items')
    }
  }

  async function loadOrders() {
    setOrdersError(null)
    setLoadingOrders(true)
    try {
      setOrders(await api.getOrders())
    } catch (e) {
      console.error(e)
      setOrdersError('Failed to load orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  async function loadOrderDetail(id: string) {
    setOrderDetailError(null)
    setLoadingOrderDetail(true)
    try {
      setSelectedOrder(await api.getOrder(id))
    } catch (e) {
      console.error(e)
      setOrderDetailError('Failed to load order detail')
    } finally {
      setLoadingOrderDetail(false)
    }
  }

  async function cancelSelectedOrder() {
    if (!selectedOrderId) return
    setCancelSubmitting(true)
    setOrderDetailError(null)
    try {
      setSelectedOrder(await api.cancelOrder(selectedOrderId))
      await loadItems()
      await loadOrders()
    } catch (e) {
      console.error(e)
      setOrderDetailError(e instanceof ApiError ? `Cancel failed (${e.status})` : 'Cancel failed')
    } finally {
      setCancelSubmitting(false)
    }
  }

  async function onSelectOrder(id: string) {
    setSelectedOrderId(id)
    await loadOrderDetail(id)
  }

  useEffect(() => { loadItems() }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.createItem({ name, price: Number(price), stock: Number(stock) })
      setName('')
      setPrice(0)
      setStock(0)
      await loadItems()
    } catch (e) {
      console.error(e)
      if (e instanceof ApiError) setError(e.status === 400 ? 'Validation failed (400). Check name/price/stock.' : `Request failed (${e.status}).`)
      else setError('An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  function addToCart(itemId: string) {
    setCart((previous) => ({ ...previous, [itemId]: (previous[itemId] ?? 0) + 1 }))
  }

  function setQty(itemId: string, quantity: number) {
    const validQuantity = Number.isFinite(quantity) ? quantity : 0
    setCart((previous) => ({ ...previous, [itemId]: Math.max(0, Math.floor(validQuantity)) }))
  }

  const cartLines = useMemo(() => Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([itemId, qty]) => ({ itemId, qty, item: items.find((item) => item.id === itemId) })), [cart, items])

  function clearOrderErrors() {
    setOrderError(null)
    setInsufficient(null)
  }

  async function submitOrder() {
    clearOrderErrors()
    const payload = cartLines.map((line) => ({ itemId: line.itemId, quantity: line.qty }))
    if (payload.length === 0) {
      setOrderError('Cart is empty')
      return
    }
    setOrderSubmitting(true)
    try {
      const order = await api.createOrder({ items: payload })
      alert(`Order created: ${order.id}`)
      setCart({})
      await loadItems()
      await loadOrders()
    } catch (e) {
      console.error(e)
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setOrderError('Insufficient stock (409)')
          setInsufficient(extractInsufficient(e.body))
        } else if (e.status === 400) setOrderError('Bad request (400)')
        else setOrderError(`Request failed (${e.status})`)
      } else setOrderError('Unexpected error')
    } finally {
      setOrderSubmitting(false)
    }
  }

  return <div style={{ padding: 24, maxWidth: 900 }}>
    <h1>Mini Marketplace</h1>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <ItemsList items={items} onAddToCart={addToCart} />
      <ShoppingCart cartLines={cartLines} items={items} error={orderError} insufficient={insufficient} isSubmitting={orderSubmitting} onQuantityChange={setQty} onSubmit={submitOrder} onClear={() => { clearOrderErrors(); setCart({}) }} />
    </div>
    <CreateItemForm name={name} price={price} stock={stock} error={error} isSubmitting={submitting} onNameChange={setName} onPriceChange={setPrice} onStockChange={setStock} onSubmit={onSubmit} />
    <OrdersSection items={items} orders={orders} error={ordersError} isLoading={loadingOrders} selectedOrderId={selectedOrderId} selectedOrder={selectedOrder} detailError={orderDetailError} isDetailLoading={loadingOrderDetail} isCancelling={cancelSubmitting} onRefresh={loadOrders} onSelectOrder={onSelectOrder} onCancelOrder={cancelSelectedOrder} />
  </div>
}

export default App

function extractInsufficient(body: unknown): InsufficientRow[] {
  if (!body) return []
  if (isObj(body) && Array.isArray(body.insufficientItems)) return body.insufficientItems.map(toInsufficientItemRow).filter((row): row is InsufficientRow => Boolean(row.itemId))
  if (isObj(body) && isObj(body.details) && Array.isArray(body.details.insufficient)) return body.details.insufficient.map(toDetailsInsufficientRow).filter((row): row is InsufficientRow => Boolean(row.itemId))
  if (typeof body === 'string') return [{ itemId: 'unknown', message: body }]
  try { return [{ itemId: 'unknown', message: JSON.stringify(body) }] } catch { return [{ itemId: 'unknown', message: 'insufficient stock' }] }
}

function toInsufficientItemRow(value: unknown): InsufficientRow {
  const row = isObj(value) ? value : {}
  return { itemId: String(row.itemId ?? row.id ?? ''), required: numOrUndef(row.required ?? row.requested), available: numOrUndef(row.available ?? row.stock), message: typeof row.message === 'string' ? row.message : undefined }
}

function toDetailsInsufficientRow(value: unknown): InsufficientRow {
  const row = isObj(value) ? value : {}
  return { itemId: String(row.itemId ?? row.id ?? ''), required: numOrUndef(row.required), available: numOrUndef(row.available), message: typeof row.message === 'string' ? row.message : undefined }
}

function isObj(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null }
function numOrUndef(value: unknown): number | undefined { const numberValue = Number(value); return Number.isFinite(numberValue) ? numberValue : undefined }
