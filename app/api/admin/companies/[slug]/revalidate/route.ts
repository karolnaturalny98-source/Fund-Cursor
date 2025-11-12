import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "@/lib/cache";

import { assertAdminRequest } from "@/lib/auth";

interface RevalidateRouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(_request: Request, { params }: RevalidateRouteParams) {
  try {
    await assertAdminRequest();
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNAUTHENTICATED";
    return NextResponse.json(
      { error: message === "FORBIDDEN" ? "Brak uprawnień." : "Wymagane logowanie." },
      { status: message === "FORBIDDEN" ? 403 : 401 },
    );
  }

  const { slug } = await params;

  try {
    // Clear cache for this specific company
    revalidateTag("companies");
    revalidateTag(`company-by-slug-${slug}`);
    revalidatePath("/firmy");
    revalidatePath(`/firmy/${slug}`);
    revalidatePath(`/firmy/${slug}`, "page");
    revalidatePath("/admin");

    return NextResponse.json({ 
      success: true,
      message: `Cache wyczyszczony dla firmy ${slug}` 
    });
  } catch (error) {
    console.error("Revalidate error:", error);
    return NextResponse.json(
      { error: "Nie udało się wyczyścić cache." },
      { status: 500 },
    );
  }
}


