import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import react from '@vitejs/plugin-react-swc';
import { createServer } from 'vite';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = fileURLToPath(new URL('../../', import.meta.url));
const fixture = '/tests/desktop-next-browser/index.html';
let server, browser, cacheDir;

before(async () => {
  cacheDir = await mkdtemp(join(tmpdir(), 'desktop-browser-'));
  server = await createServer({
    root, cacheDir, configFile: false, plugins: [react()], logLevel: 'error',
    optimizeDeps: { entries: [fixture.slice(1)] },
    server: { host: '127.0.0.1', port: 0, hmr: false },
  });
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
});
after(async () => {
  await browser?.close();
  await server?.close();
  if (cacheDir) await rm(cacheDir, { recursive: true, force: true });
});

// Chrome 在 v0.9.9 的文件夹弹窗和右键菜单中也会记录下列依赖诊断。
// 每个对应场景允许同一条诊断出现一次，其他 console.error 和所有未捕获异常仍会导致失败。
const radixDialogTitle = '`DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.\n\nIf you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.\n\nFor more information, see https://radix-ui.com/primitives/docs/components/dialog';
const floatingReference = 'Floating UI: Cannot pass a virtual element to the `elements.reference` option, as it must be a real DOM element. Use `refs.setPositionReference()` instead.';

function scenario(name, mode, verify, viewport = { width: 900, height: 620 }, device = {}) {
  test(name, async () => {
    const context = await browser.newContext({ viewport, ...device });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const knownErrors = new Set();
    if (mode === 'folder' || mode === 'folder-sort' || mode === 'surfaces' || mode === 'floating-controls') knownErrors.add(radixDialogTitle);
    if (mode === 'size' || mode === 'delete' || mode === 'photo' || mode === 'menu-theme') knownErrors.add(floatingReference);
    page.on('console', message => {
      if (message.type() === 'error' && !knownErrors.delete(message.text())) errors.push(message.text());
    });
    try {
      await page.goto(`${server.resolvedUrls.local[0].slice(0, -1)}${fixture}?${mode}`);
      await page.waitForSelector('[data-desktop-grid="0"]');
      await verify(page);
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  });
}

const snapshot = page => page.evaluate(() => {
  const { pages, currentPage, changes } = window.snapshot();
  return { pages, currentPage, changes };
});
const counts = state => state.pages.map(page => page.children.length);
const item = (page, id) => page.locator(`[data-desktop-grid] [data-grid-item-id="${id}"]`);
function position(state, id) {
  for (const page of state.pages) {
    const item = page.children.find(item => item.id === id);
    if (item) return [page.id, item.position.row, item.position.col];
  }
}
async function geometry(page, index = 0) {
  return page.locator(`[data-desktop-grid="${index}"]`).evaluate(el => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      x: rect.x, y: rect.y, width: rect.width,
      columns: style.gridTemplateColumns.trim().split(/\s+/).length,
      rowHeight: parseFloat(style.gridTemplateRows),
    };
  });
}
async function cell(page, row, col, index) {
  const g = await geometry(page, index);
  return { x: g.x + (col + 0.5) * g.width / g.columns, y: g.y + (row + 0.45) * g.rowHeight };
}
// 交换手势落在已有项目所在格子的留白处。图标中心用于合并。
async function moveToCellPadding(page, row, col, index = 0) {
  const g = await geometry(page, index);
  const point = { x: g.x + col * g.width / g.columns + 3, y: g.y + row * g.rowHeight + 3 };
  assert.equal(await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-grid-item-id]'), point), false);
  await page.mouse.move(point.x, point.y);
  await page.waitForTimeout(450);
}
async function center(locator) {
  const b = await locator.boundingBox();
  assert.ok(b);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}
async function assertRendered(page, id, row, col, index = 0) {
  const pos = await center(page.locator(`[data-desktop-grid="${index}"] [data-grid-item-id="${id}"]`));
  const g = await geometry(page, index);
  assert.equal(Math.floor((pos.x - g.x) / (g.width / g.columns)), col);
  assert.equal(Math.floor((pos.y - g.y) / g.rowHeight), row);
}
async function start(page, locator) {
  const p = await center(locator);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 12, p.y, { steps: 4 });
  await page.waitForFunction(() => document.body.style.cursor === 'grabbing');
}
async function move(page, p, wait = 90) {
  await page.mouse.move(p.x, p.y, { steps: 10 });
  await page.waitForTimeout(wait);
}
async function drop(page) {
  await page.mouse.up();
  await page.waitForTimeout(500); // 等待网格移动动画完成，再检查屏幕坐标。
  assert.notEqual(await page.evaluate(() => document.body.style.cursor), 'grabbing');
}
async function nextPage(page) {
  await move(page, { x: 895, y: 180 });
  await page.waitForFunction(() => window.snapshot().currentPage === 1);
  await page.waitForTimeout(450); // 翻页过渡期间，网格坐标仍在变化。
}

