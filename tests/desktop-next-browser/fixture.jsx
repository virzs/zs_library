import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/index.css';
import Desktop, { BaseModal, convertLegacyDesktopPages } from '../../src/components/desktop-next';

const scenario = location.search.slice(1);
const registry = {
  weather: {
    name: 'Weather',
    sizeConfigs: [
      { id: '1x1', name: 'Small', row: 1, col: 1 },
      { id: '2x2', name: 'Large', row: 2, col: 2 },
    ],
    defaultSizeId: '2x2',
  },
};
const extras = [{ id: 'extra', type: 'app', data: { name: '额外图标' } }];
const fixedGrid = { rows: 2, columns: 3 };
const grids = {
  photo: { rows: 3, columns: 6 }, footprint: { rows: 3, columns: 6 }, push: { rows: 3, columns: 6 },
  auto: undefined, threshold: undefined, manual: undefined, mobile: { mobile: { rows: 3, columns: 5 } },
  short: { rows: 2, columns: 'auto' },
};
const app = (id, row, col, type = 'app') => ({ id, type, data: { name: id }, position: { row, col } });
const singlePage = (...children) => [{ id: 'P1', children }];
const icons = (count, cols = 3) => Array.from({ length: count }, (_, i) => app(String(i), Math.floor(i / cols), i % cols));

function initialPages() {
  switch (scenario) {
    case 'legacy': {
      const old = singlePage(...Array.from({ length: 9 }, (_, i) => ({ id: String(i), type: 'app' })));
      const converted = convertLegacyDesktopPages(old, fixedGrid);
      window.legacy = old;
      return converted;
    }
    case 'mobile':
    case 'auto': return singlePage(...icons(20, 6));
    case 'sort': return singlePage(app('A', 0, 0), app('B', 0, 1), app('C', 0, 2));
    case 'spill': return singlePage(...icons(7));
    case 'threshold': return singlePage(...icons(8, 4));
    case 'manual': return [...singlePage(app('A', 0, 4)), { id: 'empty', children: [] }, { id: 'personal', children: [app('B', 0, 2)] }];
    case 'short': return singlePage(...icons(11));
    case 'scroll':
    case 'limit': return singlePage(...icons(21));
    case 'extras': return singlePage(...icons(6));
    case 'surfaces': return [...singlePage(app('A', 0, 0), { ...app('F', 0, 1, 'group'),
      children: [app('B', 0, 0), app('C', 0, 1)] }), { id: 'P2', children: [] }];
    case 'app-drawer': return singlePage(...icons(64).map((item, i) => ({
      ...item, data: { name: ({ 61: '地图', 62: '123 工具' })[i] ?? String.fromCharCode(65 + i % 16) + ' 应用 ' + i },
    })));
    case 'menu-theme':
    case 'folder-sort': return singlePage({ ...app('F', 0, 0, 'group'), children: ['A', 'B', 'C'].map(id => ({ id, type: 'app', data: { name: id } })) });
    case 'photo': return singlePage(
      app('Chrome', 0, 0), app('VSCode', 0, 2), app('Figma', 0, 3),
      app('Slack', 1, 0), app('Notion', 1, 1), app('Spotify', 1, 2),
      { ...app('F', 1, 3, 'group'), children: [{ id: 'child', type: 'app' }] },
      app('Safari', 2, 0), app('Mail', 2, 1), app('Cal', 2, 2), app('Photos', 2, 3),
    );
    case 'push': return singlePage(
      { ...app('F', 1, 4, 'group'), config: { sizeId: '2x2' }, children: [{ id: 'child', type: 'app' }] },
      ...['Chrome', 'Photos', 'VSCode', 'Figma'].map((id, col) => app(id, 0, col)),
      ...['Notion', 'Spotify', 'Slack'].map((id, col) => app(id, 1, col + 1)),
      ...['Mail', 'Cal', 'Safari'].map((id, col) => app(id, 2, col + 1)),
    );
    case 'footprint': return singlePage(
      { ...app('F', 0, 4, 'group'), config: { sizeId: '2x2' }, children: [{ id: 'child', type: 'app' }] },
      app('A', 1, 2), app('B', 1, 3), app('C', 2, 2),
      app('left', 1, 0), app('top', 0, 1), app('right', 2, 5),
    );
    case 'block-full': return [...singlePage(app('W', 0, 0, 'weather'), app('wall', 1, 2)), { id: 'P2', children: icons(6) }];
    case 'widget': return singlePage(app('W', 0, 0, 'weather'));
    case 'size': return singlePage(app('A', 0, 0), app('B', 0, 2), app('C', 1, 1), {
      ...app('W', 1, 0, 'weather'), config: { sizeId: '1x1' },
    });
    case 'multi': return singlePage(app('A', 0, 0), app('B', 0, 2), app('C', 1, 1), app('W', 0, 0, 'weather'));
    case 'indicators': return ['one', 'two', 'three'].map(name => ({ id: name, children: [app(name, 0, 0)] }));
    case 'external':
    case 'cross':
    case 'full': return [...singlePage(app('A', 0, 0), app('B', 0, 2)), {
      id: 'P2', children: scenario === 'full' ? icons(6) : [app('C', 0, 0)],
    }];
    default: return singlePage(app('A', 0, 0), app('B', 0, 2));
  }
}

