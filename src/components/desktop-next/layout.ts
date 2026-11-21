import { getItemSize } from "./config";
import type {
  ComponentRegistry, DndPageItem, DndSortItem, GridPosition,
  LegacyDesktopPage, PositionedItem, TypeConfigMap,
} from "./types";

export interface LayoutOptions {
  columns: number;
  rows: number;
  autoPaginate?: boolean;
  maxPages?: number;
  typeConfigMap?: TypeConfigMap;
}

export interface DesktopMigrationOptions extends Omit<LayoutOptions, "rows"> {
  /** 省略时按原页面划分，只补充坐标。 */
  rows?: number;
  componentRegistry?: ComponentRegistry;
}

type Rectangle = GridPosition & { width: number; height: number };

function positiveInteger(value: number) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError("桌面网格的行列数必须是正整数");
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isPosition(value: unknown): value is GridPosition {
  return isRecord(value)
    && typeof value.row === "number" && Number.isSafeInteger(value.row) && value.row >= 0
    && typeof value.col === "number" && Number.isSafeInteger(value.col) && value.col >= 0;
}

function hasId(value: Record<string, unknown>) {
  return typeof value.id === "string" || typeof value.id === "number";
}

function isItem(value: unknown): boolean {
  return isRecord(value) && hasId(value) && typeof value.type === "string"
    && (value.children === undefined || (Array.isArray(value.children) && value.children.every(isItem)));
}

export function isDesktopPages(value: unknown): value is DndPageItem[] {
  return Array.isArray(value) && value.every(page =>
    isRecord(page) && hasId(page) && Array.isArray(page.children)
    && (page.overflowOf === undefined || typeof page.overflowOf === "string" || typeof page.overflowOf === "number")
    && page.children.every(item => isItem(item) && isPosition(item.position)
      && (item.preferredPosition === undefined || isPosition(item.preferredPosition))));
}

/** 网格较小时，按当前可用行列裁定显示跨度。项目配置仍保留原尺寸。 */
export function getLayoutSpan(item: DndSortItem, options: LayoutOptions): GridPosition {
  const span = getItemSize(item.type, item.config?.sizeId, options.typeConfigMap);
  return {
    col: Math.min(positiveInteger(span.col), positiveInteger(options.columns)),
    row: Math.min(positiveInteger(span.row), positiveInteger(options.rows)),
  };
}

function rectanglesOverlap(a: Rectangle, b: Rectangle) {
  return a.col < b.col + b.width && a.col + a.width > b.col
    && a.row < b.row + b.height && a.row + a.height > b.row;
}

function rectangle(position: GridPosition, span: GridPosition): Rectangle {
  return { ...position, width: span.col, height: span.row };
}

function fits(area: Rectangle, occupied: Rectangle[], columns: number, rows: number) {
  return isPosition(area) && area.col + area.width <= columns && area.row + area.height <= rows
    && occupied.every(other => !rectanglesOverlap(area, other));
}

/** 从起点逐行查找可容纳完整项目的矩形。跳过已占用区域。 */
function firstFree(
  occupied: Rectangle[], span: GridPosition, columns: number, rows: number,
  start: GridPosition = { row: 0, col: 0 },
): GridPosition | null {
  for (let row = start.row; row + span.row <= rows; row++) {
    let col = row === start.row ? start.col : 0;
    while (col + span.col <= columns) {
      const area = rectangle({ row, col }, span);
      const obstacle = occupied.find(other => rectanglesOverlap(area, other));
      if (!obstacle) return { row, col };
      col = obstacle.col + obstacle.width;
    }
  }
  return null;
}

function otherRectangles(children: PositionedItem[], item: DndSortItem, options: LayoutOptions) {
  return children.filter(child => child.id !== item.id)
    .map(child => rectangle(child.position, getLayoutSpan(child, options)));
}

export function canPlaceItem(children: PositionedItem[], item: DndSortItem, position: GridPosition, options: LayoutOptions) {
  return fits(rectangle(position, getLayoutSpan(item, options)), otherRectangles(children, item, options),
    options.columns, options.autoPaginate === false ? Infinity : options.rows);
}

