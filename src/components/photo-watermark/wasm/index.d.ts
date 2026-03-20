export interface ExifData {
  tag: string
  value: string
  value_with_unit: string
}

export declare function initWasm(): Promise<unknown>
export declare function getExifData(imageData: Uint8Array): ExifData[]
export declare function parseImageExif(imageSource: string | File): Promise<ExifData[]>
