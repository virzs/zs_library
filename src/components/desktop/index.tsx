/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, JSX, useEffect } from "react";
import Sortable, { SortableProps } from "./sortable";
import {
  SortableConfigProvider,
  SortableConfigProviderProps,
  SortableConfig,
} from "./context/config/context";
import {
  SortableStateProvider,
  SortableStateProviderProps,
  SortableState,
} from "./context/state/context";
import { useSortableState } from "./context/state/hooks";
import { useSortableConfig } from "./context/config/hooks";

export interface DesktopProps<D = any, C = any>
  extends SortableProps<D, C>,
    Omit<SortableStateProviderProps<D, C>, "children">,
    Omit<SortableConfigProviderProps<D, C>, "children"> {}

// 导出访问实例的接口
export interface DesktopHandle<D = any, C = any> {
  state: SortableState;
  config: SortableConfig<D, C>;
}

// 使用 forwardRef 创建组件，允许父组件访问内部 state 和 config
const Desktop = forwardRef(
  <D, C>(
    props: DesktopProps<D, C>,
    ref: React.ForwardedRef<DesktopHandle<D, C>>
  ) => {
    const {
      list,
      onChange,
      storageKey,
      enableCaching,
      theme,
      noLetters,
      contextMenu,
      contextMenuBuilder,
      itemBuilder,
      itemIconBuilder,
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
      contextMenu,
      pagingDotsBuilder,
      pagingDotBuilder,
      itemBuilder,
      itemIconBuilder,
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
      <SortableStateProvider<D, C> {...stateProps}>
        <SortableConfigProvider<D, C> {...configProps}>
          <StateAndConfigAccessor />
          <Sortable<D, C> {...rest} />
        </SortableConfigProvider>
      </SortableStateProvider>
    );
  }
) as <D = any, C = any>(
  props: DesktopProps<D, C> & { ref?: React.ForwardedRef<DesktopHandle<D, C>> }
) => JSX.Element;

export default Desktop;