scenario('旧数据显式转换，原始数据保留，桌面按迁移坐标渲染', 'legacy', async page => {
  assert.equal(await page.evaluate(() => window.legacy[0].children[0].position), undefined);
  assert.deepEqual(counts(await snapshot(page)), [6, 3]);
  assert.equal((await geometry(page)).columns, 3);
  await assertRendered(page, '0', 0, 0);
  await assertRendered(page, '5', 1, 2);
});
scenario('固定三列两行，溢出项目自动进入第二页', 'spill', async page => {
  assert.deepEqual(counts(await snapshot(page)), [6, 1]);
});
scenario('剩余格子分散时，双行双列组件整体进入下一页', 'multi', async page => {
  const state = await snapshot(page);
  assert.deepEqual(counts(state), [3, 1]);
  assert.equal(state.pages[1].children[0].id, 'W');
  const span = await page.locator('[data-desktop-item="W"]').evaluate(el => {
    const style = getComputedStyle(el);
    return [style.gridColumn, style.gridRow];
  });
  assert.deepEqual(span, ['1 / span 2', '1 / span 2']);
});
scenario('拖到空格只提交一次，刷新后保持目标位置', 'storage', async page => {
  const before = await snapshot(page);
  await start(page, item(page, 'A'));
  await move(page, await cell(page, 1, 1));
  await drop(page);
  const result = await snapshot(page);
  assert.deepEqual(position(result, 'A'), ['P1', 1, 1]);
  assert.deepEqual(position(result, 'B'), ['P1', 0, 2]);
  assert.equal(result.changes.length, before.changes.length + 1);
  await page.reload();
  await page.waitForSelector('[data-desktop-grid]');
  await assertRendered(page, 'A', 1, 1);
});
scenario('拖到页面边缘，再拖入已有页面的空位', 'cross', async page => {
  const before = await snapshot(page);
  await start(page, item(page, 'A'));
  await nextPage(page);
  await move(page, await cell(page, 1, 2, 1));
  await drop(page);
  const result = await snapshot(page);
  assert.deepEqual(position(result, 'A'), ['P2', 1, 2]);
  assert.deepEqual(position(result, 'B'), ['P1', 0, 2]);
  assert.deepEqual(position(result, 'C'), ['P2', 0, 0]);
  assert.equal(result.changes.length, before.changes.length + 1);
  await assertRendered(page, 'A', 1, 2, 1);
});
scenario('拖到满页中已占格子的留白处，两个图标交换位置', 'full', async page => {
  await start(page, item(page, 'A'));
  await nextPage(page);
  await moveToCellPadding(page, 0, 1, 1);
  await assertRendered(page, 'A', 0, 1, 1);
  await assertRendered(page, '1', 0, 0, 0);
  await drop(page);
  const result = await snapshot(page);
  assert.deepEqual(position(result, 'A'), ['P2', 0, 1]);
  assert.deepEqual(position(result, '1'), ['P1', 0, 0]);
});
scenario('临时新页支持取消，也支持松手保存', 'blank', async page => {
  await start(page, item(page, 'A'));
  await nextPage(page);
  await page.keyboard.press('Escape');
  await drop(page);
  assert.deepEqual(counts(await snapshot(page)), [2]);
  assert.deepEqual(position(await snapshot(page), 'A'), ['P1', 0, 0]);
  await start(page, item(page, 'A'));
  await nextPage(page);
  await move(page, await cell(page, 1, 2, 1));
  await drop(page);
  const result = await snapshot(page);
  assert.deepEqual(counts(result), [1, 1]);
  assert.deepEqual(position(result, 'A'), [result.pages[1].id, 1, 2]);
});
scenario('合并文件夹后打开弹窗，再把图标拖回桌面空格', 'folder', async page => {
  await start(page, item(page, 'A'));
  await move(page, await center(item(page, 'B')), 450);
  await drop(page);
  const folder = (await snapshot(page)).pages[0].children[0];
  assert.equal(folder.type, 'group');
  assert.equal(folder.position.col, 2);
  assert.deepEqual(folder.children.map(x => x.id).sort(), ['A', 'B']);
  await item(page, folder.id).click();
  const dialog = page.getByRole('dialog', { name: '文件夹' });
  await dialog.waitFor();
  await page.waitForTimeout(350);
  await start(page, dialog.locator('[data-grid-item-id="A"]'));
  await move(page, { x: 80, y: 60 }, 200);
  await move(page, await cell(page, 1, 1));
  await drop(page);
  const result = await snapshot(page);
  assert.deepEqual(position(result, 'A'), ['P1', 1, 1]);
  assert.deepEqual(position(result, 'B'), ['P1', 0, 2]);
});
scenario('桌面缩小时自动分页，放大后回收自动页并恢复原有空位', 'auto', async page => {
  const original = await snapshot(page);
  const wide = await geometry(page);
  const ids = state => state.pages.flatMap(p => p.children.map(i => i.id)).sort();
  await page.setViewportSize({ width: 410, height: 320 });
  await page.waitForFunction(() => window.snapshot().pages.length > 1);
  const small = await snapshot(page);
  const narrow = await geometry(page);
  assert.ok(narrow.columns < wide.columns);
  assert.deepEqual(ids(small), ids(original));
  for (const p of small.pages) {
    const seen = new Set();
    for (const { position: { row, col } } of p.children) {
      assert.ok(col >= 0 && col < narrow.columns);
      assert.ok(row >= 0 && row < Math.floor((320 - narrow.y) / narrow.rowHeight));
      seen.add(`${row},${col}`);
    }
    assert.equal(seen.size, p.children.length);
  }
  await page.setViewportSize({ width: 900, height: 620 });
  await page.waitForTimeout(350);
  const expanded = await snapshot(page);
  assert.equal(expanded.pages.length, original.pages.length);
  assert.deepEqual(ids(expanded), ids(original));
  for (const id of ids(original)) assert.deepEqual(position(expanded, id), position(original, id));
});
scenario('通过右键菜单修改组件尺寸并重新分页', 'size', async page => {
  await item(page, 'W').click({ button: 'right' });
  await page.getByText('尺寸', { exact: true }).hover();
  await page.getByText('Large', { exact: true }).click();
  const result = await snapshot(page);
  assert.equal(result.pages.flatMap(p => p.children).find(x => x.id === 'W').config.sizeId, '2x2');
  assert.deepEqual(counts(result), [3, 1]);
});
scenario('删除后保留空格，调用 arrange 后重新紧凑排列', 'delete', async page => {
  await item(page, 'A').click({ button: 'right' });
  await page.getByText('移除', { exact: true }).click();
  await page.waitForFunction(() => window.snapshot().pages[0].children.length === 1);
  await assertRendered(page, 'B', 0, 2);
  await page.evaluate(() => window.snapshot().arrange());
  await page.waitForTimeout(450);
  await assertRendered(page, 'B', 0, 0);
});
for (const [mode, description] of [['scroll', '关闭自动分页'], ['limit', '限制为一页']]) {
  scenario(`${description}时可滚动到溢出的网格并拖动`, mode, async page => {
    assert.deepEqual(counts(await snapshot(page)), [21]);
    await item(page, '20').scrollIntoViewIfNeeded();
    await start(page, item(page, '20'));
    await moveToCellPadding(page, 6, 1);
    await drop(page);
    const result = await snapshot(page);
    assert.deepEqual(position(result, '20'), ['P1', 6, 1]);
    assert.deepEqual(position(result, '19'), ['P1', 6, 2]);
  });
}
scenario('从多格组件右下方抓起并移动一列', 'widget', async page => {
  const box = await item(page, 'W').boundingBox();
  const origin = { x: box.x + box.width - 25, y: box.y + box.height - 35 };
  await page.mouse.move(origin.x, origin.y);
  await page.mouse.down();
  await page.mouse.move(origin.x + 12, origin.y, { steps: 4 });
  await page.waitForFunction(() => document.body.style.cursor === 'grabbing');
  await move(page, await cell(page, 1, 2));
  await drop(page);
  assert.deepEqual(position(await snapshot(page), 'W'), ['P1', 0, 1]);
});
scenario('额外图标自动进入附加页，编辑后业务缓存只含用户页面', 'extras', async page => {
  assert.ok(await item(page, 'extra').count());
  await start(page, item(page, '0'));
  await moveToCellPadding(page, 0, 1);
  await drop(page);
  const result = await snapshot(page);
  assert.deepEqual(counts({ pages: result.changes.at(-1) }), [6]);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('desktop-next-test')));
  assert.deepEqual(counts({ pages: stored }), [6]);
  assert.ok(stored[0].children.every(item => item.id !== 'extra'));
});
scenario('关闭保留空位后自动紧凑排列', 'compact', async page => {
  await assertRendered(page, 'A', 0, 0);
  await assertRendered(page, 'B', 0, 1);
});
scenario('文件夹内拖动可重新排序', 'folder-sort', async page => {
  await item(page, 'F').click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  await page.waitForTimeout(350);
  const a = dialog.locator('[data-grid-item-id="A"]');
  const c = dialog.locator('[data-grid-item-id="C"]');
  await start(page, a);
  await move(page, await center(c), 200);
  await drop(page);
  const sorted = (await snapshot(page)).pages[0].children[0].children.map(child => child.id);
  assert.deepEqual(sorted, ['B', 'C', 'A']);
});
scenario('使用触控将图标拖入空格，抬手后保持当前页', 'cross', async page => {
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  const source = await center(item(page, 'A'));
  const target = await cell(page, 1, 2);
  const send = (type, point) => session.send('Input.dispatchTouchEvent', {
    type, touchPoints: point ? [{ x: point.x, y: point.y, id: 1 }] : [],
  });
  await send('touchStart', source);
  await send('touchMove', { x: source.x + 13, y: source.y });
  await page.waitForFunction(() => document.body.style.cursor === 'grabbing');
  await send('touchMove', target);
  await send('touchEnd');
  await page.waitForTimeout(450);
  const result = await snapshot(page);
  assert.equal(result.currentPage, 0);
  assert.deepEqual(position(result, 'A'), ['P1', 1, 2]);
});
scenario('跨页拖动期间父级移除目标页，结束拖动并可继续操作', 'external', async page => {
  await start(page, item(page, 'A'));
  await nextPage(page);
  await page.evaluate(() => window.removePage('P2'));
  await page.waitForFunction(() => document.body.style.cursor !== 'grabbing', undefined, { timeout: 2500 });
  await drop(page);
  let state = await snapshot(page);
  assert.deepEqual(counts(state), [2]);
  assert.deepEqual(position(state, 'A'), ['P1', 0, 0]);
  await start(page, item(page, 'A'));
  await move(page, await cell(page, 1, 1));
  await drop(page);
  state = await snapshot(page);
  assert.deepEqual(position(state, 'A'), ['P1', 1, 1]);
});
scenario('切换 storageKey 后分别读取和更新对应缓存', 'cache', async page => {
  await start(page, item(page, 'A'));
  await move(page, await cell(page, 1, 1));
  await drop(page);
  const original = await page.evaluate(() => localStorage.getItem('desktop-next-test'));
  assert.ok(original);
  await page.evaluate(() => {
    localStorage.setItem('desktop-next-B', JSON.stringify([{ id: 'stored-B', children: [
      { id: 'X', type: 'app', data: { name: 'X' }, position: { row: 1, col: 0 } },
    ] }]));
    window.switchStorageKey('desktop-next-B');
  });
  await item(page, 'X').waitFor();
  await assertRendered(page, 'X', 1, 0);
  await start(page, item(page, 'X'));
  await move(page, await cell(page, 0, 2));
  await drop(page);
  const cache = await page.evaluate(() => ({
    a: localStorage.getItem('desktop-next-test'), b: JSON.parse(localStorage.getItem('desktop-next-B')),
  }));
  assert.equal(cache.a, original);
  assert.deepEqual(position({ pages: cache.b }, 'X'), ['stored-B', 0, 2]);
  await page.evaluate(() => window.switchStorageKey('desktop-next-test'));
  await item(page, 'A').waitFor();
  await assertRendered(page, 'A', 1, 1);
});
scenario('固定两行的矮容器中，分页点稳定且同宽时自动列数保持一致', 'short', async page => {
  for (const height of [200, 450, 160]) {
    await page.setViewportSize({ width: 500, height });
    // 连续采样，覆盖 ResizeObserver 和分页指示器引起的后续布局。
    const frames = await page.evaluate(async () => {
      const frames = [];
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const grid = document.querySelector('[data-desktop-grid="0"]');
        const dots = document.querySelectorAll('[data-desktop-dots] [data-active]');
        const { changes, pages } = window.snapshot();
        frames.push({
          columns: getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length,
          visibleDots: [...dots].filter(dot => dot.getBoundingClientRect().height > 0).length,
          itemsPerPage: pages.map(page => page.children.length), changes: changes.length,
        });
      }
      return frames;
    });
    for (const frame of frames) {
      assert.equal(frame.columns, 4);
      assert.equal(frame.visibleDots, 2);
      assert.deepEqual(frame.itemsPerPage, [8, 3]);
      assert.ok(frame.changes <= 2, `onChange 调用次数为 ${frame.changes}`);
    }
    assert.equal(frames[0].changes, frames.at(-1).changes);
  }
}, { width: 500, height: 200 });
async function placeAfterLastIcon(page) {
  const target = await item(page, 'C').boundingBox();
  await start(page, item(page, 'A'));
  // 经过图标中央，再停在 C 的右侧边缘以触发排序。
  await move(page, { x: target.x + target.width - 4, y: target.y + target.height / 2 }, 650);
  await assertRendered(page, 'B', 0, 0);
  await assertRendered(page, 'C', 0, 1);
  const dashed = await page.locator('[data-desktop-grid="0"]').evaluate(grid =>
    [...grid.querySelectorAll('*')].some(el => getComputedStyle(el).borderTopStyle === 'dashed'));
  assert.equal(dashed, false);
}

