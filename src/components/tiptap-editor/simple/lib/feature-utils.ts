import { Level } from "../components/tiptap-ui/heading-button";
import { ImageUploadProps } from "./image-upload-handler";

export interface FeatureConfig<T = unknown> {
  enabled?: boolean;
  configure?: T;
}

export interface SimpleEditorFeatures {
  undoRedo?: boolean;
  heading?: boolean | FeatureConfig<{ levels?: Level[] }>;
  list?: boolean | FeatureConfig;
  blockquote?: boolean | FeatureConfig;
  codeBlock?: boolean | FeatureConfig;
  bold?: boolean | FeatureConfig;
  italic?: boolean | FeatureConfig;
  strike?: boolean | FeatureConfig;
  code?: boolean | FeatureConfig;
  underline?: boolean | FeatureConfig;
  highlight?: boolean | FeatureConfig<{ multicolor?: boolean }>;
  link?: boolean | FeatureConfig<{ openOnClick?: boolean; enableClickSelection?: boolean }>;
  subscript?: boolean | FeatureConfig;
  superscript?: boolean | FeatureConfig;
  textAlign?: boolean | FeatureConfig<{ types?: string[] }>;
  image?: boolean | FeatureConfig<ImageUploadProps>;
  themeToggle?: boolean;
}

export const isEnabled = (config: boolean | FeatureConfig | undefined, defaultValue = true) => {
  if (config === undefined) return defaultValue;
  if (typeof config === "boolean") return config;
  return config.enabled !== false;
};

export const getConfig = <T>(config: boolean | FeatureConfig<T> | undefined) => {
  if (typeof config === "object") return config.configure;
  return undefined;
};
