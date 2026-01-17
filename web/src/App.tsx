import { type FormEvent, useEffect, useState, useMemo } from 'react'
import { api, ApiError } from './lib/api';
import type { Item , Order} from './lib/api';
import './App.css'

type Cart = Record<string, number>;

type InsufficientRow = {
  itemId: string;
  required?: number;
  available?: number;
  message?: string;
};

function App() {
  const[items, setItems] = useState<Item[]>([]);
  const[error, setError] = useState<string | null>(null);

  const[name, setName] = useState('');
  const[price, setPrice] = useState<number>(0);
  const[stock, setStock] = useState<number>(0);
  const[submitting, setSubmitting] = useState(false);

  const[cart, setCart] = useState<Cart>({}); 
  const[orderSubmitting, setOrderSubmitting] = useState(false);
  const[orderError, setOrderError] = useState<string | null>(null);
  const[insufficient, setInsufficient] = useState<InsufficientRow[] | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailError, setOrderDetailError] = useState<string | null>(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);

  const [cancelSubmitting, setCancelSubmitting] = useState(false);


  async function loadItems(){
    setError(null);
    try{
      const data = await api.getItems();
      setItems(data);
    } catch(e){
      console.error(e);
      setError('Failed to load items');
    }
  }

  async function loadOrders() {
    setOrdersError(null);
    setLoadingOrders(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
      setOrdersError('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadOrderDetail(id: string) {
    setOrderDetailError(null);
    setLoadingOrderDetail(true);
    try {
      const data = await api.getOrder(id);
      setSelectedOrder(data);
    } catch (e) {
      console.error(e);
      setOrderDetailError('Failed to load order detail');
    } finally {
      setLoadingOrderDetail(false);
    }
  }

  async function cancelSelectedOrder() {
    if (!selectedOrderId) return;
    setCancelSubmitting(true);
    setOrderDetailError(null);
    try {
      const updated = await api.cancelOrder(selectedOrderId);
      setSelectedOrder(updated);
      await loadItems();  // 在庫が戻る体感
      await loadOrders(); // 一覧のstatus更新
    } catch (e) {
      console.error(e);
      if (e instanceof ApiError) {
        // 冪等なら2回目以降も200で返る設計が理想
        // もし404/409などが来るならここで分岐
        setOrderDetailError(`Cancel failed (${e.status})`);
      } else {
        setOrderDetailError('Cancel failed');
      }
    } finally {
      setCancelSubmitting(false);
    }
  }
  

  async function onSelectOrder(id: string) {
    setSelectedOrderId(id);
    await loadOrderDetail(id);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function onSubmit(e: FormEvent){
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try{
      await api.createItem({
        name,
        price: Number(price),
        stock: Number(stock),
      });

      setName('');
      setPrice(0);
      setStock(0);

      await loadItems();
    }catch (e){
      console.error(e);
      if(e instanceof ApiError){
        if(e.status === 400){
          setError('Validation failed (400). Check name/price/stock.');
        }else{
          setError(`Request failed (${e.status}).`);
        }
      }else{
        setError('An unexpected error occurred.');
      }
    }finally{
      setSubmitting(false);
    }
  }

  function addToCart(itemId: string){
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? 0) + 1,
    }));
  }

  function setQty(itemId: string, qty: number) {
    const q = Number.isFinite(qty) ? qty : 0;
    setCart((prev) => ({ ...prev, [itemId]: Math.max(0, Math.floor(q)) }));
  }


  const cartLines = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        itemId,
        qty,
        item: items.find((x) => x.id === itemId),
      }));
  }, [cart, items]);

  function clearOrderErrors() {
    setOrderError(null);
    setInsufficient(null);
  }

  async function submitOrder() {
    clearOrderErrors();

    const payload = cartLines.map((l) => ({
      itemId: l.itemId,
      quantity: l.qty,
    }));

    if (payload.length === 0) {
      setOrderError('Cart is empty');
      return;
    }

    setOrderSubmitting(true);
    try {
      const order = await api.createOrder({ items: payload });
      alert(`Order created: ${order.id}`);
      setCart({});
      await loadItems(); // 在庫減算を体感
      await loadOrders();
    } catch (e) {
      console.error(e);
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setOrderError('Insufficient stock (409)');
          setInsufficient(extractInsufficient(e.body));
        } else if (e.status === 400) {
          setOrderError('Bad request (400)');
        } else {
          setOrderError(`Request failed (${e.status})`);
        }
      } else {
        setOrderError('Unexpected error');
      }
    } finally {
      setOrderSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>Mini Marketplace</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Items */}
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Items</h2>
          {items.length === 0 ? (
            <p style={{ opacity: 0.8 }}>No items yet. Create one below.</p>
          ) : (
            <ul style={{ paddingLeft: 0, margin: 0 }}>
              {items.filter((item) => item.stock > 0).map((item) => (
                <li key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid #eee',
                  listStyle: 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      ¥{item.price} / stock: {item.stock}
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: Checkout */}
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Checkout</h2>

          {orderError && (
            <div style={{ border: '1px solid #f99', padding: 12, marginBottom: 12 }}>
              <b>{orderError}</b>
              {insufficient && insufficient.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div><b>Insufficient items:</b></div>
                  <ul style={{ paddingLeft: 16 }}>
                    {insufficient.map((r, idx) => {
                      const name = items.find((x) => x.id === r.itemId)?.name ?? r.itemId;
                      return (
                        <li key={idx}>
                          {name}
                          {typeof r.required === 'number' && typeof r.available === 'number'
                            ? ` (required: ${r.required}, available: ${r.available})`
                            : r.message
                              ? ` (${r.message})`
                              : ''}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {cartLines.length === 0 ? (
            <p style={{ opacity: 0.8 }}>Cart is empty. Click “Add” on an item.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th align="left">Item</th>
                  <th align="left">Qty</th>
                </tr>
              </thead>
              <tbody>
                {cartLines.map((l) => (
                  <tr key={l.itemId}>
                    <td style={{ padding: '8px 0' }}>{l.item?.name ?? l.itemId}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={l.qty}
                        onChange={(e) => setQty(l.itemId, Number(e.target.value))}
                        style={{ width: 80, padding: 6 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={submitOrder} disabled={orderSubmitting}>
              {orderSubmitting ? 'Placing...' : 'Place order'}
            </button>
            <button
              onClick={() => { clearOrderErrors(); setCart({}); }}
              disabled={orderSubmitting}
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>

      {/* Create Item section - full width */}
      <section style={{ marginTop: 32, borderTop: '2px solid #ddd', paddingTop: 24 }}>
        <h2 style={{ margin: '0 0 16px 0' }}>Create Item</h2>
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, maxWidth: 400 }}>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <label>
              <span style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. T-shirt"
                style={{ display: 'block', width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>

            <label>
              <span style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Price</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                style={{ display: 'block', width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>

            <label>
              <span style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Stock</span>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                style={{ display: 'block', width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 16px',
                background: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {submitting ? 'Creating...' : 'Create Item'}
            </button>
          </form>

          {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
        </div>
      </section>

      {/* Orders section - full width at bottom */}
      <section style={{ marginTop: 32, borderTop: '2px solid #ddd', paddingTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Orders</h2>
          <button onClick={loadOrders} disabled={loadingOrders}>
            {loadingOrders ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {ordersError && <p style={{ color: 'red' }}>{ordersError}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          {/* Orders list */}
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>List</h3>
            {orders.length === 0 ? (
              <p style={{ opacity: 0.8 }}>No orders yet</p>
            ) : (
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {orders.map((o) => (
                  <li key={o.id} style={{ marginBottom: 8, listStyle: 'none' }}>
                    <button
                      onClick={() => onSelectOrder(o.id)}
                      style={{
                        textAlign: 'left',
                        width: '100%',
                        padding: 12,
                        border: selectedOrderId === o.id ? '2px solid #666' : '1px solid #ccc',
                        borderRadius: 6,
                        background: selectedOrderId === o.id ? '#f5f5f5' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{o.id.slice(0, 8)}...</div>
                      <div style={{ fontSize: 13, color: '#666' }}>
                        {o.status} / ¥{o.total}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Order detail */}
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Detail</h3>

            {!selectedOrderId ? (
              <p style={{ opacity: 0.8 }}>Select an order from the list</p>
            ) : loadingOrderDetail ? (
              <p>Loading...</p>
            ) : orderDetailError ? (
              <p style={{ color: 'red' }}>{orderDetailError}</p>
            ) : !selectedOrder ? (
              <p style={{ opacity: 0.8 }}>No detail</p>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', marginBottom: 16 }}>
                  <span style={{ fontWeight: 'bold' }}>ID:</span>
                  <span>{selectedOrder.id}</span>
                  <span style={{ fontWeight: 'bold' }}>Status:</span>
                  <span style={{
                    color: selectedOrder.status === 'CANCELLED' ? '#c00' : selectedOrder.status === 'CONFIRMED' ? '#080' : '#666'
                  }}>{selectedOrder.status}</span>
                  <span style={{ fontWeight: 'bold' }}>Total:</span>
                  <span>¥{selectedOrder.total}</span>
                </div>

                <h4 style={{ marginBottom: 8 }}>Order Lines</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0' }}>Item</th>
                      <th style={{ textAlign: 'right', padding: '8px 0' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '8px 0' }}>Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.lines.map((ln) => {
                      const itemName = items.find((x) => x.id === ln.itemId)?.name ?? ln.itemId;
                      return (
                        <tr key={ln.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px 0' }}>{itemName}</td>
                          <td style={{ textAlign: 'right', padding: '8px 0' }}>{ln.quantity}</td>
                          <td style={{ textAlign: 'right', padding: '8px 0' }}>¥{ln.unitPrice}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <button
                  onClick={cancelSelectedOrder}
                  disabled={cancelSubmitting || selectedOrder.status === 'CANCELLED'}
                  style={{
                    padding: '8px 16px',
                    background: selectedOrder.status === 'CANCELLED' ? '#ccc' : '#c00',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: selectedOrder.status === 'CANCELLED' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {cancelSubmitting ? 'Cancelling...' : 'Cancel Order'}
                </button>

                {selectedOrder.status === 'CANCELLED' && (
                  <p style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
                    This order has been cancelled
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App

function extractInsufficient(body: unknown): InsufficientRow[] {
  if (!body) return [];

  // { insufficientItems: [{ itemId, required, available }] }
  if (isObj(body) && Array.isArray((body as any).insufficientItems)) {
    return (body as any).insufficientItems
      .map((x: any) => ({
        itemId: String(x.itemId ?? x.id ?? ''),
        required: numOrUndef(x.required ?? x.requested),
        available: numOrUndef(x.available ?? x.stock),
        message: typeof x.message === 'string' ? x.message : undefined,
      }))
      .filter((r: InsufficientRow) => r.itemId);
  }

  // { details: { insufficient: [...] } }
  if (isObj(body) && isObj((body as any).details) && Array.isArray((body as any).details.insufficient)) {
    return (body as any).details.insufficient
      .map((x: any) => ({
        itemId: String(x.itemId ?? x.id ?? ''),
        required: numOrUndef(x.required),
        available: numOrUndef(x.available),
        message: typeof x.message === 'string' ? x.message : undefined,
      }))
      .filter((r: InsufficientRow) => r.itemId);
  }

  // 文字列だけ
  if (typeof body === 'string') return [{ itemId: 'unknown', message: body }];

  // それ以外はJSON化
  try {
    return [{ itemId: 'unknown', message: JSON.stringify(body) }];
  } catch {
    return [{ itemId: 'unknown', message: 'insufficient stock' }];
  }
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function numOrUndef(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}