export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const mainNavigation: NavItem[] = [
  { label: "Rankingi", href: "/rankingi" },
  { label: "Firmy", href: "/firmy" },
  { label: "Analizy", href: "/analizy" },
  { label: "Opinie", href: "/opinie" },
  { label: "Sklep", href: "/sklep" },
  { label: "Panel admin", href: "/admin" },
];
