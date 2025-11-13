"use client";

import { ShopOrdersTable } from "./shop-orders-table";
import type { ShopOrderItem } from "@/lib/queries/shop";

interface ShopOrdersTabProps {
  orders: ShopOrderItem[];
}

export function ShopOrdersTab({ orders }: ShopOrdersTabProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      <ShopOrdersTable orders={orders} />
    </div>
  );
}