export function findFreePosition(children: PositionedItem[], item: DndSortItem, options: LayoutOptions) {
  return firstFree(otherRectangles(children, item, options), getLayoutSpan(item, options),
    options.columns, options.autoPaginate === false ? Infinity : options.rows);
}

/** 从目标区域逐格推开图标，前方接触到的项目一起让位。每个方向都从原布局试算。 */
export function pushBlockNeighbors(
  moved: PositionedItem, neighbors: PositionedItem[], covered: PositionedItem[],
  options: LayoutOptions, origin?: GridPosition,
): PositionedItem[] | null {
  if (!covered.length) return null;
  const target = rectangle(moved.position, getLayoutSpan(moved, options));
  const areas = new Map(neighbors.map(item =>
    [item, rectangle(item.position, getLayoutSpan(item, options))] as const));
  const maxRow = options.autoPaginate === false ? Infinity : options.rows;

  function tryPush(dx: number, dy: number) {
    const cluster = new Map(covered.map(item => [item, areas.get(item)!]));
    while (Array.from(cluster.values()).some(area => rectanglesOverlap(area, target))) {
      // Map 会继续遍历本步新加入的邻项，直到一整列或一整行都能移动。
      for (const area of cluster.values()) {
        const next = { ...area, col: area.col + dx, row: area.row + dy };
        if (next.col < 0 || next.row < 0 || next.col + next.width > options.columns ||
            next.row + next.height > maxRow) return null;
        for (const [item, obstacle] of areas) {
          if (!cluster.has(item) && rectanglesOverlap(next, obstacle)) cluster.set(item, obstacle);
        }
      }
      for (const [item, area] of cluster) {
        cluster.set(item, { ...area, col: area.col + dx, row: area.row + dy });
      }
    }
    return [moved, ...neighbors.map(item => {
      const area = cluster.get(item);
      return area ? positionItem(item, { row: area.row, col: area.col }) : item;
    })];
  }

  // 同页先向图标腾出的方向推。该方向越界时，尝试反向及另一条轴。
  const dx = origin ? origin.col - target.col : 0;
  const dy = origin ? origin.row - target.row : 0;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const x = Math.sign(dx) || 1;
  const y = Math.sign(dy) || 1;
  const directions = horizontal
    ? [[x, 0], [-x, 0], [0, y], [0, -y]]
    : [[0, y], [0, -y], [x, 0], [-x, 0]];
  for (const [col, row] of directions) {
    const result = tryPush(col, row);
    if (result) return result;
  }
  return null;
}

/** 为被大图标覆盖的项目寻找最近空位。优先整体平移，保留它们之间的相对位置。 */
export function relocateBlockNeighbors(
  items: PositionedItem[], stationary: PositionedItem[], options: LayoutOptions,
  preferredOffset: GridPosition = { col: 0, row: 0 },
) {
  if (!items.length) return [];
  const areaOf = (item: PositionedItem) => rectangle(item.position, getLayoutSpan(item, options));
  const occupied = stationary.map(areaOf);

  function translate(group: PositionedItem[]) {
    const areas = group.map(areaOf);
    const left = Math.min(...areas.map(a => a.col));
    const top = Math.min(...areas.map(a => a.row));
    const right = Math.max(...areas.map(a => a.col + a.width));
    const bottom = Math.max(...areas.map(a => a.row + a.height));
    // 可滚动页只需搜索到最后一个占用格之后，那里已能放下整组。
    const rows = options.autoPaginate === false
      ? Math.max(options.rows, bottom + preferredOffset.row, ...occupied.map(a => a.row + a.height)) + bottom - top
      : options.rows;
    let best: GridPosition | undefined;
    let bestDistance = Infinity;
    for (let dy = -top; dy <= rows - bottom; dy++) {
      for (let dx = -left; dx <= options.columns - right; dx++) {
        const distance = (dx - preferredOffset.col) ** 2 + (dy - preferredOffset.row) ** 2;
        if (distance >= bestDistance) continue;
        if (areas.every(a => fits({ ...a, col: a.col + dx, row: a.row + dy }, occupied, options.columns, rows))) {
          bestDistance = distance;
          best = { row: dy, col: dx };
        }
      }
    }
    if (!best) return null;
    const offset = best;
    return group.map(item => positionItem(item, {
      row: item.position.row + offset.row, col: item.position.col + offset.col,
    }));
  }

  const together = translate(items);
  if (together || items.length === 1) return together;
  // 只有零散空位时先安置占格较大的项目，单格图标可以利用剩余空间。
  const area = (item: PositionedItem) => {
    const { width, height } = areaOf(item);
    return width * height;
  };
  const result: PositionedItem[] = [];
  for (const item of [...items].sort((a, b) => area(b) - area(a))) {
    const placed = translate([item]);
    if (!placed) return null;
    result.push(placed[0]);
    occupied.push(areaOf(placed[0]));
  }
  return result;
}

