import { CreateItemForm } from '../components/CreateItemForm'
import { OrdersSection } from '../components/OrdersSection'
import { useMarketplace } from '../contexts/MarketplaceContext'

export function Admin() {
  const {
    items, name, price, stock, error, submitting, setName, setPrice, setStock, onSubmit,
    orders, ordersError, loadingOrders, selectedOrderId, selectedOrder, orderDetailError,
    loadingOrderDetail, cancelSubmitting, loadOrders, onSelectOrder, cancelSelectedOrder,
  } = useMarketplace()

  return (
    <section className="space-y-6">
      <CreateItemForm
        name={name}
        price={price}
        stock={stock}
        error={error}
        isSubmitting={submitting}
        onNameChange={setName}
        onPriceChange={setPrice}
        onStockChange={setStock}
        onSubmit={onSubmit}
      />
      <OrdersSection
        items={items}
        orders={orders}
        error={ordersError}
        isLoading={loadingOrders}
        selectedOrderId={selectedOrderId}
        selectedOrder={selectedOrder}
        detailError={orderDetailError}
        isDetailLoading={loadingOrderDetail}
        isCancelling={cancelSubmitting}
        onRefresh={loadOrders}
        onSelectOrder={onSelectOrder}
        onCancelOrder={cancelSelectedOrder}
      />
    </section>
  )
}
