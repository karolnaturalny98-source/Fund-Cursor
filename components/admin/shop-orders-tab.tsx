"use client";

import { ShopOrdersTable } from "./shop-orders-table";
import type { ShopOrderItem } from "@/lib/queries/shop";

interface ShopOrdersTabProps {
  orders: ShopOrderItem[];
}

export function ShopOrdersTab({ orders }: ShopOrdersTabProps) {
  return (
    <div className="space-y-6">
      <ShopOrdersTable orders={orders} />
    </div>
  );
}