scenario('按住时完成排序，松手后连续各帧保持预览落点', 'sort', async page => {
  const changesBefore = (await snapshot(page)).changes.length;
  await placeAfterLastIcon(page);
  assert.equal((await snapshot(page)).changes.length, changesBefore);
  const frames = page.evaluate(() => new Promise(resolve => {
    const sample = () => ['A', 'B', 'C'].map(id => {
      const bounds = document.querySelector(`[data-desktop-item="${id}"]`)?.getBoundingClientRect();
      return bounds ? { x: bounds.x, y: bounds.y } : null;
    });
    window.addEventListener('pointerup', () => {
      const frames = [sample()];
      function nextFrame() {
        frames.push(sample());
        if (frames.length < 18) requestAnimationFrame(nextFrame);
        else resolve(frames);
      }
      requestAnimationFrame(nextFrame);
    }, { capture: true, once: true });
  }));
  await page.mouse.up();
  const positions = await frames;
  const final = positions.at(-1);
  for (const frame of positions.slice(1)) {
    frame.forEach((p, i) => {
      assert.ok(p && final[i]);
      assert.ok(Math.hypot(p.x - final[i].x, p.y - final[i].y) < 2, `松手后 ${['A', 'B', 'C'][i]} 再次移动`);
    });
  }
  for (const i of [1, 2]) {
    const beforeRelease = positions[0][i];
    assert.ok(Math.hypot(beforeRelease.x - final[i].x, beforeRelease.y - final[i].y) < 1);
  }
  const result = await snapshot(page);
  assert.equal(result.changes.length, changesBefore + 1);
  assert.deepEqual(position(result, 'A'), ['P1', 0, 2]);
  await assertRendered(page, 'A', 0, 2);
});
scenario('已有换位预览时取消拖动，复原三个图标的位置', 'sort', async page => {
  const original = await snapshot(page);
  await placeAfterLastIcon(page);
  await page.keyboard.press('Escape');
  await drop(page);
  await assertRendered(page, 'A', 0, 0);
  await assertRendered(page, 'B', 0, 1);
  await assertRendered(page, 'C', 0, 2);
  assert.deepEqual(await snapshot(page), original);
});
scenario('移动端指定五列三行，横竖屏切换均采用相同行列', 'mobile', async page => {
  assert.equal(await page.evaluate(() => matchMedia('(pointer: coarse) and (hover: none)').matches), true);
  for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(150);
    const tracks = await page.locator('[data-desktop-grid="0"]').evaluate(el => {
      const style = getComputedStyle(el);
      return [style.gridTemplateColumns.split(' ').length, style.gridTemplateRows.split(' ').length];
    });
    assert.deepEqual(tracks, [5, 3]);
    assert.deepEqual(counts(await snapshot(page)), [15, 5]);
  }
}, { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
scenario('桌面侧栏变窄时按容器宽高计算网格', 'mobile', async page => {
  await page.evaluate(() => { document.querySelector('#root').style.width = '390px'; });
  await page.waitForTimeout(180);
  assert.equal(await page.evaluate(() => matchMedia('(pointer: coarse) and (hover: none)').matches), false);
  assert.equal((await geometry(page)).columns, 3);
});
scenario('恢复原尺寸时计入分页点回收后的高度', 'threshold', async page => {
  assert.deepEqual(counts(await snapshot(page)), [8]);
  await page.setViewportSize({ width: 350, height: 240 });
  await page.waitForFunction(() => window.snapshot().pages.length > 1);
  await page.setViewportSize({ width: 500, height: 240 });
  await page.waitForFunction(() => window.snapshot().pages.length === 1, undefined, { timeout: 2500 });
  assert.deepEqual(counts(await snapshot(page)), [8]);
}, { width: 500, height: 240 });
scenario('用户创建的空页和独立页面在缩放后保留', 'manual', async page => {
  const initial = await snapshot(page);
  for (const size of [{ width: 390, height: 250 }, { width: 900, height: 620 }]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(200);
    const state = await snapshot(page);
    assert.deepEqual(state.pages.map(p => p.id), ['P1', 'empty', 'personal']);
    assert.deepEqual(counts(state), [1, 0, 1]);
  }
  assert.deepEqual((await snapshot(page)).pages, initial.pages);
});
scenario('移动端默认四列五行', 'auto', async page => {
  const grid = page.locator('[data-desktop-grid="0"]');
  const rows = await grid.evaluate(el => getComputedStyle(el).gridTemplateRows.split(' ').length);
  assert.equal((await geometry(page)).columns, 4);
  assert.equal(rows, 5);
  assert.deepEqual(counts(await snapshot(page)), [20]);
}, { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
scenario('拖到满页最后一项边缘时立即预览双方位置', 'full', async page => {
  await start(page, item(page, 'A'));
  await nextPage(page);
  const tail = await item(page, '5').boundingBox();
  await move(page, { x: tail.x + tail.width - 4, y: tail.y + tail.height / 2 }, 450);
  await assertRendered(page, 'A', 1, 2, 1);
  await assertRendered(page, '5', 0, 0, 0);
  await drop(page);
  const result = await snapshot(page);
  assert.deepEqual(position(result, 'A'), ['P2', 1, 2]);
  assert.deepEqual(position(result, '5'), ['P1', 0, 0]);
});
scenario('排序后悬停创建文件夹，旁边的图标保持预览位置', 'sort', async page => {
  await placeAfterLastIcon(page);
  await move(page, await center(item(page, 'C')), 400);
  await assertRendered(page, 'B', 0, 0);
  await drop(page);
  const result = await snapshot(page);
  const folder = result.pages[0].children.find(item => item.type === 'group');
  assert.deepEqual(folder.children.map(child => child.id).sort(), ['A', 'C']);
  assert.deepEqual(position(result, 'B'), ['P1', 0, 0]);
});
// 从首次进入目标中心的 pointermove 捕获阶段采样。记录坐标和页码，
// 可以查出同页先让位再返回，以及目标图标短暂跑到另一页的情况。
async function holdMergeCenter(page, targetId, dwellTime) {
  const point = await center(item(page, targetId));
  await page.evaluate(({ targetId, point, dwellTime }) => {
    const expected = document.elementFromPoint(point.x, point.y)?.closest('[data-grid-item-id]');
    if (expected?.dataset.gridItemId !== targetId) throw Error(`指针未命中目标 ${targetId}`);
    window.hoverFrames = new Promise(resolve => {
      function sample() {
        const elements = document.querySelectorAll('[data-desktop-grid] [data-desktop-item]');
        return [...elements].filter(el => el.dataset.desktopItem !== 'A').map(el => {
          const grid = el.closest('[data-desktop-grid]');
          const rect = el.getBoundingClientRect();
          const origin = grid.getBoundingClientRect();
          return {
            id: el.dataset.desktopItem, page: grid.dataset.desktopGrid, col: el.style.gridColumn,
            row: el.style.gridRow, x: rect.x - origin.x, y: rect.y - origin.y,
          };
        }).sort((a, b) => a.id.localeCompare(b.id));
      }
      window.addEventListener('pointermove', () => {
        const start = performance.now();
        const frames = [{ elapsed: 0, items: sample() }];
        function next() {
          const elapsed = performance.now() - start;
          frames.push({ elapsed, items: sample() });
          if (elapsed < dwellTime + 200) requestAnimationFrame(next);
          else resolve(frames);
        }
        requestAnimationFrame(next);
      }, { once: true, capture: true });
    });
  }, { targetId, point, dwellTime });
  await page.mouse.move(point.x, point.y);
  const frames = await page.evaluate(() => window.hoverFrames);
  assert.ok(frames.some(frame => frame.elapsed > 0 && frame.elapsed < dwellTime));
  assert.ok(frames.at(-1).elapsed > dwellTime);
  const initial = frames[0].items;
  for (const { elapsed, items } of frames.slice(1)) {
    assert.deepEqual(items.map(item => item.id), initial.map(item => item.id));
    for (const [index, item] of items.entries()) {
      const before = initial[index];
      assert.ok(item.page === before.page && item.row === before.row && item.col === before.col &&
        Math.hypot(item.x - before.x, item.y - before.y) < 1,
        `${Math.round(elapsed)}ms 时 ${item.id} 从页 ${before.page} (${before.x},${before.y}) 移至页 ${item.page} (${item.x},${item.y})`);
    }
  }
}

function assertMergedAt(state, target, pageId, row, col) {
  const folder = state.pages.flatMap(page => page.children).find(item => item.type === 'group');
  assert.ok(folder);
  assert.deepEqual(position(state, folder.id), [pageId, row, col]);
  assert.deepEqual(folder.children.map(child => child.id).sort(), ['A', target].sort());
}
scenario('同页拖入相邻图标的合并中心，等待期间每一帧保持原位', 'sort', async page => {
  await start(page, item(page, 'A'));
  await holdMergeCenter(page, 'B', 220);
  await drop(page);
  assertMergedAt(await snapshot(page), 'B', 'P1', 0, 1);
});
scenario('跨入满页后进入合并中心，等待期间每一帧保持原位', 'full', async page => {
  await start(page, item(page, 'A'));
  await nextPage(page);
  await holdMergeCenter(page, '1', 1200);
  await drop(page);
  assertMergedAt(await snapshot(page), '1', 'P2', 0, 1);
});
scenario('已有排序后进入新的合并中心，沿用进入时的目标位置', 'sort', async page => {
  await placeAfterLastIcon(page);
  await holdMergeCenter(page, 'B', 220);
  await drop(page);
  assertMergedAt(await snapshot(page), 'B', 'P1', 0, 0);
});
scenario('跨入满页后在合并中心直接松手，原页及其图标位置保留', 'full', async page => {
  const original = await snapshot(page);
  await start(page, item(page, 'A'));
  await nextPage(page);
  const target = await center(item(page, '1'));
  await page.mouse.move(target.x, target.y);
  await drop(page);
  assert.deepEqual((await snapshot(page)).pages, original.pages);
});
scenario('已有排序后在新的合并中心快速松手，沿用之前的排序', 'sort', async page => {
  await placeAfterLastIcon(page);
  const target = await center(item(page, 'B'));
  await page.mouse.move(target.x, target.y);
  await drop(page);
  const state = await snapshot(page);
  assert.deepEqual(position(state, 'A'), ['P1', 0, 2]);
  assert.deepEqual(position(state, 'B'), ['P1', 0, 0]);
  assert.deepEqual(position(state, 'C'), ['P1', 0, 1]);
});

scenario('文件夹内快速掠过图标后松手，提交最后一次确认的位置', 'folder-sort', async page => {
  await item(page, 'F').click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  await page.waitForTimeout(350);
  const child = id => dialog.locator('[data-grid-item-id="' + id + '"]');
  const b = await center(child('B'));
  const c = await center(child('C'));
  await start(page, child('A'));

  await page.mouse.move(b.x, b.y);
  await page.waitForFunction(() => {
    const icons = document.querySelectorAll('[role="dialog"] [data-grid-item-id]');
    return [...icons].map(el => el.dataset.gridItemId).join(',') === 'B,A,C';
  });
  await page.mouse.move(c.x, c.y);
  await page.mouse.up();
  const result = await snapshot(page);
  assert.deepEqual(result.pages[0].children[0].children.map(icon => icon.id), ['B', 'A', 'C']);
  assert.equal(result.changes.length, 1);
});
// 记录网格中实际绘制的位置。CSS 的 grid-column 在动画开始时已经指向终点。
async function recordPositionsOnEvent(page, event, ids, duration = 650) {
  await page.evaluate(({ event, ids, duration }) => {
    window.recordedPositions = new Promise(resolve => {
      window.addEventListener(event, () => {
        const frames = [];
        const start = performance.now();
        function sample() {
          frames.push(ids.map(id => {
            const wrapper = document.querySelector(`[data-desktop-item="${id}"]`);
            const icon = wrapper.querySelector('[data-grid-item-id]');
            return { x: wrapper.getBoundingClientRect().x, opacity: Number(getComputedStyle(icon).opacity) };
          }));
          if (performance.now() - start < duration) requestAnimationFrame(sample);
          else resolve(frames);
        }
        sample();
      }, { capture: true, once: true });
    });
  }, { event, ids, duration });
}

function intermediatePositions(frames, index) {
  const start = frames[0][index].x;
  const end = frames.at(-1)[index].x;
  return frames.map(frame => frame[index]).filter(({ x }) => x > Math.min(start, end) + 1 && x < Math.max(start, end) - 1);
}

scenario('排序时半透明占位和相邻图标都有连续的过渡帧', 'sort', async page => {
  const ids = ['A', 'B', 'C'];
  const target = await item(page, 'C').boundingBox();
  await start(page, item(page, 'A'));
  await recordPositionsOnEvent(page, 'pointermove', ids);
  await page.mouse.move(target.x + target.width - 4, target.y + target.height / 2);
  const frames = await page.evaluate(() => window.recordedPositions);
  for (const [index, id] of ids.entries()) {
    const middle = intermediatePositions(frames, index);
    assert.ok(new Set(middle.map(p => p.x)).size >= 3, `${id} 的排序缺少连续中间位置`);
    if (id === 'A') assert.ok(middle.some(p => p.opacity > 0 && p.opacity < 0.8));
  }
  await drop(page);
});

scenario('排序弹簧运动中松手，从预览位置完成落位', 'sort', async page => {
  const target = await item(page, 'C').boundingBox();
  const source = await page.locator('[data-desktop-item="A"]').boundingBox();
  const end = await page.locator('[data-desktop-item="C"]').boundingBox();
  const distance = end.x - source.x;
  await start(page, item(page, 'A'));
  await recordPositionsOnEvent(page, 'pointerup', ['A', 'B', 'C']);
  await page.mouse.move(target.x + target.width - 4, target.y + target.height / 2);
  await page.waitForFunction(({ x, distance }) => {
    const progress = (document.querySelector('[data-desktop-item="A"]').getBoundingClientRect().x - x) / distance;
    return progress > 0.15 && progress < 0.85;
  }, { x: source.x, distance }, { timeout: 2000 });
  await page.mouse.up();
  const frames = await page.evaluate(() => window.recordedPositions);
  const released = frames[0][0].x;
  assert.ok(released > source.x + 2 && released < end.x - 2);
  const afterRelease = frames[1][0].x;
  assert.ok(Math.abs(afterRelease - end.x) < 1,
    `快放时占位 x=${released}，松手第一帧 x=${afterRelease}，目标 x=${end.x}`);
  for (const [index, id] of ['A', 'B', 'C'].entries()) {
    const final = frames.at(-1)[index].x;
    let remaining = Math.abs(frames[0][index].x - final);
    for (const frame of frames.slice(1)) {
      const next = Math.abs(frame[index].x - final);
      assert.ok(next <= remaining + 1, `${id} 松手后向原格回跳了 ${next - remaining}px`);
      remaining = next;
    }
  }
  assert.ok(Math.abs(frames.at(-1)[0].x - end.x) < 1);
  assert.deepEqual(position(await snapshot(page), 'A'), ['P1', 0, 2]);
});

scenario('点击分页点时桌面连续滑动到下一页', 'cross', async page => {
  await recordPositionsOnEvent(page, 'click', ['A'], 500);
  await page.locator('[data-desktop-dots] [data-active]').nth(1).click();
  const frames = await page.evaluate(() => window.recordedPositions);
  assert.ok(new Set(intermediatePositions(frames, 0).map(p => p.x)).size >= 3);
  assert.ok(Math.abs(frames.at(-1)[0].x - frames[0][0].x + page.viewportSize().width) < 1);
  assert.equal((await snapshot(page)).currentPage, 1);
});

scenario('2×2 文件夹跨过三个图标时按整块预览，受影响的图标一起让位', 'footprint', async page => {
  const grid = await geometry(page);
  const pitch = grid.width / grid.columns;
  const initial = await snapshot(page);
  // 从左上格抓取。落点处的三项覆盖目标矩形中的三个格子。
  const grab = await cell(page, 0, 4);
  await page.mouse.move(grab.x - 12, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x, grab.y, { steps: 3 });
  await page.waitForFunction(() => document.body.style.cursor === 'grabbing');
  const target = { x: grab.x - 2 * pitch, y: grab.y + grid.rowHeight };
  await move(page, target, 500);
  const positions = () => page.locator('[data-desktop-grid="0"] [data-desktop-item]').evaluateAll(nodes =>
    Object.fromEntries(nodes.map(el => [el.dataset.desktopItem,
      [parseInt(el.style.gridRowStart) - 1, parseInt(el.style.gridColumnStart) - 1]])));
  const preview = await positions();
  assert.deepEqual(preview.F, [1, 2]);
  assert.deepEqual(preview.left, [1, 0]);
  assert.deepEqual(preview.top, [0, 1]);
  assert.deepEqual(preview.right, [2, 5]);
  assert.deepEqual(preview.B, [preview.A[0], preview.A[1] + 1]);
  assert.deepEqual(preview.C, [preview.A[0] + 1, preview.A[1]]);
  for (const id of ['A', 'B', 'C']) {
    const [r, c] = preview[id];
    assert.ok(r < 1 || c < 2 || c >= 4);
  }
  await page.mouse.move(target.x + 3, target.y - 2);
  await page.waitForTimeout(150);
  assert.deepEqual(await positions(), preview);
  assert.equal((await snapshot(page)).changes.length, initial.changes.length);
  await drop(page);
  const saved = await snapshot(page);
  assert.equal(saved.changes.length, initial.changes.length + 1);
  assert.deepEqual(counts(saved), [7]);
  for (const [id, pos] of Object.entries(preview)) assert.deepEqual(position(saved, id), ['P1', ...pos]);
});

scenario('从大组件右下格抓取，越过半格时才吸附到下一列', 'widget', async page => {
  const g = await geometry(page);
  const pitch = g.width / g.columns;
  const x = g.x + 1.7 * pitch, y = g.y + 1.45 * g.rowHeight;
  const block = page.locator('[data-desktop-item="W"]');
  await page.mouse.move(x - 12, y);
  await page.mouse.down();
  await page.mouse.move(x, y, { steps: 3 });
  await page.waitForFunction(() => document.body.style.cursor === 'grabbing');
  for (const [delta, expectedCol] of [[0.4, 1], [0.6, 2]]) {
    await move(page, { x: x + delta * pitch, y });
    assert.equal(await block.evaluate(el => Number(el.style.gridColumnStart)), expectedCol);
  }
  await page.keyboard.press('Escape');
  await page.mouse.up();
  assert.deepEqual(position(await snapshot(page), 'W'), ['P1', 0, 0]);
});

scenario('大组件拖入满页，四个被覆盖的图标移入源页腾出的区域', 'block-full', async page => {
  const grab = await cell(page, 0, 0);
  await page.mouse.move(grab.x - 12, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x, grab.y, { steps: 3 });
  await page.waitForFunction(() => document.body.style.cursor === 'grabbing');
  await nextPage(page);
  await move(page, await cell(page, 0, 1, 1), 500);
  const projected = page.locator('[data-desktop-grid="1"] [data-desktop-item="W"]');
  assert.equal(await projected.evaluate(el => Number(el.style.gridColumnStart)), 2);
  await drop(page);
  const saved = await snapshot(page);
  assert.deepEqual(counts(saved), [5, 3]);
  assert.deepEqual(position(saved, 'W'), ['P2', 0, 1]);
  assert.deepEqual(position(saved, 'wall'), ['P1', 1, 2]);
  for (const [id, r, c] of [['1', 0, 0], ['2', 0, 1], ['4', 1, 0], ['5', 1, 1]]) {
    assert.deepEqual(position(saved, id), ['P1', r, c]);
  }
});

scenario('从右向左拖入两行图标时连续向右让位，预览和松手都保留行内次序', 'push', async page => {
  const initial = await snapshot(page);
  const grab = await cell(page, 1, 4);
  await page.mouse.move(grab.x - 12, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x, grab.y, { steps: 3 });
  await page.waitForFunction(() => document.body.style.cursor === 'grabbing');
  await move(page, await cell(page, 1, 1), 550);
  const expected = {
    F: [1, 1], Chrome: [0, 0], Photos: [0, 1], VSCode: [0, 2], Figma: [0, 3],
    Notion: [1, 3], Spotify: [1, 4], Slack: [1, 5],
    Mail: [2, 3], Cal: [2, 4], Safari: [2, 5],
  };
  const preview = await page.locator('[data-desktop-grid="0"] [data-desktop-item]').evaluateAll(nodes =>
    Object.fromEntries(nodes.map(el => [el.dataset.desktopItem,
      [parseInt(el.style.gridRowStart) - 1, parseInt(el.style.gridColumnStart) - 1]])));
  assert.deepEqual(preview, expected);
  assert.equal((await snapshot(page)).changes.length, initial.changes.length);
  await drop(page);
  const saved = await snapshot(page);
  for (const [id, pos] of Object.entries(expected)) assert.deepEqual(position(saved, id), ['P1', ...pos]);
  assert.equal(saved.changes.length, initial.changes.length + 1);
});


scenario('文件夹放大后向右再拖回，相册全程在底行让位', 'photo', async page => {
  await item(page, 'F').click({ button: 'right' });
  await page.getByText('尺寸', { exact: true }).hover();
  await page.getByText('2x2', { exact: true }).click();
  const resized = await snapshot(page);
  assert.deepEqual(position(resized, 'Photos'), ['P1', 2, 5]);

  const grab = await cell(page, 1, 3);
  await page.mouse.move(grab.x - 12, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x, grab.y, { steps: 3 });
  await page.waitForFunction(() => document.body.style.cursor === 'grabbing');
  for (const [folderCol, photoCol] of [[4, 3], [3, 5]]) {
    await move(page, await cell(page, 1, folderCol), 500);
    await assertRendered(page, 'Photos', 2, photoCol);
  }
  assert.equal((await snapshot(page)).changes.length, resized.changes.length);
  await drop(page);
  assert.deepEqual(position(await snapshot(page), 'Photos'), ['P1', 2, 5]);
});

scenario('胶囊指示器点击时有连续中间帧，拖动页面时高亮跟手', 'indicators', async page => {
  const dots = page.locator('[data-desktop-dots]');
  const marker = dots.locator('[aria-hidden="true"]');
  const read = () => marker.evaluate(el => parseFloat(getComputedStyle(el).insetInlineStart));
  const start = await read();
  // 从实际点击开始采样，覆盖一次跨两页的切换。
  await marker.evaluate(el => {
    window.dotFrames = new Promise(resolve => {
      window.addEventListener('click', () => {
        const frames = [];
        const begin = performance.now();
        const sample = () => {
          frames.push(parseFloat(getComputedStyle(el).insetInlineStart));
          if (performance.now() - begin < 430) requestAnimationFrame(sample);
          else resolve(frames);
        };
        sample();
      }, { capture: true, once: true });
    });
  });
  await dots.getByRole('button', { name: '3 / 3' }).click();
  const frames = await page.evaluate(() => window.dotFrames);
  const end = frames.at(-1);
  assert.ok(end > start);
  assert.ok(new Set(frames.filter(x => x > start + 0.1 && x < end - 0.1)).size >= 3);
  assert.equal((await snapshot(page)).currentPage, 2);

  await page.mouse.move(250, 250);
  await page.mouse.down();
  await page.mouse.move(550, 250, { steps: 8 });
  const held = await read();
  assert.ok(held > start && held < end - 1);
  assert.equal((await snapshot(page)).currentPage, 2);
  await page.mouse.up();
  assert.equal((await snapshot(page)).currentPage, 1);
});

scenario('指示器支持预设、颜色、键盘导航、自定义渲染与隐藏', 'indicators', async page => {
  const dots = page.locator('[data-desktop-dots]');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const variant of ['dots', 'bars']) {
    await page.evaluate(v => window.setIndicator({ variant: v, activeColor: '#40c080', inactiveColor: '#607080' }), variant);
    const marker = dots.locator('[aria-hidden="true"]');
    const style = await marker.evaluate(el => {
      const s = getComputedStyle(el);
      return [s.width, s.height, s.backgroundColor, s.transitionDuration];
    });
    assert.deepEqual(style, variant === 'dots'
      ? ['7px', '7px', 'rgb(64, 192, 128)', '0s']
      : ['16px', '4px', 'rgb(64, 192, 128)', '0s']);
    assert.equal(await dots.locator('button').first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(96, 112, 128)');
  }
  await dots.getByRole('button', { name: '3 / 3' }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await dots.locator('[aria-current="page"]').getAttribute('aria-label'), '3 / 3');
  await page.evaluate(() => window.setCustomDots(true));
  await dots.getByRole('navigation', { name: 'Pages' }).getByRole('button', { name: 'Page 2' }).click();
  assert.equal((await snapshot(page)).currentPage, 1);
  assert.equal(await dots.locator('[aria-hidden="true"]').count(), 0);
  await page.evaluate(() => window.setIndicator(false));
  await dots.waitFor({ state: 'detached' });
});


scenario('自定义基础主题和菜单覆盖实时作用于主菜单、尺寸子菜单和桌面材质', 'menu-theme', async page => {
  const base = {
    backgroundColor: '#203040', textColor: '#eddfcb',
    dangerColor: '#ffb088', primaryColor: '#8fe4c0', highlightColor: '#d4aefe',
    shadowColor: '#16202a', borderColor: '#607488', hoverColor: '#334455',
    backdropFilter: 'blur(7px)', fontFamily: 'Georgia, serif',
  };
  await page.evaluate(base => window.setMenuTheme({ token: { base } }), base);
  const folder = item(page, 'F');
  const label = folder.getByText('F', { exact: true }).last();
  assert.match(await label.evaluate(el => getComputedStyle(el).textShadow), /rgb\(22, 32, 42\)/);
  assert.match(await label.evaluate(el => getComputedStyle(el).fontFamily), /Georgia/);
  await folder.click({ button: 'right' });
  const remove = page.getByText('移除', { exact: true });
  const size = page.getByText('尺寸', { exact: true });
  const surface = remove.locator('../..');
  const cssValue = (node, prop) => node.evaluate((el, key) => getComputedStyle(el)[key], prop);
  assert.equal(await cssValue(remove, 'color'), 'rgb(255, 176, 136)');
  assert.equal(await cssValue(surface, 'backdropFilter'), 'blur(7px)');
  assert.equal(await cssValue(surface, 'backgroundColor'), 'rgb(32, 48, 64)');
  assert.equal(await cssValue(size, 'color'), 'rgb(237, 223, 203)');
  await size.hover();
  const selected = page.locator('[data-selected="true"]');
  await selected.waitFor();
  assert.equal(await cssValue(selected.locator(':scope > svg'), 'fill'), 'rgb(143, 228, 192)');
  const originalShine = await cssValue(surface, 'backgroundImage');
  const hovered = size.locator('..').locator(':scope > div').first();
  assert.equal(await cssValue(hovered, 'backgroundColor'), 'rgb(51, 68, 85)');
  const menu = { activeColor: '#554077', dangerColor: '#ef91ae', iconColor: '#c6a8ff', selectedColor: '#f9cc7c',
    backgroundColor: '#3e2752', backdropFilter: 'blur(13px)', borderRadius: '22px' };
  await page.evaluate(({ base, menu }) => window.setMenuTheme({ token: { base: { ...base, highlightColor: '#ffdd44' }, contextMenu: menu } }), { base, menu });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-selected="true"]').parentElement).borderRadius === '22px');
  assert.notEqual(await cssValue(surface, 'backgroundImage'), originalShine);
  assert.equal(await cssValue(hovered, 'backgroundColor'), 'rgb(85, 64, 119)');
  for (const panel of [surface, selected.locator('..')]) {
    assert.equal(await cssValue(panel, 'backdropFilter'), 'blur(13px)');
    assert.equal(await cssValue(panel, 'backgroundColor'), 'rgb(62, 39, 82)');
  }
  assert.equal(await cssValue(remove, 'color'), 'rgb(239, 145, 174)');
  assert.equal(await cssValue(size.locator('..').locator('svg').first(), 'color'), 'rgb(198, 168, 255)');
  assert.equal(await cssValue(selected.locator(':scope > svg'), 'fill'), 'rgb(249, 204, 124)');
  await page.getByText('2x2', { exact: true }).click();
  assert.equal((await snapshot(page)).pages[0].children[0].config.sizeId, '2x2');
});


scenario('浅深主题切换时三种指示器与桌面玻璃使用各自配色，调用方颜色优先', 'surfaces', async page => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const dots = page.locator('[data-desktop-dots]');
  const marker = dots.locator('[aria-hidden="true"]');
  const color = node => node.evaluate(el => getComputedStyle(el).backgroundColor);
  const folder = item(page, 'F').locator(':scope > div').first();
  const dock = page.locator('[data-grid-item-id="fixed"]').locator('xpath=ancestor::*[contains(@class,"zs-justify-between")][1]');
  const launcher = dock.locator('.zs-flex-shrink-0.zs-cursor-pointer').locator(':scope > div').last();
  for (const [theme, selected] of [['light', 'rgb(255, 255, 255)'], ['dark', 'rgb(248, 249, 255)']]) {
    await page.evaluate(t => window.setMenuTheme(t), theme);
    await page.waitForTimeout(250); // Dock 的背景色也有切换过渡。
    for (const variant of ['pill', 'dots', 'bars']) {
      await page.evaluate(v => window.setIndicator({ variant: v }), variant);
      await dots.locator('[data-variant="' + variant + '"]').waitFor();
      assert.equal(await color(marker), selected);
      if (variant === 'pill') {
        const surfaces = await Promise.all([dock, folder, launcher, dots.locator('[data-variant="pill"]')].map(color));
        assert.ok(surfaces.every(value => value === surfaces[0]), JSON.stringify(surfaces));
      }
      assert.notEqual(await color(dots.locator('button').last()), selected);
    }
  }
  const palette = { activeColor: '#ffd780', inactiveColor: '#876543', edgeColor: '#123456' };
  await page.evaluate(pagination => window.setMenuTheme({ token: { desktop: { pagination } } }), palette);
  assert.equal(await color(marker), 'rgb(255, 215, 128)');
  await page.evaluate(() => window.setIndicator({ activeColor: '#f05076' }));
  assert.equal(await color(marker), 'rgb(240, 80, 118)');
  assert.equal(await color(dots.locator('button').last()), 'rgb(135, 101, 67)');
});

scenario('打开的启动台中搜索框、空状态、索引和弹层随主题实时更新', 'surfaces', async page => {
  const base = { textColor: '#f2e8d7', backgroundColor: '#193034', primaryColor: '#67d5bd' };
  await page.evaluate(base => window.setMenuTheme({ token: { base } }), base);
  await page.locator('[data-grid-item-id="fixed"]').locator('xpath=ancestor::*[contains(@class,"zs-justify-between")][1]')
    .locator('.zs-flex-shrink-0.zs-cursor-pointer').click();
  const panel = page.locator('[data-base-modal-panel]:visible');
  const input = panel.getByRole('textbox');
  const style = (el, key) => el.evaluate((n, k) => getComputedStyle(n)[k], key);
  assert.equal(await style(panel, 'backgroundColor'), 'rgb(25, 48, 52)');
  assert.equal(await style(input, 'color'), 'rgb(242, 232, 215)');
  await input.fill('no-such-application');
  assert.equal(await style(panel.getByText('未找到相关应用'), 'color'), 'rgb(242, 232, 215)');
  await page.evaluate(() => window.setMenuTheme('light'));
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-base-modal-panel] input')).color === 'rgba(28, 28, 30, 0.88)');
  assert.equal(await style(panel.getByText('未找到相关应用'), 'color'), 'rgba(28, 28, 30, 0.88)');
  await input.fill('');
  const index = panel.getByRole('button', { name: 'A', exact: true });
  await index.hover();
  await page.waitForTimeout(400);
  assert.equal(await style(index, 'color'), 'rgb(19, 92, 200)');
});

