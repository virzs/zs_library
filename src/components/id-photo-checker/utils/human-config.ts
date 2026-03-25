import type { Config } from "@vladmandic/human";

const DEFAULT_CDN_PATH =
  "https://cdn.jsdelivr.net/npm/@vladmandic/human/models/";

export function createHumanConfig(
  modelBasePath: string = DEFAULT_CDN_PATH,
): Partial<Config> {
  return {
    modelBasePath,
    backend: "webgl" as const,
    async: true,
    warmup: "face",
    cacheSensitivity: 0.7,
    filter: {
      enabled: true,
      equalization: false,
      flip: false,
    },
    face: {
      enabled: true,
      detector: {
        enabled: true,
        maxDetected: 5,
        rotation: true,
        minConfidence: 0.3,
        return: true,
      },
      mesh: {
        enabled: true,
        keepInvalid: false,
      },
      iris: {
        enabled: false,
      },
      emotion: {
        enabled: false,
      },
      description: {
        enabled: false,
      },
      antispoof: {
        enabled: false,
      },
      liveness: {
        enabled: false,
      },
    },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: {
      enabled: true,
    },
    segmentation: { enabled: false },
  };
}
