import { Level } from "../components/tiptap-ui/heading-button";
import { ListType } from "../components/tiptap-ui/list-button";
import { HighlightColor } from "../components/tiptap-ui/color-highlight-button";
import { ImageUploadProps } from "./image-upload-handler";

export interface FeatureConfig<T = unknown> {
  enabled?: boolean;
  configure?: T;
}

export interface BaseButtonConfig {
  text?: string;
  showShortcut?: boolean;
  hideWhenUnavailable?: boolean;
}

export interface HeadingConfig extends BaseButtonConfig {
  levels?: Level[];
}

export interface ListConfig extends BaseButtonConfig {
  types?: ListType[];
}

export interface HighlightConfig extends BaseButtonConfig {
  multicolor?: boolean;
  colors?: HighlightColor[];
}

export interface LinkConfig extends BaseButtonConfig {
  openOnClick?: boolean;
  enableClickSelection?: boolean;
  autoOpenOnLinkActive?: boolean;
}

export interface TextAlignConfig extends BaseButtonConfig {
  types?: string[];
  alignments?: string[];
  defaultAlignment?: string;
}

export interface ImageConfig extends BaseButtonConfig, ImageUploadProps {}

export interface SimpleEditorFeatures {
  undoRedo?: boolean | FeatureConfig<BaseButtonConfig>;
  heading?: boolean | FeatureConfig<HeadingConfig>;
  list?: boolean | FeatureConfig<ListConfig>;
  blockquote?: boolean | FeatureConfig<BaseButtonConfig>;
  codeBlock?: boolean | FeatureConfig<BaseButtonConfig>;
  bold?: boolean | FeatureConfig<BaseButtonConfig>;
  italic?: boolean | FeatureConfig<BaseButtonConfig>;
  strike?: boolean | FeatureConfig<BaseButtonConfig>;
  code?: boolean | FeatureConfig<BaseButtonConfig>;
  underline?: boolean | FeatureConfig<BaseButtonConfig>;
  highlight?: boolean | FeatureConfig<HighlightConfig>;
  link?: boolean | FeatureConfig<LinkConfig>;
  subscript?: boolean | FeatureConfig<BaseButtonConfig>;
  superscript?: boolean | FeatureConfig<BaseButtonConfig>;
  textAlign?: boolean | FeatureConfig<TextAlignConfig>;
  image?: boolean | FeatureConfig<ImageConfig>;
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