function Fixture() {
  const [pages, setPages] = useState(initialPages);
  const [storageKey, setStorageKey] = useState(['storage', 'extras', 'cache'].includes(scenario) ? 'desktop-next-test' : undefined);
  const [theme, setTheme] = useState();
  if (['menu-theme', 'surfaces', 'floating-controls'].includes(scenario)) window.setMenuTheme = setTheme;
  const [dockTheme, setDockTheme] = useState();
  if (scenario === 'surfaces') window.setDockTheme = setDockTheme;
  const [indicator, setIndicator] = useState();
  const [customDots, setCustomDots] = useState(false);
  window.setIndicator = setIndicator;
  window.setCustomDots = setCustomDots;
  const handle = useRef(null);
  const changes = useRef([]);
  window.removePage = id => setPages(current => current.filter(page => page.id !== id));
  window.switchStorageKey = setStorageKey;
  window.snapshot = () => ({ ...handle.current, changes: changes.current });
  return <><Desktop
    ref={handle} pages={pages} iconSize={56} componentRegistry={registry} mergeDwellTime={scenario === 'full' ? 1200 : 220}
    grid={Object.hasOwn(grids, scenario) ? grids[scenario] : fixedGrid}
    preserveGaps={!['compact', 'short'].includes(scenario)}
    autoPaginate={scenario !== 'scroll'} maxPages={scenario === 'limit' ? 1 : 0}
    extraItems={scenario === 'extras' ? extras : undefined}
    dockProps={['surfaces', 'app-drawer'].includes(scenario) ? {
      theme: dockTheme, showLaunchpad: true, fixedItems: [app('fixed', 0, 0)],
      onLaunchpadItemClick: scenario === 'app-drawer' ? item => { window.lastLaunch = item.id; } : undefined,
    } : undefined}
    theme={theme} pagination={indicator}
    pagingDotBuilder={customDots ? (i, active, selectPage) =>
      <button type="button" onClick={selectPage} aria-pressed={active}>Page {i + 1}</button> : undefined}
    pagingDotsBuilder={customDots ? dots => <nav aria-label="Pages">{dots}</nav> : undefined}
    storageKey={storageKey}
    onChange={next => { changes.current.push(next); setPages(next); }}
  />
    {scenario === 'floating-controls' && <BaseModal theme={theme} title="Panel" visible floatingControls onClose={() => {}}>
      <span>Content</span>
    </BaseModal>}
  </>;
}
createRoot(document.querySelector('#root')).render(<Fixture />);