scenario('文件夹底色覆盖只作用于文件夹，打开后也响应主题变化', 'surfaces', async page => {
  await item(page, 'F').click();
  const panel = page.locator('[data-base-modal-panel]:visible');
  await page.evaluate(() => window.setMenuTheme({ token: {
    base: { textColor: '#fff0db', backgroundColor: '#402e21' },
    modal: { content: { backgroundColor: '#443366' } },
    items: { groupModal: { backgroundColor: '#57324a', title: { textColor: '#fae388' } } },
  } }));
  assert.equal(await panel.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(87, 50, 74)');
  assert.equal(await panel.getByRole('textbox').evaluate(el => getComputedStyle(el).color), 'rgb(250, 227, 136)');
});


scenario('单独传给 Dock 的主题在图标、启动台应用与搜索框中一致', 'surfaces', async page => {
  await page.evaluate(() => { window.setMenuTheme('light'); window.setDockTheme({ token: {
    base: { textColor: '#d8efac', backgroundColor: '#304117' }
  } }); });
  const color = el => el.evaluate(n => getComputedStyle(n).color);
  assert.equal(await color(item(page, 'A').getByText('A', { exact: true }).last()), 'rgb(21, 36, 66)');
  const fixed = page.locator('[data-grid-item-id="fixed"]');
  assert.equal(await color(fixed.getByText('f', { exact: true })), 'rgb(216, 239, 172)');
  await fixed.locator('xpath=ancestor::*[contains(@class,"zs-justify-between")][1]')
    .locator('.zs-flex-shrink-0.zs-cursor-pointer').click();
  const panel = page.locator('[data-base-modal-panel]:visible');
  assert.equal(await color(panel.getByRole('textbox')), 'rgb(216, 239, 172)');
  assert.equal(await color(panel.locator('[data-grid-item-id="A"]').getByText('A', { exact: true }).last()), 'rgb(216, 239, 172)');
});

scenario('手机启动台抽屉的遮罩、面板和关闭按钮随已打开的主题切换', 'surfaces', async page => {
  await page.evaluate(() => window.setMenuTheme('light'));
  const handle = page.locator('[class*="zs-overscroll-y-contain"]').last();
  await handle.waitFor();
  const cdp = await page.context().newCDPSession(page);
  const box = await handle.boundingBox();
  const x = box.x + box.width / 2, y = Math.min(page.viewportSize().height - 1, box.y + box.height / 2);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let dy = 15; dy <= 105; dy += 15) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - dy }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const drawer = page.locator('.rc-drawer-content-wrapper:visible');
  const bg = el => el.evaluate(n => getComputedStyle(n).backgroundColor);
  assert.equal(await bg(drawer), 'rgba(240, 245, 253, 0.87)');
  await page.evaluate(() => window.setMenuTheme({ token: {
    base: { backgroundColor: '#392348', textColor: '#f2dee7' },
    modal: { mask: { backgroundColor: '#31222e' } },
  } }));
  assert.equal(await bg(drawer), 'rgb(57, 35, 72)');
  assert.equal(await bg(page.locator('.rc-drawer-mask')), 'rgb(49, 34, 46)');
  assert.equal(await drawer.getByRole('button', { name: '关闭' }).evaluate(n => getComputedStyle(n).color), 'rgb(242, 222, 231)');
  await drawer.getByRole('button', { name: '关闭' }).tap();
  await drawer.waitFor({ state: 'hidden' });
}, { width: 390, height: 844 }, { isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' });


scenario('浮动按钮、弹窗正文和减少透明度设置读取当前主题', 'floating-controls', async page => {
  await page.evaluate(() => window.setMenuTheme({ token: {
    base: { textColor: '#cceeff', primaryColor: '#66bbcc', backgroundColor: 'rgba(32, 42, 68, .72)' },
    modal: { floatingControls: {
      closeButton: { backgroundColor: '#ec648e' }, fullscreenButton: { backgroundColor: '#65b0ce' },
    } },
  } }));
  const panel = page.locator('[data-base-modal-panel]:visible');
  const style = (el, key) => el.evaluate((n, k) => getComputedStyle(n)[k], key);
  assert.equal(await style(panel.getByText('Content'), 'color'), 'rgb(204, 238, 255)');
  assert.equal(await style(panel.getByRole('button', { name: '关闭' }), 'backgroundColor'), 'rgb(236, 100, 142)');
  assert.equal(await style(panel.getByRole('button', { name: '全屏' }), 'backgroundColor'), 'rgb(101, 176, 206)');
  const cdp = await page.context().newCDPSession(page);
  for (const feature of [{ name: 'prefers-reduced-transparency', value: 'reduce' }, { name: 'prefers-contrast', value: 'more' }]) {
    await cdp.send('Emulation.setEmulatedMedia', { features: [feature] });
    assert.equal(await style(panel, 'backdropFilter'), 'none');
    assert.equal(await style(panel.locator('.base-modal-floating-controls'), 'backdropFilter'), 'none');
  }
});

scenario('合并高亮与跨页边缘提示使用当前主题强调色', 'surfaces', async page => {
  await page.evaluate(() => window.setMenuTheme({ token: { base: { primaryColor: '#44bb66' } } }));
  await start(page, item(page, 'A'));
  await move(page, await center(item(page, 'F')), 700);
  const target = item(page, 'F').locator(':scope > div').first();
  assert.match(await target.evaluate(n => getComputedStyle(n).animationName), /mergeTargetPulse/);
  assert.equal(await target.evaluate(n => getComputedStyle(n).getPropertyValue('--zs-merge-ring').trim()), '#44bb66');
  await move(page, { x: 895, y: 180 }, 30);
  const edge = page.locator('[data-side="right"][data-active="true"]');
  assert.match(await edge.evaluate(el => el.style.background), /68, 187, 102/);
  await page.keyboard.press('Escape');
  await page.mouse.up();
});

scenario('分页高亮与圆点在实际绘制时共用同一水平中心线', 'indicators', async page => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const track = page.locator('[data-desktop-dots] [data-variant]');
  // 从截图测量像素中心，捕捉布局坐标相同但绘制时产生的半像素偏差。
  await page.addStyleTag({ content: `
    [data-desktop-dots] [data-variant] { background: black !important; box-shadow: none !important; }
    [data-desktop-dots] button, [data-desktop-dots] span[aria-hidden] { background: white !important; box-shadow: none !important; }
    [data-desktop-dots] button[data-active=true] { background: transparent !important; }
  ` });
  for (const variant of ['pill', 'dots', 'bars']) {
    await page.evaluate(v => window.setIndicator({ variant: v }), variant);
    await track.getByRole('button', { name: '3 / 3' }).click();
    const png = (await track.screenshot({ scale: 'css' })).toString('base64');
    const centres = await track.evaluate(async (el, data) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + data;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const bounds = el.getBoundingClientRect();
      return [...el.querySelectorAll('button[data-active=false],span[aria-hidden]')].map(node => {
        const rect = node.getBoundingClientRect();
        const x = Math.floor(rect.left + rect.width / 2 - bounds.left);
        const pixels = ctx.getImageData(x, 3, 1, img.height - 6).data;
        let total = 0, moment = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          total += pixels[i];
          moment += pixels[i] * (i / 4);
        }
        return moment / total;
      });
    }, png);
    assert.ok(Math.max(...centres) - Math.min(...centres) < 0.15, `${variant} 的像素中心为 ${centres}`);
  }
});


