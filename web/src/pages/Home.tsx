import { ItemsList } from '../components/ItemsList'
import { ShoppingCart } from '../components/ShoppingCart'
import { useMarketplace } from '../contexts/MarketplaceContext'

export function Home() {
  const {
    items, cartLines, orderError, insufficient, orderSubmitting,
    addToCart, setQty, submitOrder, clearCart,
  } = useMarketplace()

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <ItemsList items={items} onAddToCart={addToCart} />
      <ShoppingCart
        cartLines={cartLines}
        items={items}
        error={orderError}
        insufficient={insufficient}
        isSubmitting={orderSubmitting}
        onQuantityChange={setQty}
        onSubmit={submitOrder}
        onClear={clearCart}
      />
    </section>
  )
}
