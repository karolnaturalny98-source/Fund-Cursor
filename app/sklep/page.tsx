import { auth } from "@clerk/nextjs/server";
import { getCompanies } from "@/lib/queries/companies";
import { ShopPageClient } from "@/components/shop/shop-page-client";
import { ShopPurchaseConfirmation } from "@/components/shop/shop-purchase-confirmation";
import Aurora from "@/components/Aurora";

// Cache shop page for 5 minutes for better performance
export const revalidate = 300;

export default async function ShopPage() {
  const { userId } = await auth();
  
  // Pobierz firmy z planami
  const companies = await getCompanies({}, { viewerId: userId });

  return (
    <div className="relative">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 h-[150vh]">
        <Aurora
          colorStops={["#1e5a3d", "#34d399", "#a7f3d0"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <ShopPurchaseConfirmation />
      <ShopPageClient companies={companies} userId={userId} />
    </div>
  );
}