scenario('430×932 响应式预览打开全屏启动台，横竖屏图标完整且可滚动', 'app-drawer', async page => {
  await page.locator('[data-grid-item-id="fixed"]').locator('xpath=ancestor::*[contains(@class,"zs-justify-between")][1]')
    .locator('.zs-flex-shrink-0.zs-cursor-pointer').click();
  const panel = page.locator('.rc-drawer-content-wrapper:visible, [data-base-modal-panel]:visible').last();
  await panel.waitFor();
  const search = panel.getByRole('textbox');
  for (const size of [{ width: 430, height: 932 }, { width: 320, height: 640 }, { width: 932, height: 430 }]) {
    await page.setViewportSize(size);
    await panel.evaluate(async el => {
      await new Promise(requestAnimationFrame);
      await Promise.all(el.getAnimations().map(animation => animation.finished));
    });
    const bounds = await panel.boundingBox();
    assert.deepEqual(Object.values(bounds).map(Math.round), [0, 0, size.width, size.height]);
    const cells = panel.locator('[data-grid-item-id]');
    assert.equal(await cells.count(), 64);
    const rects = await cells.evaluateAll(nodes => nodes.map(n => {
      const r = n.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }));
    const topRow = rects.filter(r => Math.abs(r.y - rects[0].y) < 1);
    if (size.width === 430) assert.equal(topRow.length, 4);
    for (const [i, rect] of rects.entries()) {
      assert.ok(rect.x >= 0 && rect.right <= size.width);
      if (i && Math.abs(rect.y - rects[i-1].y) < 1) assert.ok(rect.x >= rects[i-1].right - 1);
    }
  }
  const scroller = panel.locator('[data-launchpad-scroll]');
  const header = await search.boundingBox();
  const firstCell = await center(scroller.locator('[data-grid-item-id]').nth(10));
  const touch = await page.context().newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [firstCell] });
  for (let dy = 15; dy <= 105; dy += 15) {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: firstCell.x, y: firstCell.y - dy }] });
  }
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForFunction(() => document.querySelector('[data-launchpad-scroll]').scrollTop > 0);
  assert.equal(await page.evaluate(() => window.lastLaunch), undefined);
  await panel.getByRole('button', { name: 'P', exact: true }).click();
  await page.waitForTimeout(450);
  assert.ok(await scroller.evaluate(n => n.scrollTop > 0));
  assert.equal(Math.round((await search.boundingBox()).y), Math.round(header.y));
  await search.fill('P 应用 63');
  await panel.locator('[data-grid-item-id="63"]').tap();
  assert.equal(await page.evaluate(() => window.lastLaunch), '63');
  await panel.getByRole('button', { name: '关闭' }).click();
  await panel.waitFor({ state: 'hidden' });
}, { width: 430, height: 932 }, { isMobile: true, hasTouch: true });

