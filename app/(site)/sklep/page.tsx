import { auth } from "@clerk/nextjs/server";
import { getCompanies } from "@/lib/queries/companies";
import { ShopPageClient } from "@/components/shop/shop-page-client";
import { ShopPurchaseConfirmation } from "@/components/shop/shop-purchase-confirmation";

// Cache shop page for 5 minutes for better performance
export const revalidate = 300;

export default async function ShopPage() {
  const { userId } = await auth();
  
  // Pobierz firmy z planami
  const companies = await getCompanies({}, { viewerId: userId });

  return (
    <>
      <ShopPurchaseConfirmation />
      <ShopPageClient companies={companies} userId={userId} />
    </>
  );
}
