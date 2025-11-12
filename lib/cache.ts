import { revalidateTag as nextRevalidateTag } from "next/cache";

/**
 * Helper function to revalidate a cache tag.
 * Workaround for TypeScript issue with Next.js 16 revalidateTag types.
 */
export function revalidateTag(tag: string): void {
  (nextRevalidateTag as (tag: string) => void)(tag);
}

