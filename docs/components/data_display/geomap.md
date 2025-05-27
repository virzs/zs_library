# GeoMap 中国地理地图组件

GeoMap 组件是一个基于 react-map-gl 和 maplibre-gl 的地理数据可视化组件,支持根据地图缩放级别自动加载和卸载不同级别的中国行政区划地理数据。

## 基本用法

```jsx direction=vertical
import { GeoMap } from "zs_library";

export default () => {
  return (
    <div style={{ height: "400px" }}>
      <GeoMap />
    </div>
  );
};
```

## 设置初始视图

你可以通过 `initialZoom`、`initialLongitude` 和 `initialLatitude` 属性设置地图的初始视图:

```jsx direction=vertical
import { GeoMap } from "zs_library";

export default () => {
  return (
    <div style={{ height: "400px" }}>
      <GeoMap initialZoom={4} initialLongitude={116.4} initialLatitude={39.9} />
    </div>
  );
};
```

## 自定义地图样式

你可以通过 `mapStyle` 属性自定义地图样式:

```jsx direction=vertical
import { GeoMap } from "zs_library";

export default () => {
  return (
    <div style={{ height: "400px" }}>
      <GeoMap mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
    </div>
  );
};
```

## 自定义地理数据获取方法

你可以通过 `fetchGeoData` 属性自定义地理数据获取方法，这在需要使用私有地理数据源或者在访问阿里云 DataV 受限的环境中特别有用：

```jsx direction=vertical
import { GeoMap } from "zs_library";

export default () => {
  // 自定义地理数据获取方法
  const customFetchGeoData = async (areaId) => {
    // 示例：依然使用阿里云的接口，但添加自定义逻辑
    console.log(`使用自定义请求方法获取区域ID: ${areaId} 的地理数据`);

    // 实际请求依然使用阿里云接口，但可以添加自己的缓存、认证、日志等逻辑
    const response = await fetch(
      `https://geo.datav.aliyun.com/areas_v3/bound/${areaId}_full.json`
    );
    if (!response.ok) {
      throw new Error(`Failed to load geo data: ${response.status}`);
    }
    return response.json(); // 返回 GeoJSON FeatureCollection 格式
  };

  return (
    <div style={{ height: "400px" }}>
      <GeoMap fetchGeoData={customFetchGeoData} />
    </div>
  );
};
```

## 自定义缩放级别与区域数据的映射关系

你可以通过 `zoomLevels` 属性自定义缩放级别与区域数据的映射关系:

```jsx direction=vertical
import { GeoMap } from "zs_library";

export default () => {
  return (
    <div style={{ height: "400px" }}>
      <GeoMap
        zoomLevels={{
          6: 3, // 省级数据在缩放级别3或更高时可见
          8: 6, // 市级数据在缩放级别6或更高时可见
          10: 8, // 区县级数据在缩放级别8或更高时可见
          12: 10, // 街道级数据在缩放级别10或更高时可见
        }}
      />
    </div>
  );
};
```

## 监听可见区域变化

你可以通过 `onVisibleAreasChanged` 回调函数监听地图视图范围内可见区域的变化：

```jsx direction=vertical
import { GeoMap } from "zs_library";
import { useState } from "react";

export default () => {
  const [visibleAreas, setVisibleAreas] = useState([]);

  const handleVisibleAreasChanged = (areas) => {
    setVisibleAreas(areas);
    console.log("当前可见区域:", areas);
  };

  return (
    <div style={{ height: "500px" }}>
      <div style={{ height: "400px" }}>
        <GeoMap onVisibleAreasChanged={handleVisibleAreasChanged} />
      </div>
      <div style={{ marginTop: "10px" }}>
        当前可见区域: {visibleAreas.map((area) => area.name).join(", ")}
      </div>
    </div>
  );
};
```

## API

### GeoMap

| 参数                  | 说明                             | 类型                                                                                               | 默认值                                                          |
| --------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| initialZoom           | 初始缩放级别                     | `number`                                                                                           | 3                                                               |
| initialLongitude      | 初始中心点经度                   | `number`                                                                                           | 108                                                             |
| initialLatitude       | 初始中心点纬度                   | `number`                                                                                           | 35                                                              |
| mapStyle              | 地图样式                         | `string`                                                                                           | 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' |
| className             | 自定义样式                       | `string`                                                                                           | ""                                                              |
| style                 | 地图容器样式                     | `React.CSSProperties`                                                                              | -                                                               |
| zoomLevels            | 区域 ID 长度与缩放级别的映射关系 | `Record<number, number>`                                                                           | { 6: 0, 8: 5, 10: 7, 12: 9 }                                    |
| onVisibleAreasChanged | 视图范围内区域变化时的回调函数   | `(visibleAreas: Array<{name: string; longitude: number; latitude: number; code: string}>) => void` | -                                                               |
| cityMinZoom           | 显示市级数据的最小缩放级别       | `number`                                                                                           | 5                                                               |
| districtMinZoom       | 显示区级数据的最小缩放级别       | `number`                                                                                           | 7                                                               |
| fetchGeoData          | 自定义地理数据获取方法           | `(areaId: string) => Promise<FeatureCollection>`                                                   | -                                                               |
| children              | 其他子组件                       | `React.ReactNode`                                                                                  | -                                                               |

## 工作原理

GeoMap 组件默认使用阿里云 DataV 提供的中国地理边界数据,根据不同的区域编码(`adcode`)加载不同级别的地理数据:

- 国家级数据: https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json
- 省级数据: https://geo.datav.aliyun.com/areas_v3/bound/{省份adcode}_full.json
- 市级数据: https://geo.datav.aliyun.com/areas_v3/bound/{市级adcode}_full.json
- 区县级数据: https://geo.datav.aliyun.com/areas_v3/bound/{区县adcode}_full.json

当用户放大地图时,组件会自动加载当前视图范围内下一级数据;当用户缩小地图时,组件会自动隐藏下一级的数据,以优化性能和用户体验。

如果提供了自定义的 `fetchGeoData` 方法，组件将使用该方法替代默认的阿里云 DataV 数据源获取地理数据。自定义方法需要返回标准的 GeoJSON FeatureCollection 格式数据.
