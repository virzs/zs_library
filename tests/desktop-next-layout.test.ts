import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  arrangeDesktopPages, canPlaceItem, convertLegacyDesktopPages, findFreePosition,
  getLayoutSpan, isDesktopPages, layoutDesktopPages, pushBlockNeighbors, relocateBlockNeighbors,
} from "../src/components/desktop-next/layout";
import type { DndPageItem, PositionedItem } from "../src/components/desktop-next/types";

const app = (id: string, row: number, col: number): PositionedItem =>
  ({ id, type: "app", position: { row, col } });
const widget = (id: string, row: number, col: number): PositionedItem =>
  ({ ...app(id, row, col), type: "group", config: { sizeId: "2x2" } });
const grid = { rows: 2, columns: 3 };

test("迁移旧网格时保留逐行排列顺序和文件夹内容", () => {
  const nested = [{ id: "child", type: "app", data: { name: "A" } }];
  const legacy = [{ id: "one", children: [
    { id: "1", type: "app" }, { id: "2", type: "app" },
    { id: "3", type: "group", children: nested, config: { sizeId: "2x2" } },
    { id: "4", type: "app" },
  ] }];
  const [page] = convertLegacyDesktopPages(legacy, { columns: 3 });
  assert.deepEqual(page.children.map(item => item.position), [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 },
  ]);
  assert.equal(page.children[2].children, nested);
  assert.equal("position" in legacy[0].children[0], false);
  assert.equal(isDesktopPages(legacy), false);
  assert.throws(() => layoutDesktopPages(legacy as DndPageItem[], grid), /convertLegacyDesktopPages/);
  assert.equal(isDesktopPages([page]), true);
});

test("越界项目避开后续项目的有效坐标并按实际跨度分页", () => {
  const pages = [{ id: "one", children: [widget("w", 1, 2), app("a", 0, 1), app("b", 1, 1)] }];
  const resolved = layoutDesktopPages(pages, grid);
  assert.equal(resolved.length, 2);
  assert.deepEqual(resolved[0].children.map(i => i.id), ["a", "b"]);
  assert.deepEqual(resolved[1].children[0].position, { row: 0, col: 0 });
  assert.deepEqual(pages[0].children[0].position, { row: 1, col: 2 });
  assert.equal(layoutDesktopPages(resolved, grid), resolved);
  assert.deepEqual(layoutDesktopPages(pages, grid), resolved);
  assert.equal(findFreePosition(resolved[0].children, widget("w", 0, 0), grid), null);
  assert.equal(canPlaceItem(resolved[0].children, app("a", 0, 1), { row: 0, col: 1 }, grid), true);
});

test("页数上限和超大组件仍允许访问全部项目，并产生稳定结果", () => {
  const pages = [{ id: "desktop-overflow-1", children: [
    app("a", 0, 0), app("b", 0, 0), app("c", 0, 0), widget("w", 0, 0),
  ] }];
  const options = { rows: 1, columns: 1, maxPages: 2 };
  const resolved = layoutDesktopPages(pages, options);
  assert.equal(resolved.length, 2);
  assert.equal(resolved[1].id, "desktop-overflow-2");
  assert.deepEqual(resolved[1].children.map(i => [i.id, i.position.row]), [["b", 0], ["c", 1], ["w", 2]]);
  assert.deepEqual(getLayoutSpan(resolved[1].children[2], options), { row: 1, col: 1 });
  assert.equal(layoutDesktopPages(resolved, options), resolved);
});

test("手动整理按阅读顺序放置项目，删除空页并合并有余量的页", () => {
  const pages = [
    { id: "first", children: [app("b", 1, 1), app("a", 0, 2)] },
    { id: "second", children: [] }, { id: "third", children: [widget("w", 0, 1)] },
  ];
  assert.equal(layoutDesktopPages(pages, grid), pages);
  const compacted = arrangeDesktopPages(pages, { rows: 2, columns: 4 });
  assert.equal(arrangeDesktopPages(compacted, { rows: 2, columns: 4 }), compacted);
  assert.equal(compacted.length, 1);
  assert.equal(compacted[0].id, "first");
  assert.deepEqual(compacted[0].children.map(i => [i.id, i.position]), [
    ["a", { row: 0, col: 0 }], ["b", { row: 0, col: 1 }], ["w", { row: 0, col: 2 }],
  ]);
});

test("关闭自动分页时允许继续向下排列", () => {
  const pages = [{ id: "one", children: [app("a", 0, 0), app("b", 0, 0)] }];
  const resolved = layoutDesktopPages(pages, { columns: 1, rows: 1, autoPaginate: false });
  assert.equal(resolved.length, 1);
  assert.deepEqual(resolved[0].children[1].position, { row: 1, col: 0 });
});

