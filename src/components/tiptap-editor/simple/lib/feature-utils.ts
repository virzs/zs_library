import { Level } from "../components/tiptap-ui/heading-button";
import { ListType } from "../components/tiptap-ui/list-button";
import { HighlightColor } from "../components/tiptap-ui/color-highlight-button";
import { ImageUploadProps } from "./image-upload-handler";
import { AiCompletionOptions } from "./ai-service";

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

export interface AiPreset {
  label: string;
  text: string;
  icon?: React.ReactNode;
}

export interface AiConfig extends BaseButtonConfig {
  defaultPrompt?: string;
  defaultModel?: string;
  systemPrompt?: string;
  presets?: AiPreset[];
  /**
   * The API Key for the AI service (e.g., DeepSeek, OpenAI).
   */
  apiKey?: string;
  /**
   * The Base URL for the AI service API.
   * Default: "https://api.deepseek.com"
   */
  baseUrl?: string;
  /**
   * The model to use for completion.
   * Default: "deepseek-chat"
   */
  model?: string;

  /**
   * Custom request headers
   */
  headers?: Record<string, string>;
  /**
   * Custom query parameters to append to the URL
   */
  params?: Record<string, string>;
  /**
   * Additional body parameters to merge with the request body
   */
  body?: Record<string, unknown>;

  /**
   * Custom request function to completely override the default behavior.
   * If provided, it should handle the API call and return the generated text.
   * For streaming, it should call `onUpdate` with the accumulating text.
   */
  request?: (options: AiCompletionOptions) => Promise<string>;

  /**
   * Custom function to transform the response.
   * Useful if using a custom `request` or if the API returns a different format.
   * Not used if `request` is provided and handles everything, but can be used
   * if `request` returns a raw object that needs parsing.
   *
   * Actually, for the default implementation, we parse OpenAI-compatible stream.
   * If the user wants to transform the final result or chunks, this might be tricky with streaming.
   * Let's stick to `request` override for full control.
   * But maybe `transformResponse` is for the final string?
   */
  // transformResponse?: (response: any) => string; // Maybe not needed if `request` override exists.

  /**
   * Callback when the AI generation starts.
   */
  onStart?: () => void;
  /**
   * Callback when the AI generation is successful.
   */
  onSuccess?: (content: string) => void;
  /**
   * Callback when the AI generation fails.
   */
  onError?: (error: Error) => void;
}

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
  ai?: boolean | FeatureConfig<AiConfig>;
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
