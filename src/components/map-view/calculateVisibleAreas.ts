import type { MapRef } from "react-map-gl/maplibre";
import type { FeatureCollection, Feature, Geometry, Position } from "geojson";

/**
 * 计算地理特征的边界框
 * 支持各种GeoJSON几何类型
 */
const calculateBoundingBox = (
  feature: Feature
): [number, number, number, number] | null => {
  // 如果特征已经有bbox属性，直接返回
  if (feature.bbox) {
    return feature.bbox as [number, number, number, number];
  }

  // 如果没有bbox但有geometry，尝试从geometry计算
  if (!feature.geometry) return null;

  try {
    let minLng = 180,
      minLat = 90,
      maxLng = -180,
      maxLat = -90;

    const processPoint = (coords: number[]) => {
      if (coords.length >= 2) {
        const [lng, lat] = coords;
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
      }
    };

    const processPoints = (
      coordsArray: number[] | number[][] | number[][][] | number[][][][]
    ) => {
      if (!Array.isArray(coordsArray)) return;

      if (typeof coordsArray[0] === "number") {
        // 单个点 [lng, lat]
        processPoint(coordsArray as number[]);
      } else {
        // 递归处理嵌套数组
        (
          coordsArray as (
            | number[]
            | number[][]
            | number[][][]
            | Position
            | Position[]
            | Position[][]
          )[]
        ).forEach((coord) => processPoints(coord));
      }
    };

    // 处理不同类型的几何数据
    switch (feature.geometry.type) {
      case "Point":
        if (Array.isArray(feature.geometry.coordinates)) {
          processPoint(feature.geometry.coordinates);
        }
        break;
      case "LineString":
      case "MultiPoint":
      case "Polygon":
      case "MultiLineString":
      case "MultiPolygon":
        if (feature.geometry.coordinates) {
          processPoints(feature.geometry.coordinates);
        }
        break;
      case "GeometryCollection":
        if (feature.geometry.geometries) {
          // 使用明确的类型定义，避免隐式any
          (feature.geometry.geometries as Geometry[]).forEach((geom) => {
            // 过滤包含coordinates属性的几何类型
            if ("coordinates" in geom && geom.coordinates) {
              processPoints(
                geom.coordinates as
                  | Position
                  | Position[]
                  | Position[][]
                  | Position[][][]
              );
            }
          });
        }
        break;
    }

    if (
      minLng <= maxLng &&
      minLat <= maxLat &&
      minLng !== 180 &&
      minLat !== 90 &&
      maxLng !== -180 &&
      maxLat !== -90
    ) {
      return [minLng, minLat, maxLng, maxLat];
    }
  } catch (error) {
    console.warn("计算边界框失败:", error);
  }

  return null;
};

/**
 * 计算当前视图范围内的省份
 * 即使省份只有一小部分在可视范围内也会被计入
 */
export const calculateVisibleAreas = (
  mapRef: MapRef | null,
  geoData: FeatureCollection | null,
  areaCenters: Array<{
    name: string;
    longitude: number;
    latitude: number;
    code: string;
  }>
): Array<{
  name: string;
  longitude: number;
  latitude: number;
  code: string;
}> => {
  if (!mapRef || !geoData) return [];
  // 获取当前地图的视图边界
  const bounds = mapRef.getBounds();

  // 视图边界的经纬度范围
  const viewWest = bounds.getWest();
  const viewEast = bounds.getEast();
  const viewSouth = bounds.getSouth();
  const viewNorth = bounds.getNorth();
  // 计算视图范围大小
  const viewWidth = Math.abs(viewEast - viewWest);
  const viewHeight = Math.abs(viewNorth - viewSouth);

  console.log("视图边界:", {
    west: viewWest,
    east: viewEast,
    south: viewSouth,
    north: viewNorth,
    width: viewWidth,
    height: viewHeight,
  });

  // 如果视图范围非常大（覆盖了整个中国），返回所有中心点
  if (viewWidth > 50 && viewHeight > 30) {
    console.log("视图范围很大，返回所有省份");
    return [...areaCenters];
  }

  // 筛选在视图范围内的省份
  const visibleCenters: Array<{
    name: string;
    longitude: number;
    latitude: number;
    code: string;
  }> = [];

  // 先创建一个code到中心点的映射，方便查找
  const centersByCode = new Map(
    areaCenters.map((center) => [center.code, center])
  );

  // 获取每个省份的地理边界并检查是否与视图边界相交
  geoData.features.forEach((feature: Feature) => {
    if (!feature.properties || !feature.properties.adcode) return;

    const { adcode } = feature.properties;

    // 查找此区域的中心点信息
    const centerInfo = centersByCode.get(adcode);
    if (!centerInfo) return; // 使用更强大的边界框计算函数
    let bbox = calculateBoundingBox(feature);

    // 如果没有边界框，从中心点创建一个较大的边界框
    if (!bbox && centerInfo) {
      const { longitude, latitude } = centerInfo;
      // 创建一个围绕中心点的大矩形 (±2度)
      bbox = [longitude - 2, latitude - 2, longitude + 2, latitude + 2];
    }

    if (!bbox) return;

    const [minLng, minLat, maxLng, maxLat] = bbox;

    // 检查省份的边界框是否与视图边界相交
    const isIntersecting = !(
      (
        maxLng < viewWest || // 省份完全在视图左侧
        minLng > viewEast || // 省份完全在视图右侧
        maxLat < viewSouth || // 省份完全在视图下方
        minLat > viewNorth
      ) // 省份完全在视图上方
    );
    if (isIntersecting) {
      visibleCenters.push(centerInfo);
    }
  });
  // 如果相交检测结果少于3个区域，使用额外的检查方法
  if (visibleCenters.length < 3) {
    console.log("找到的相交区域太少，尝试其他检查方法...");

    // 方法1: 直接检查中心点是否在视图内
    areaCenters.forEach((center) => {
      // 避免重复添加
      const alreadyAdded = visibleCenters.some((vc) => vc.code === center.code);
      if (alreadyAdded) return;

      const { longitude, latitude } = center;
      if (
        longitude >= viewWest &&
        longitude <= viewEast &&
        latitude >= viewSouth &&
        latitude <= viewNorth
      ) {
        visibleCenters.push(center);
      }
    });

    // 方法2: 如果视图区域足够大但结果仍然很少，扩大检查范围
    if (visibleCenters.length < 3 && (viewWidth > 10 || viewHeight > 10)) {
      console.log("扩大检查范围...");

      // 扩展视图边界
      const extendedWest = viewWest - 2;
      const extendedEast = viewEast + 2;
      const extendedSouth = viewSouth - 2;
      const extendedNorth = viewNorth + 2;

      areaCenters.forEach((center) => {
        // 避免重复添加
        const alreadyAdded = visibleCenters.some(
          (vc) => vc.code === center.code
        );
        if (alreadyAdded) return;

        const { longitude, latitude } = center;
        if (
          longitude >= extendedWest &&
          longitude <= extendedEast &&
          latitude >= extendedSouth &&
          latitude <= extendedNorth
        ) {
          visibleCenters.push(center);
        }
      });
    }
  }

  console.log(`找到 ${visibleCenters.length} 个区域与视图相交`);
  return visibleCenters;
};
