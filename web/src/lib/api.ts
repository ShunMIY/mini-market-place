export type Item = {
    id: string;
    name: string;
    price: number;
    stock: number;
    version: number;
    createdAt: string;
    updatedAt: string;
  };
  
  export type OrderLine = {
    id: string;
    itemId: string;
    quantity: number;
    unitPrice: number;
  };
  
  export type Order = {
    id: string;
    total: number;
    status: string; // 後でOpenAPIから型生成して厳密化してもOK
    lines: OrderLine[];
    createdAt: string;
    updatedAt: string;
  };
  
  export type CreateItemInput = {
    name: string;
    price: number;
    stock: number;
  };
  
  export type CreateOrderInput = {
    items: { itemId: string; quantity: number }[];
  };
  
  export class ApiError extends Error {
    status: number;
    body: unknown;
  
    constructor(status: number, body: unknown) {
      super(`API Error ${status}`);
      this.status = status;
      this.body = body;
    }
  }
  
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  
    const text = await res.text();
    let body: unknown = null;
    try {
        body = text ? JSON.parse(text) : null;
    } catch {
        body = text; 
    }
  
    if (!res.ok) {
      throw new ApiError(res.status, body);
    }
    return body as T;
  }
  
  // Items
  export const api = {
    getItems(): Promise<Item[]> {
      return request<Item[]>('/items');
    },
  
    createItem(input: CreateItemInput): Promise<Item> {
      return request<Item>('/items', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
  
    // Orders
    createOrder(input: CreateOrderInput): Promise<Order> {
      return request<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
  
    getOrders(): Promise<Order[]> {
      return request<Order[]>('/orders');
    },
  
    getOrder(id: string): Promise<Order> {
      return request<Order>(`/orders/${id}`);
    },
  
    cancelOrder(id: string): Promise<Order> {
      return request<Order>(`/orders/${id}/cancel`, { method: 'POST' });
    },
  };
  