function createPageIdGenerator(pages: { id: string | number }[]) {
  const ids = new Set(pages.map(page => String(page.id)));
  let nextId = 1;
  return () => {
    let id: string;
    do { id = `desktop-overflow-${nextId++}`; } while (ids.has(id));
    return id;
  };
}

function reusePagesIfUnchanged<D>(pages: DndPageItem<D>[], results: DndPageItem<D>[]) {
  const unchanged = results.length === pages.length && results.every((page, i) =>
    page.id === pages[i].id && page.overflowOf === pages[i].overflowOf && page.children.length === pages[i].children.length
    && page.children.every((item, j) => item === pages[i].children[j]));
  return unchanged ? pages : results;
}

function checkInput(pages: unknown, options: LayoutOptions) {
  positiveInteger(options.columns);
  positiveInteger(options.rows);
  if (!isDesktopPages(pages)) {
    throw new TypeError("DesktopNext 需要带有 position 的桌面项目。请先用 convertLegacyDesktopPages 转换旧数据。");
  }
}

function equalPosition(a: GridPosition | undefined, b: GridPosition | undefined) {
  return a?.row === b?.row && a?.col === b?.col;
}

function positionItem<D>(item: PositionedItem<D>, position: GridPosition, preferredPosition?: GridPosition) {
  if (equalPosition(item.position, position) && equalPosition(item.preferredPosition, preferredPosition)) return item;
  const updated = { ...item, position };
  if (preferredPosition) updated.preferredPosition = preferredPosition;
  else delete updated.preferredPosition;
  return updated;
}

/** 同一手动页及其自动页共享容量，其他手动页仍独立布局。 */
function fitPageGroup<D>(home: DndPageItem<D>, overflow: DndPageItem<D>[], pageLimit: number,
  options: LayoutOptions, createId: () => string) {
  const rows = options.autoPaginate === false ? Infinity : options.rows;
  const results: DndPageItem<D>[] = [{ ...home, children: [] }];
  const occupied: Rectangle[][] = [[]];
  const pending: { item: PositionedItem<D>; span: GridPosition; desired: GridPosition }[] = [];

  // 先为手动摆放的项目保留位置，再恢复此前随窗口缩小而移动的项目。
  const items = [
    ...home.children.filter(item => !item.preferredPosition),
    ...home.children.filter(item => item.preferredPosition),
    ...overflow.flatMap(page => page.children),
  ];
  for (const item of items) {
    const span = getLayoutSpan(item, options);
    const desired = item.preferredPosition ?? item.position;
    const area = rectangle(desired, span);
    if (fits(area, occupied[0], options.columns, pageLimit === 1 ? Infinity : rows)) {
      occupied[0].push(area);
      results[0].children.push(positionItem(item, desired));
    } else {
      pending.push({ item, span, desired });
    }
  }
  for (const { item, span, desired } of pending) {
    for (let index = 0; ; index++) {
      if (index === results.length) {
        const previous = overflow[index - 1];
        results.push({ ...previous, id: previous?.id ?? createId(), overflowOf: home.id, children: [] });
        occupied.push([]);
      }
      const availableRows = index + 1 >= pageLimit ? Infinity : rows;
      const position = firstFree(occupied[index], span, options.columns, availableRows);
      if (position) {
        occupied[index].push(rectangle(position, span));
        results[index].children.push(positionItem(item, position, desired));
        break;
      }
    }
  }
  return results;
}

