import React, { Component } from "react";
import type { DndSortItem } from "../types";

type RemoteModule = { default: React.ComponentType<{ item: DndSortItem }> };

const modulePromiseCache = new Map<string, Promise<RemoteModule>>();

const remoteComponentCache = new Map<
  string,
  React.LazyExoticComponent<React.ComponentType<{ item: DndSortItem }>>
>();

async function fetchAndEvalModule(url: string): Promise<RemoteModule> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`[remote-loader] ${url} → ${res.status}`);
  const code = await res.text();

  const wrapped = code
    .replace(/export\s+default\s+/g, "__exports.default = ")
    .replace(
      /export\s*\{\s*(\w+)\s+as\s+default\s*\}/g,
      "__exports.default = $1",
    );

  // eslint-disable-next-line no-new-func
  const factory = new Function("__exports", "window", wrapped);
  const exports: { default?: React.ComponentType<{ item: DndSortItem }> } = {};
  factory(exports, window);

  if (!exports.default)
    throw new Error(`[remote-loader] ${url} has no default export`);
  return { default: exports.default };
}

function getModulePromise(url: string): Promise<RemoteModule> {
  if (!modulePromiseCache.has(url)) {
    modulePromiseCache.set(url, fetchAndEvalModule(url));
  }
  return modulePromiseCache.get(url)!;
}

export function loadRemoteComponent(
  url: string,
): React.LazyExoticComponent<React.ComponentType<{ item: DndSortItem }>> {
  if (!remoteComponentCache.has(url)) {
    remoteComponentCache.set(url, React.lazy(() => getModulePromise(url)));
  }
  return remoteComponentCache.get(url)!;
}

interface RemoteComponentErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

interface RemoteComponentErrorBoundaryState {
  error: Error | null;
}

export class RemoteComponentErrorBoundary extends Component<
  RemoteComponentErrorBoundaryProps,
  RemoteComponentErrorBoundaryState
> {
  constructor(props: RemoteComponentErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(
    error: Error,
  ): RemoteComponentErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      throw this.state.error;
    }
    return this.props.children;
  }
}
