interface ExifData {
  tag: string;
  value: string;
  value_with_unit: string;
}

interface WasmExifModule {
  default: (wasmPath?: string | URL | undefined) => Promise<unknown>;
  get_exif: (imageData: Uint8Array) => unknown;
}

let wasmModulePromise: Promise<WasmExifModule | null> | null = null;
let wasmModuleRef: WasmExifModule | null = null;

const normalizeExifResult = (raw: unknown): ExifData[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const exifItem = item as Record<string, unknown>;
      return {
        tag: typeof exifItem.tag === "string" ? exifItem.tag : "",
        value: typeof exifItem.value === "string" ? exifItem.value : "",
        value_with_unit:
          typeof exifItem.value_with_unit === "string"
            ? exifItem.value_with_unit
            : "",
      };
    })
    .filter((item): item is ExifData => Boolean(item && item.tag));
};

const loadWasmModule = async (): Promise<WasmExifModule | null> => {
  if (!wasmModulePromise) {
    wasmModulePromise = (async () => {
      try {
        const wasmModule =
          (await import("./gen_brand_photo_pictrue.js")) as unknown as WasmExifModule;

        await wasmModule.default();
        console.info("[PhotoWatermark] WASM EXIF parser initialized");
        wasmModuleRef = wasmModule;
        return wasmModule;
      } catch (error) {
        console.warn(
          "[PhotoWatermark] WASM EXIF parser unavailable, fallback to empty EXIF",
          error,
        );
        return null;
      }
    })();
  }
  return wasmModulePromise;
};

const loadImageBytes = async (imageSource: string | File): Promise<Uint8Array> => {
  if (typeof imageSource === "string") {
    const response = await fetch(imageSource);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
  const arrayBuffer = await imageSource.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

export async function initWasm() {
  return loadWasmModule();
}

export function getExifData(imageData: Uint8Array): ExifData[] {
  if (!wasmModuleRef) {
    return [];
  }
  const raw = wasmModuleRef.get_exif(imageData);
  return normalizeExifResult(raw);
}

export async function parseImageExif(
  imageSource: string | File,
): Promise<ExifData[]> {
  const wasmModule = await loadWasmModule();
  if (!wasmModule) {
    return [];
  }

  const bytes = await loadImageBytes(imageSource);
  const raw = wasmModule.get_exif(bytes);
  return normalizeExifResult(raw);
}
