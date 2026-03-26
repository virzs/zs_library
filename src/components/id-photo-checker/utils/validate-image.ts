import { Human } from "@vladmandic/human";
import { createHumanConfig } from "./human-config";
import type { ValidatableImage } from "../types";

let humanSingleton: Human | null = null;
let humanReadyPromise: Promise<Human> | null = null;

export function getHumanInstance(modelBasePath?: string): Promise<Human> {
  if (humanSingleton) return Promise.resolve(humanSingleton);
  if (humanReadyPromise) return humanReadyPromise;

  humanReadyPromise = (async () => {
    const config = createHumanConfig(modelBasePath);
    const human = new Human(config);
    await human.load();
    await human.warmup();
    humanSingleton = human;
    return human;
  })();

  return humanReadyPromise;
}

export function resolveToImageElement(
  input: ValidatableImage,
): Promise<HTMLImageElement | HTMLCanvasElement | ImageData> {
  // File / Blob → object URL → HTMLImageElement
  if (input instanceof File || input instanceof Blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(input);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("无法加载图片文件"));
      };
      img.src = url;
    });
  }
  // string (URL or base64) → HTMLImageElement
  if (typeof input === "string") {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`无法加载图片：${input}`));
      img.src = input;
    });
  }
  // HTMLImageElement / HTMLVideoElement / HTMLCanvasElement / ImageData — pass through
  return Promise.resolve(
    input as HTMLImageElement | HTMLCanvasElement | ImageData,
  );
}
