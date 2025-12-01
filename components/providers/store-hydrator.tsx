"use client";

import { useHydrateStores } from "@/hooks/use-hydrate-stores";

export function StoreHydrator() {
  useHydrateStores();
  return null;
}

