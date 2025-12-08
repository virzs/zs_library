import { handleImageUpload as mockImageUpload } from "./tiptap-utils";

export type RequestMethod = "POST" | "PUT" | "PATCH" | "post" | "put" | "patch";

export interface UploadRequestOption {
  action: string;
  file: File;
  headers?: Record<string, string>;
  onError: (error: Error) => void;
  onProgress: (event: { percent: number }) => void;
  onSuccess: (body: unknown) => void;
  withCredentials?: boolean;
}

export interface ImageUploadProps {
  /** Upload URL */
  action?: string | ((file: File) => Promise<string>);
  /** HTTP method */
  method?: RequestMethod;
  /** Request headers */
  headers?: Record<string, string> | ((file: File) => Record<string, string> | Promise<Record<string, string>>);
  /** File parameter name */
  name?: string;
  /** Extra parameters */
  data?: Record<string, unknown> | ((file: File) => Record<string, unknown> | Promise<Record<string, unknown>>);
  /** Send cookies */
  withCredentials?: boolean;
  /** Format response to image url */
  formatResult?: (response: unknown) => string;
  /** Custom request implementation */
  customRequest?: (options: UploadRequestOption) => void;
}

interface UploadHandlerParams {
  file: File;
  onProgress?: (event: { progress: number }) => void;
  imageProps?: ImageUploadProps;
}

/**
 * Handles image upload logic based on provided props.
 * Defaults to fetch for network requests if action is provided.
 * Falls back to mock upload if no action or customRequest is provided.
 */
export const handleImageUploadRequest = async ({
  file,
  onProgress,
  imageProps,
}: UploadHandlerParams): Promise<string> => {
  // 1. If no props provided, use mock upload
  if (!imageProps) {
    return mockImageUpload(file, onProgress);
  }

  // 2. If customRequest is provided, use it
  if (imageProps.customRequest) {
    return new Promise((resolve, reject) => {
      if (!imageProps.customRequest) return; // Should not happen due to check above, but for type safety

      imageProps.customRequest({
        file,
        action: typeof imageProps.action === "string" ? imageProps.action : "",
        headers: {}, // Will be filled by user in customRequest if needed, or we could resolve headers here too if we wanted to support mixed usage
        withCredentials: imageProps.withCredentials,
        onError: (err: Error) => reject(err),
        onProgress: (e: { percent: number }) => onProgress?.({ progress: e.percent }),
        onSuccess: (ret: unknown) => {
          if (typeof ret === "string") {
            resolve(ret);
          } else if (
            typeof ret === "object" &&
            ret !== null &&
            "url" in ret &&
            typeof (ret as { url: unknown }).url === "string"
          ) {
            resolve((ret as { url: string }).url);
          } else {
            // Fallback to creating object URL if response format is unknown but success is signaled
            // Ideally the user should return the URL string or an object with url property
            resolve(URL.createObjectURL(file));
          }
        },
      });
    });
  }

  // 3. If action is provided, use fetch
  if (imageProps.action) {
    try {
      const actionUrl = typeof imageProps.action === "function" ? await imageProps.action(file) : imageProps.action;
      const formData = new FormData();
      const fileName = imageProps.name || "file";
      formData.append(fileName, file);

      if (imageProps.data) {
        const extraData = typeof imageProps.data === "function" ? await imageProps.data(file) : imageProps.data;
        Object.entries(extraData || {}).forEach(([k, v]) => {
          // Ensure value is string or Blob, otherwise cast to string
          if (v instanceof Blob) {
            formData.append(k, v);
          } else {
            formData.append(k, String(v));
          }
        });
      }

      const headers = typeof imageProps.headers === "function" ? await imageProps.headers(file) : imageProps.headers;

      // Simulate start progress
      onProgress?.({ progress: 10 });

      const response = await fetch(actionUrl, {
        method: imageProps.method || "POST",
        headers: headers,
        body: formData,
        credentials: imageProps.withCredentials ? "include" : "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      // Simulate end progress
      onProgress?.({ progress: 100 });

      const json = (await response.json()) as unknown;

      if (imageProps.formatResult) {
        return imageProps.formatResult(json);
      }

      if (json && typeof json === "object") {
        // Try to find URL in common fields
        if ("url" in json && typeof (json as { url: unknown }).url === "string") {
          return (json as { url: string }).url;
        }
        if (
          "data" in json &&
          typeof (json as { data: unknown }).data === "object" &&
          (json as { data: { url?: unknown } }).data &&
          "url" in (json as { data: { url?: unknown } }).data! &&
          typeof ((json as { data: { url?: unknown } }).data as { url: string }).url === "string"
        ) {
          return ((json as { data: { url?: string } }).data as { url: string }).url;
        }
        if ("link" in json && typeof (json as { link: unknown }).link === "string") {
          return (json as { link: string }).link;
        }
      }

      // If we can't find a URL in the response, fall back to object URL
      // (Or maybe we should throw? But standard behavior often tries to be helpful)
      return URL.createObjectURL(file);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Upload failed");
    }
  }

  // 4. Fallback to mock upload if nothing matches
  return mockImageUpload(file, onProgress);
};
