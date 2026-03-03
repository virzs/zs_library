import { xiaomiLeica } from "./xiaomi-leica";
export { formatXiaomiLeicaExifData } from "./xiaomi-leica";

export const availableTemplates = {
  xiaomiLeica,
};

export type TemplateKey = keyof typeof availableTemplates