test("小图标填入较早的空位后，重复整理返回同一个分页数组", () => {
  const options = { columns: 4, rows: 4 };
  const pages = [{ id: "page", children: [
    app("first", 0, 0), widget("first-widget", 0, 0), widget("second-widget", 0, 0), app("last", 0, 0),
  ] }];
  const result = arrangeDesktopPages(pages, options);
  assert.deepEqual(result[0].children.map(item => item.position), [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 2, col: 0 }, { row: 0, col: 3 },
  ]);
  assert.equal(arrangeDesktopPages(result, options), result);
});

test("迁移时使用自定义组件的默认尺寸和指定尺寸", () => {
  const pages = [{ id: "one", children: [{ type: "clock", id: "clock" }, { type: "app", id: "a" }] }];
  const converted = convertLegacyDesktopPages(pages, {
    columns: 2, rows: 1,
    componentRegistry: { clock: { name: "时钟", sizeConfigs: [{ name: "wide", col: 2, row: 1 }] } },
  });
  assert.equal(converted.length, 2);
  assert.equal(converted[1].children[0].id, "a");
});

test("扩大网格时，溢出项目回到原页原坐标，手动空位与独立分页恢复", () => {
  const pages = [
    { id: "work", children: [app("one", 0, 0), app("two", 0, 2), widget("clock", 0, 3)] },
    { id: "empty", children: [] },
    { id: "home", children: [app("last", 1, 2)] },
  ];
  const small = layoutDesktopPages(pages, { columns: 2, rows: 1 });
  const overflow = small.filter(page => page.overflowOf === "work");
  assert.ok(overflow.length > 0);
  assert.equal(small[1].overflowOf, "work");
  assert.deepEqual(small.find(page => page.id === "empty")?.children, []);
  assert.equal(layoutDesktopPages(small, { columns: 2, rows: 1 }), small);
  const restored = layoutDesktopPages(JSON.parse(JSON.stringify(small)), { columns: 6, rows: 3 });
  assert.deepEqual(restored, pages);
});

test("手动页 ID 即使采用自动页名称，也按手动页处理", () => {
  const pages = [
    { id: "desktop-overflow-1", children: [app("one", 0, 0), app("two", 0, 1)] },
    { id: "manual", children: [] },
  ];
  const small = layoutDesktopPages(pages, { columns: 1, rows: 1, maxPages: 2 });
  assert.equal(small.length, 2);
  assert.deepEqual(small[1], pages[1]);
  assert.deepEqual(layoutDesktopPages(small, { columns: 4, rows: 2 }), pages);
});

test("多格项目优先占据目标矩形，被覆盖项目可以分别利用零散空位", () => {
  const grid = { columns: 4, rows: 2 };
  const fixed = [widget("folder", 0, 1), app("left", 0, 0), app("right", 1, 3)];
  const covered = [app("a", 0, 1), app("b", 0, 2)];
  const placed = relocateBlockNeighbors(covered, fixed, grid);
  assert.deepEqual(placed, [app("a", 1, 0), app("b", 0, 3)]);
  assert.deepEqual(covered, [app("a", 0, 1), app("b", 0, 2)]);
  assert.equal(relocateBlockNeighbors(covered, [...fixed, app("extra", 1, 0)], grid), null);
});

test("纵向推移保留列内顺序，相隔一格的项目只在接触后跟随", () => {
  const moved = widget("F", 1, 0);
  const a = app("a", 1, 0), b = app("b", 2, 0), c = app("c", 3, 0);
  const d = app("d", 2, 1), e = app("e", 4, 1), fixed = app("fixed", 2, 2);
  assert.deepEqual(pushBlockNeighbors(moved, [a, b, c, d, e, fixed], [a, b, d],
    { rows: 6, columns: 3 }, { row: 4, col: 0 }), [
    moved, app("a", 3, 0), app("b", 4, 0), app("c", 5, 0),
    app("d", 4, 1), app("e", 5, 1), fixed,
  ]);
});

test("一侧被边界挡住时从原布局向另一侧推，不留下试算位置", () => {
  const moved = widget("F", 0, 2);
  const a = app("a", 0, 2), b = app("b", 0, 3), c = app("c", 0, 4), d = app("d", 0, 5);
  const items = [a, b, c, d];
  const pushed = pushBlockNeighbors(moved, items, [a, b], { rows: 3, columns: 6 }, { row: 1, col: 4 });
  assert.deepEqual(pushed, [moved, app("a", 0, 0), app("b", 0, 1), c, d]);
  assert.deepEqual(items.map(item => item.position.col), [2, 3, 4, 5]);
});
