/* eslint-disable react-refresh/only-export-components -- this module intentionally exports the provider hook. */
import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { type InsufficientRow } from '../components/ShoppingCart'
import { api, ApiError, type Item, type Order } from '../lib/api'

type Cart = Record<string, number>

interface MarketplaceContextValue {
  items: Item[]; error: string | null; name: string; price: number; stock: number; submitting: boolean
  cartLines: { itemId: string; qty: number; item?: Item }[]; orderError: string | null; insufficient: InsufficientRow[] | null; orderSubmitting: boolean
  orders: Order[]; ordersError: string | null; loadingOrders: boolean; selectedOrderId: string | null; selectedOrder: Order | null; orderDetailError: string | null; loadingOrderDetail: boolean; cancelSubmitting: boolean
  setName: (name: string) => void; setPrice: (price: number) => void; setStock: (stock: number) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>; addToCart: (itemId: string) => void; setQty: (itemId: string, quantity: number) => void; submitOrder: () => Promise<void>; clearCart: () => void
  loadOrders: () => Promise<void>; onSelectOrder: (id: string) => Promise<void>; cancelSelectedOrder: () => Promise<void>
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null)

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]); const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(''); const [price, setPrice] = useState(0); const [stock, setStock] = useState(0); const [submitting, setSubmitting] = useState(false)
  const [cart, setCart] = useState<Cart>({}); const [orderSubmitting, setOrderSubmitting] = useState(false); const [orderError, setOrderError] = useState<string | null>(null); const [insufficient, setInsufficient] = useState<InsufficientRow[] | null>(null)
  const [orders, setOrders] = useState<Order[]>([]); const [ordersError, setOrdersError] = useState<string | null>(null); const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null); const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); const [orderDetailError, setOrderDetailError] = useState<string | null>(null); const [loadingOrderDetail, setLoadingOrderDetail] = useState(false); const [cancelSubmitting, setCancelSubmitting] = useState(false)

  async function loadItems() { setError(null); try { setItems(await api.getItems()) } catch (e) { console.error(e); setError('Failed to load items') } }
  async function loadOrders() { setOrdersError(null); setLoadingOrders(true); try { setOrders(await api.getOrders()) } catch (e) { console.error(e); setOrdersError('Failed to load orders') } finally { setLoadingOrders(false) } }
  async function loadOrderDetail(id: string) { setOrderDetailError(null); setLoadingOrderDetail(true); try { setSelectedOrder(await api.getOrder(id)) } catch (e) { console.error(e); setOrderDetailError('Failed to load order detail') } finally { setLoadingOrderDetail(false) } }
  async function cancelSelectedOrder() { if (!selectedOrderId) return; setCancelSubmitting(true); setOrderDetailError(null); try { setSelectedOrder(await api.cancelOrder(selectedOrderId)); await loadItems(); await loadOrders() } catch (e) { console.error(e); setOrderDetailError(e instanceof ApiError ? `Cancel failed (${e.status})` : 'Cancel failed') } finally { setCancelSubmitting(false) } }
  async function onSelectOrder(id: string) { setSelectedOrderId(id); await loadOrderDetail(id) }
  useEffect(() => { loadItems() }, [])
  async function onSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(null); setSubmitting(true); try { await api.createItem({ name, price: Number(price), stock: Number(stock) }); setName(''); setPrice(0); setStock(0); await loadItems() } catch (e) { console.error(e); if (e instanceof ApiError) setError(e.status === 400 ? 'Validation failed (400). Check name/price/stock.' : `Request failed (${e.status}).`); else setError('An unexpected error occurred.') } finally { setSubmitting(false) } }
  function addToCart(itemId: string) { setCart((previous) => ({ ...previous, [itemId]: (previous[itemId] ?? 0) + 1 })) }
  function setQty(itemId: string, quantity: number) { const validQuantity = Number.isFinite(quantity) ? quantity : 0; setCart((previous) => ({ ...previous, [itemId]: Math.max(0, Math.floor(validQuantity)) })) }
  const cartLines = useMemo(() => Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([itemId, qty]) => ({ itemId, qty, item: items.find((item) => item.id === itemId) })), [cart, items])
  function clearOrderErrors() { setOrderError(null); setInsufficient(null) }
  function clearCart() { clearOrderErrors(); setCart({}) }
  async function submitOrder() { clearOrderErrors(); const payload = cartLines.map((line) => ({ itemId: line.itemId, quantity: line.qty })); if (payload.length === 0) { setOrderError('Cart is empty'); return }; setOrderSubmitting(true); try { const order = await api.createOrder({ items: payload }); alert(`Order created: ${order.id}`); setCart({}); await loadItems(); await loadOrders() } catch (e) { console.error(e); if (e instanceof ApiError) { if (e.status === 409) { setOrderError('Insufficient stock (409)'); setInsufficient(extractInsufficient(e.body)) } else if (e.status === 400) setOrderError('Bad request (400)'); else setOrderError(`Request failed (${e.status})`) } else setOrderError('Unexpected error') } finally { setOrderSubmitting(false) } }
  return <MarketplaceContext.Provider value={{ items, error, name, price, stock, submitting, cartLines, orderError, insufficient, orderSubmitting, orders, ordersError, loadingOrders, selectedOrderId, selectedOrder, orderDetailError, loadingOrderDetail, cancelSubmitting, setName, setPrice, setStock, onSubmit, addToCart, setQty, submitOrder, clearCart, loadOrders, onSelectOrder, cancelSelectedOrder }}>{children}</MarketplaceContext.Provider>
}

export function useMarketplace() { const context = useContext(MarketplaceContext); if (!context) throw new Error('useMarketplace must be used within MarketplaceProvider'); return context }

function extractInsufficient(body: unknown): InsufficientRow[] { if (!body) return []; if (isObj(body) && Array.isArray(body.insufficientItems)) return body.insufficientItems.map(toInsufficientItemRow).filter((row): row is InsufficientRow => Boolean(row.itemId)); if (isObj(body) && isObj(body.details) && Array.isArray(body.details.insufficient)) return body.details.insufficient.map(toDetailsInsufficientRow).filter((row): row is InsufficientRow => Boolean(row.itemId)); if (typeof body === 'string') return [{ itemId: 'unknown', message: body }]; try { return [{ itemId: 'unknown', message: JSON.stringify(body) }] } catch { return [{ itemId: 'unknown', message: 'insufficient stock' }] } }
function toInsufficientItemRow(value: unknown): InsufficientRow { const row = isObj(value) ? value : {}; return { itemId: String(row.itemId ?? row.id ?? ''), required: numOrUndef(row.required ?? row.requested), available: numOrUndef(row.available ?? row.stock), message: typeof row.message === 'string' ? row.message : undefined } }
function toDetailsInsufficientRow(value: unknown): InsufficientRow { const row = isObj(value) ? value : {}; return { itemId: String(row.itemId ?? row.id ?? ''), required: numOrUndef(row.required), available: numOrUndef(row.available), message: typeof row.message === 'string' ? row.message : undefined } }
function isObj(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null }
function numOrUndef(value: unknown): number | undefined { const numberValue = Number(value); return Number.isFinite(numberValue) ? numberValue : undefined }