scenario('抽屉搜索图标在聚焦、输入、清除时保持同一位置', 'app-drawer', async page => {
  await page.locator('[data-grid-item-id="fixed"]').locator('xpath=ancestor::*[contains(@class,"zs-justify-between")][1]')
    .locator('.zs-flex-shrink-0.zs-cursor-pointer').click();
  const panel = page.locator('.rc-drawer-content-wrapper:visible');
  const input = panel.getByRole('textbox');
  await input.waitFor();
  await page.waitForTimeout(300);
  const measure = () => input.evaluate(node => {
    const icon = [...node.parentElement.querySelectorAll('svg')].find(s => !s.closest('button')
      && !['transparent', 'rgba(0, 0, 0, 0)'].includes(getComputedStyle(s).color)
      && Number(getComputedStyle(s.parentElement).opacity) > 0);
    const r = icon.getBoundingClientRect(), field = node.getBoundingClientRect();
    return { x: r.left - field.left, dy: r.top + r.height / 2 - field.top - field.height / 2 };
  });
  const rest = await measure();
  await input.focus();
  await page.waitForTimeout(230);
  const focused = await measure();
  assert.ok(Math.abs(focused.dy) < 1 && Math.abs(focused.x - rest.x) < 1, JSON.stringify({ rest, focused }));
  await input.fill('应用');
  assert.deepEqual(await measure(), focused);
  const clear = input.locator('..').getByRole('button');
  const clearBox = await clear.boundingBox(), field = await input.boundingBox();
  assert.ok(Math.abs(clearBox.y + clearBox.height/2 - field.y - field.height/2) < 1);
  await clear.click();
  assert.equal(await input.inputValue(), '');
  assert.deepEqual(await measure(), focused);
}, { width: 430, height: 932 }, { isMobile: true, hasTouch: true });

