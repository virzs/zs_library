/**
 * Alert block for the Editor.js.
 *
 * @author Vishal Telangre
 * @license MIT
 */

/**
 * Build styles
 */
import "./index.scss";

/**
 * Import Tool's icons
 */
import ToolboxIcon from "remixicon/icons/System/error-warning-line.svg?raw";
import ToolTypedIcon from "remixicon/icons/System/error-warning-fill.svg?raw";
import AlignLeftIcon from "remixicon/icons/Editor/align-left.svg?raw";
import AlignCenterIcon from "remixicon/icons/Editor/align-center.svg?raw";
import AlignRightIcon from "remixicon/icons/Editor/align-right.svg?raw";
import { API, PasteEvent } from "@editorjs/editorjs";

/**
 * @description Tool's input and output data format
 */
export interface AlertData {
  align?: string;
  type: string;
  message: string;
}

export interface ConstructorArgs {
  data: AlertData;
  config: {
    alertTypes: string[];
    defaultType: string;
    defaultAlign: string;
    messagePlaceholder: string;
  };
  api: API;
  readOnly: boolean;
}

export interface AlertCSS {
  wrapper: string;
  wrapperForType: (type: string) => string;
  wrapperForAlignType: (alignType: string) => string;
  message: string;
}

/**
 * @class Alert
 * @classdesc Alert Tool for Editor.js
 * @property {AlertData} data - Alert Tool`s input and output data
 * @property {object} api - Editor.js API instance
 *
 * @typedef {object} AlertData
 * @description Alert Tool`s input and output data
 * @property {string} type - Alert type
 * @property {string} alignType - Alert align type
 * @property {string} message - Alert message
 *
 * @typedef {object} AlertConfig
 * @description Alert Tool`s initial configuration
 * @property {string} defaultType - default Alert type
 * @property {string} defaultAlignType - default align Alert type
 * @property {string} messagePlaceholder - placeholder to show in Alert`s message input
 */
export default class Alert {
  /**
   * Editor.js API
   * @private
   */

  private api: API;
  /**
   * Read-only mode flag
   * @private
   */

  private readOnly: boolean;
  /**
   * Block's data
   * @private
   */
  private _data: AlertData;

  /**
   * Alert Tool's CSS classes
   */
  private _CSS: AlertCSS;

  private container: HTMLElement | undefined;

  private alertTypes: string[];

  private defaultType: string;

  private defaultAlign: string;

  private messagePlaceholder: string;

  /**
   * Get Toolbox settings
   *
   * @public
   * @returns {string}
   */
  static get toolbox() {
    return {
      icon: ToolboxIcon,
      title: "Alert",
    };
  }

  /**
   * Allow to press Enter inside the Alert block
   * @public
   * @returns {boolean}
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Default Alert type
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_TYPE() {
    return "info";
  }

  /**
   * Default Alert align type
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_ALIGN_TYPE() {
    return "left";
  }

  /**
   * Default placeholder for Alert message
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_MESSAGE_PLACEHOLDER() {
    return "Type here...";
  }

  /**
   * Supported Alert types
   *
   * @public
   * @returns {array}
   */
  static get ALERT_TYPES() {
    return [
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "danger",
      "light",
      "dark",
    ];
  }

  /**
   * Supported Align types
   *
   * @public
   * @returns {array}
   */
  static get ALIGN_TYPES() {
    return ["left", "center", "right"];
  }