export function layoutDesktopPages<D>(pages: DndPageItem<D>[], options: LayoutOptions): DndPageItem<D>[] {
  checkInput(pages, options);
  const manualIds = new Set(pages.filter(page => page.overflowOf === undefined).map(page => page.id));
  const owners: DndPageItem<D>[] = [];
  const overflowByOwner = new Map<DndPageItem["id"], DndPageItem<D>[]>();
  for (const page of pages) {
    if (page.overflowOf !== undefined && manualIds.has(page.overflowOf)) {
      const overflow = overflowByOwner.get(page.overflowOf) ?? [];
      overflow.push(page);
      overflowByOwner.set(page.overflowOf, overflow);
    } else {
      // 外部删除了源页时，保留其余页面的数据。
      const owner = page.overflowOf === undefined ? page : { ...page };
      if (owner !== page) delete owner.overflowOf;
      owners.push(owner);
    }
  }
  const createId = createPageIdGenerator(pages);
  let availableExtraPages = options.maxPages && options.maxPages > 0
    ? Math.max(0, options.maxPages - owners.length) : Infinity;
  const results: DndPageItem<D>[] = [];
  for (const owner of owners) {
    const group = fitPageGroup(owner, overflowByOwner.get(owner.id) ?? [], 1 + availableExtraPages, options, createId);
    results.push(...group);
    availableExtraPages -= group.length - 1;
  }
  return reusePagesIfUnchanged(pages, results);
}

function packItems<D>(pages: DndPageItem<D>[], items: PositionedItem<D>[], options: LayoutOptions) {
  const createId = createPageIdGenerator(pages);
  const pageLimit = options.maxPages && options.maxPages > 0 ? options.maxPages : Infinity;
  const results: DndPageItem<D>[] = [{ ...pages[0], children: [] }];
  const occupied: Rectangle[][] = [[]];
  for (const item of items) {
    const span = getLayoutSpan(item, options);
    for (let i = 0; ; i++) {
      if (i === results.length) {
        results.push({ ...(pages[i] ?? { id: createId() }), overflowOf: pages[0].id, children: [] });
        occupied.push([]);
      }
      const extend = options.autoPaginate === false || i + 1 >= pageLimit;
      const position = firstFree(occupied[i], span, options.columns, extend ? Infinity : options.rows);
      if (!position) continue;
      occupied[i].push(rectangle(position, span));
      results[i].children.push(positionItem(item, position));
      break;
    }
  }
  return reusePagesIfUnchanged(pages, results);
}

/** 按当前阅读顺序整理桌面，填补空位并移除多余页面。 */
export function arrangeDesktopPages<D>(pages: DndPageItem<D>[], options: LayoutOptions): DndPageItem<D>[] {
  checkInput(pages, options);
  if (pages.length === 0) return pages;
  const inputOrder = pages.flatMap(page => page.children);
  const packed = packItems(pages, inputOrder, options);
  // 回填小项目后，阅读顺序可能与放置顺序不同。已排紧的页面保留现有位置。
  if (packed === pages) return pages;
  const byPosition = (a: PositionedItem, b: PositionedItem) =>
    a.position.row - b.position.row || a.position.col - b.position.col;
  const readingOrder = pages.flatMap(page => [...page.children].sort(byPosition));
  return readingOrder.every((item, i) => item === inputOrder[i]) ? packed : packItems(pages, readingOrder, options);
}

/** 将旧版桌面的顺序布局转换为坐标。columns 应使用旧布局的实际列数。 */
export function convertLegacyDesktopPages<D>(pages: readonly LegacyDesktopPage<D>[], options: DesktopMigrationOptions): DndPageItem<D>[] {
  const layout: LayoutOptions = {
    ...options,
    columns: positiveInteger(options.columns),
    rows: positiveInteger(options.rows ?? Number.MAX_SAFE_INTEGER),
    typeConfigMap: { ...options.componentRegistry, ...options.typeConfigMap },
  };
  const converted = pages.map(page => {
    const occupied: Rectangle[] = [];
    let cursor = { row: 0, col: 0 };
    const children = page.children.map(item => {
      const span = getLayoutSpan(item, layout);
      // 旧网格使用 CSS Grid 的逐行排列规则，从上一项之后继续查找。
      const position = firstFree(occupied, span, layout.columns, Infinity, cursor)!;
      occupied.push(rectangle(position, span));
      cursor = { row: position.row, col: position.col + span.col };
      return { ...item, position };
    });
    return { ...page, children };
  });
  return layoutDesktopPages(converted, layout);
}
