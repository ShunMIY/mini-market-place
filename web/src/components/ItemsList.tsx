import type { Item } from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ItemsListProps {
  items: Item[];
  onAddToCart: (itemId: string) => void;
}

export function ItemsList({ items, onAddToCart }: ItemsListProps) {
  const availableItems = items.filter((item) => item.stock > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
      </CardHeader>

      <CardContent>
        {availableItems.length === 0 ? (
          <p className="text-muted-foreground">
            No items yet. Create one below.
          </p>
        ) : (
          <ul className="space-y-3">
            {availableItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border-b pb-3"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ¥{item.price} / stock: {item.stock}
                  </p>
                </div>

                <Button onClick={() => onAddToCart(item.id)}>
                  Add
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}