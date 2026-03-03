import appleBrand from "../brand/apple.svg";
import canonBrand from "../brand/canon.svg";
import djiBrand from "../brand/dji.svg";
import fujifilmBrand from "../brand/fujifilm.svg";
import huaweiBrand from "../brand/huawei.svg";
import insta360Brand from "../brand/insta360.svg";
import leicaBrand from "../brand/leica.svg";
import nikonBrand from "../brand/nikon corporation.svg";
import olympusBrand from "../brand/olympus.svg";
import panasonicBrand from "../brand/panasonic.svg";
import ricohBrand from "../brand/ricoh.svg";
import sonyBrand from "../brand/sony.svg";
import unknownBrand from "../brand/unknow.svg";
import xiaomiBrand from "../brand/xiaomi.svg";

const BRAND_URL_MAP: Record<string, string> = {
  apple: appleBrand,
  canon: canonBrand,
  dji: djiBrand,
  fujifilm: fujifilmBrand,
  huawei: huaweiBrand,
  insta360: insta360Brand,
  leica: leicaBrand,
  nikon: nikonBrand,
  "nikon corporation": nikonBrand,
  olympus: olympusBrand,
  panasonic: panasonicBrand,
  ricoh: ricohBrand,
  sony: sonyBrand,
  xiaomi: xiaomiBrand,
};

export function getBrandUrl(brand: string): string {
  return BRAND_URL_MAP[brand.toLowerCase()] || unknownBrand;
}