scenario('启动台显示完整字母表，点选字母只弱化其他分组的图标', 'app-drawer', async page => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-grid-item-id="fixed"]').locator('xpath=ancestor::*[contains(@class,"zs-justify-between")][1]')
    .locator('.zs-flex-shrink-0.zs-cursor-pointer').click();
  const panel = page.locator('.rc-drawer-content-wrapper:visible');
  const rail = panel.locator('[data-launchpad-index]');
  await rail.waitFor();
  assert.deepEqual(await rail.getByRole('button').allTextContents(), [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ#']);
  assert.ok(await rail.getByRole('button', {name:'Z', exact:true}).isDisabled());
  const a = rail.getByRole('button', {name:'A', exact:true}), b = rail.getByRole('button', {name:'B', exact:true});
  const filter = id => panel.locator(`[data-grid-item-id="${id}"]`).evaluate(n => getComputedStyle(n).filter);
  await a.click();
  assert.equal(await a.getAttribute('aria-pressed'), null);
  assert.equal(await filter('0'), 'none');
  assert.match(await filter('1'), /grayscale\(1\)/);
  assert.equal(await panel.locator('[data-grid-item-id]').count(), 64);
  await b.click();
  assert.match(await filter('0'), /grayscale\(1\)/);
  assert.equal(await filter('1'), 'none');
  await b.click();
  assert.match(await filter('0'), /grayscale\(1\)/);
  await a.click();
  await panel.getByRole('textbox').fill('B 应用');
  assert.ok(await a.isDisabled());
  assert.equal(await filter('1'), 'none');
  assert.deepEqual(await rail.getByRole('button').allTextContents(), [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ#']);
  await panel.getByRole('textbox').fill('___');
  assert.equal(await rail.locator('button:disabled').count(), 27);
  await panel.getByRole('textbox').fill('');
  await rail.getByRole('button', { name: '#', exact: true }).click();
  assert.equal(await filter('62'), 'none');
  assert.match(await filter('61'), /grayscale\(1\)/);
  await rail.getByRole('button', { name: 'D', exact: true }).click();
  assert.equal(await filter('61'), 'none'); // 地图按拼音归入 D。
  assert.match(await filter('62'), /grayscale\(1\)/);
  await panel.getByRole('button', { name: '关闭' }).click();
  await panel.waitFor({ state: 'hidden' });
  await page.locator('[data-grid-item-id="fixed"]').locator('xpath=ancestor::*[contains(@class,"zs-justify-between")][1]')
    .locator('.zs-flex-shrink-0.zs-cursor-pointer').click();
  await rail.waitFor();
  assert.equal(await filter('62'), 'none');
}, { width: 430, height: 932 }, { isMobile: true, hasTouch: true });


scenario('字母提示渐变置灰，最后一次点击约两秒后自动渐变恢复', 'app-drawer', async page => {
  await page.locator('[data-grid-item-id="fixed"]').locator('xpath=ancestor::*[contains(@class,"zs-justify-between")][1]')
    .locator('.zs-flex-shrink-0.zs-cursor-pointer').click();
  const panel = page.locator('.rc-drawer-content-wrapper:visible');
  const a = panel.getByRole('button', {name: 'A', exact: true});
  const other = panel.locator('[data-grid-item-id="1"]');
  await a.waitFor();
  await other.evaluate(el => {
    window.letterSamples = [];
    const sample = () => {
      const filter = getComputedStyle(el).filter;
      window.letterSamples.push(Number(/grayscale\(([.\d]+)\)/.exec(filter)?.[1] ?? 0));
      if (el.isConnected && window.letterSamples.length < 1200) requestAnimationFrame(sample);
    };
    sample();
  });
  await a.click();
  await page.waitForFunction(() => window.letterSamples.includes(1));
  await page.waitForTimeout(1000);
  await a.click();
  await page.waitForTimeout(1150);
  assert.match(await other.evaluate(n => getComputedStyle(n).filter), /grayscale\(1\)/);
  await page.waitForFunction(() => window.letterSamples.at(-1) === 0, undefined, { timeout: 2800 });
  const values = await page.evaluate(() => window.letterSamples);
  const isIntermediate = n => n > 0 && n < 1;
  assert.ok(values.slice(0, values.indexOf(1)).some(isIntermediate), '置灰应有过渡帧');
  assert.ok(values.slice(values.lastIndexOf(1) + 1).some(isIntermediate), '恢复应有过渡帧');
  assert.equal(await other.evaluate(n => getComputedStyle(n).filter), 'none');
  assert.equal(await a.getAttribute('aria-pressed'), null);
}, { width: 430, height: 932 }, { isMobile: true, hasTouch: true });