  /**
   * Alert Tool`s styles
   *
   * @returns {Object}
   */
  get CSS() {
    return {
      wrapper: "cdx-alert",
      wrapperForType: (type: string) => `cdx-alert-${type}`,
      wrapperForAlignType: (alignType: string) =>
        `cdx-alert-align-${alignType}`,
      message: "cdx-alert__message",
    };
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {AlertData} data — previously saved data
   * @param {AlertConfig} config — user config for Tool
   * @param {Object} api - Editor.js API
   * @param {boolean} readOnly - read only mode flag
   */
  constructor({ data, config, api, readOnly }: ConstructorArgs) {
    this.api = api;

    this._CSS = this.CSS;

    this.alertTypes = config.alertTypes || Alert.ALERT_TYPES;
    this.defaultType = config.defaultType || Alert.DEFAULT_TYPE;
    this.defaultAlign = config.defaultAlign || Alert.DEFAULT_ALIGN_TYPE;
    this.messagePlaceholder =
      config.messagePlaceholder || Alert.DEFAULT_MESSAGE_PLACEHOLDER;

    this._data = {
      type: this.alertTypes.includes(data.type) ? data.type : this.defaultType,
      align: Alert.ALIGN_TYPES.includes(data.align!)
        ? data.align
        : this.defaultAlign,
      message: data.message || "",
    };

    this.container = undefined;

    this.readOnly = readOnly;
  }

  /**
   * Returns true to notify the core that read-only mode is supported
   *
   * @return {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Create Alert Tool container
   *
   * @returns {Element}
   */
  render() {
    const containerClasses = [
      this._CSS.wrapper,
      this._CSS.wrapperForType(this._data.type),
      this._CSS.wrapperForAlignType(this._data.align!),
    ];

    this.container = this._make("div", containerClasses);

    const messageEl = this._make("div", [this._CSS.message], {
      contentEditable: !this.readOnly ? "true" : "false",
      innerHTML: this._data.message,
    });

    messageEl.dataset.placeholder = this.messagePlaceholder;

    this.container.appendChild(messageEl);

    return this.container;
  }

  /**
   * Create Block's settings block
   *
   * @returns {array}
   */
  renderSettings() {
    const alertTypes = this.alertTypes.map((type) => ({
      icon: ToolTypedIcon,
      name: `alert-${type}`,
      label: this._getFormattedName(type),
      toggle: "alert",
      isActive: this._data.type === type,
      onActivate: () => {
        this._changeAlertType(type);
      },
    }));

    const alignTypes = Alert.ALIGN_TYPES.map((align) => ({
      icon:
        align == "left"
          ? AlignLeftIcon
          : align == "center"
          ? AlignCenterIcon
          : align == "right"
          ? AlignRightIcon
          : AlignLeftIcon,
      name: `align-${align}`,
      label: this._getFormattedName(align),
      toggle: "align",
      isActive: this._data.align === align,
      onActivate: () => {
        this._changeAlignType(align);
      },
    }));
    return [...alertTypes, ...alignTypes];
  }

  /**
   * Helper for formatting Alert Type / Align Type
   *
   * @param {string} type - Alert type or Align type
   * @returns {string}
   */
  _getFormattedName(name: string) {
    return this.api.i18n.t(name.charAt(0).toUpperCase() + name.slice(1));
  }

  /**
   * Helper for changing style of Alert block with the selected Alert type
   *
   * @param {string} newType - new Alert type to be applied to the block
   * @private
   */
  _changeAlertType(newType: string) {
    // Save new type
    this._data.type = newType;

    this.alertTypes.forEach((type) => {
      const alertClass = this._CSS.wrapperForType(type);

      // Remove the old Alert type class
      this.container?.classList.remove(alertClass);

      if (newType === type) {
        // Add an Alert class for the selected Alert type
        this.container?.classList.add(alertClass);
      }
    });
  }

  /**
   * Helper for changing align of Alert block with the selected Align type
   *
   * @param {string} newAlign - new align type to be applied to the block
   * @private
   */
  _changeAlignType(newAlign: string) {
    // Save new type
    this._data.align = newAlign;

    Alert.ALIGN_TYPES.forEach((align) => {
      const alignClass = this._CSS.wrapperForAlignType(align);

      // Remove the old Alert type class
      this.container?.classList.remove(alignClass);

      if (newAlign === align) {
        // Add an Alert class for the selected Alert type
        this.container?.classList.add(alignClass);
      }
    });
  }

  /**
   * Extract Alert data from Alert Tool element
   *
   * @param {HTMLDivElement} alertElement - element to save
   * @returns {AlertData}
   */
  save(alertElement: HTMLElement) {
    const messageEl = alertElement.querySelector(`.${this._CSS.message}`);

    return { ...this._data, message: messageEl?.innerHTML };
  }

  /**
   * Helper for making Elements with attributes
   *
   * @param  {string} tagName           - new Element tag name
   * @param  {array|string} classNames  - list or name of CSS classname(s)
   * @param  {Object} attributes        - any attributes
   * @returns {Element}
   * @private
   */
  _make(
    tagName: string,
    classNames: string[] | string | null = null,
    attributes: { [x: string]: string } = {}
  ) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'null'.
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
   * Fill Alert's message with the pasted content
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(event: PasteEvent) {
    // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'null'.
    const { data } = event.detail;

    this._data = {
      type: this.defaultType,
      message: data.innerHTML || "",
    };
  }

  /**
   * Allow Alert to be converted to/from other blocks
   */
  static get conversionConfig() {
    return {
      // export Alert's message for other blocks
      export: (data: { message: string }) => data.message,
      // fill Alert's message from other block's export string
      import: (string: string) => {
        return {
          message: string,
          type: this.DEFAULT_TYPE,
          alignType: this.DEFAULT_ALIGN_TYPE,
        };
      },
    };
  }

  /**
   * Sanitizer config for Alert Tool saved data
   * @returns {Object}
   */
  static get sanitize() {
    return {
      message: true,
      type: false,
      alignType: false,
    };
  }
}
