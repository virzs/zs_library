/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, JSX, useEffect } from "react";
import Sortable, { SortableProps } from "./sortable";
import { SortableConfigProvider, SortableConfigProviderProps, SortableConfig } from "./context/config/context";
import { SortableStateProvider, SortableStateProviderProps, SortableState } from "./context/state/context";
import { useSortableState } from "./context/state/hooks";
import { useSortableConfig } from "./context/config/hooks";
import GlobalContextMenu from "./context-menu/portal";

export interface DesktopProps<D = any, C = any>
  extends SortableProps<D, C>,
    Omit<SortableStateProviderProps<D, C>, "children">,
    Omit<SortableConfigProviderProps<D, C>, "children"> {
  /** 类型配置映射表，用于定义不同类型的默认配置 */
  typeConfigMap?: import("./types").TypeConfigMap;
  /** dataType菜单配置映射表，用于定义不同dataType的菜单项 */
  dataTypeMenuConfigMap?: import("./types").DataTypeMenuConfigMap;
}

// 导出访问实例的接口
export interface DesktopHandle<D = any, C = any> {
  state: SortableState;
  config: SortableConfig<D, C>;
}

// 使用 forwardRef 创建组件，允许父组件访问内部 state 和 config
const Desktop = forwardRef(<D, C>(props: DesktopProps<D, C>, ref: React.ForwardedRef<DesktopHandle<D, C>>) => {
  const {
    list,
    onChange,
    storageKey,
    enableCaching,
    theme,
    noLetters,
    typeConfigMap,
    contextMenu,
    contextMenuBuilder,
    itemBuilder,
    itemBuilderAllowNull,
    itemIconBuilder,
    itemIconBuilderAllowNull,
    pagingDotBuilder,
    pagingDotsBuilder,
    ...rest
  } = props;

  const stateProps: Omit<SortableStateProviderProps<D, C>, "children"> = {
    list,
    onChange,
    storageKey,
    enableCaching,
  };

  const configProps: Omit<SortableConfigProviderProps<D, C>, "children"> = {
    theme,
    noLetters,
    typeConfigMap,
    dataTypeMenuConfigMap: props.dataTypeMenuConfigMap,
    contextMenu,
    pagingDotsBuilder,
    pagingDotBuilder,
    itemBuilder,
    itemBuilderAllowNull,
    itemIconBuilder,
    itemIconBuilderAllowNull,
    contextMenuBuilder,
  };

  // 创建一个内部组件来访问上下文
  const StateAndConfigAccessor = () => {
    const state = useSortableState();
    const config = useSortableConfig();

    // 使用 useEffect 在每次渲染后更新引用
    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref({ state, config });
        } else {
          ref.current = { state, config };
        }
      }
    }, [state, config]);

    return null;
  };

  return (
    <SortableConfigProvider<D, C> {...configProps}>
      <SortableStateProvider<D, C> {...stateProps}>
        <StateAndConfigAccessor />
        <Sortable<D, C> {...rest} />
        <GlobalContextMenu<D, C> />
      </SortableStateProvider>
    </SortableConfigProvider>
  );
}) as <D = any, C = any>(props: DesktopProps<D, C> & { ref?: React.ForwardedRef<DesktopHandle<D, C>> }) => JSX.Element;

export type {
  SortItem,
  ListItem,
  SortItemBaseConfig,
  SortItemBaseData,
  SortItemDefaultConfig,
  SortItemUserConfig,
  SortableItemData,
  TypeConfigMap,
  SizeConfig,
  MenuItemConfig,
  DataTypeMenuConfigMap,
} from "./types";

export {
  appDefaultConfig as desktopAppDefaultConfig,
  groupDefaultConfig as desktopGroupDefaultConfig,
  builtinConfigMap as desktopBuiltinConfigMap,
  getDefaultConfig as getDesktopDefaultConfig,
  commonSizeConfigs as desktopCommonSizeConfigs,
  getSizeConfig as getDesktopSizeConfig,
  getItemSize as getDesktopItemSize,
  getDataTypeMenuConfig as getDesktopDataTypeMenuConfig,
} from "./config";

// 导出主题相关内容
export type { Theme, ThemeType } from "./themes";
export {
  themeLight as desktopThemeLight,
  themeDark as desktopThemeDark,
  defaultTheme as desktopDefaultTheme,
  themes as desktopThemes,
} from "./themes";

// 导出dock相关组件
export { Dock, LaunchpadModal, LaunchpadButton } from "./dock";
export type { DockProps, LaunchpadModalProps, LaunchpadButtonProps } from "./dock";

// 导出modal相关组件
export { BaseModal } from "./modal";
export type { BaseModalProps } from "./modal";

export default Desktop;
