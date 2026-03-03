import { BrandsList } from "./brands-list";

export function formatBrand(make: string | undefined): string {
  if ((make || "") === "Arashi Vision") {
    return "insta360";
  }
  const brand = (make || "").toLowerCase();
  for (const b of BrandsList.map((item) => item.toLowerCase())) {
    if (brand.includes(b)) {
      return b;
    }
  }
  return brand;
}
