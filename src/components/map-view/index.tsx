import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Map, {
  Source,
  Layer,
  ViewStateChangeEvent,
  MapRef,
  Marker,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Feature } from "geojson";
import { useRequest } from "ahooks";
import { calculateVisibleAreas as calcVisibleAreas } from "./calculateVisibleAreas";

export interface GeoMapProps {
  /** 初始缩放级别 */
  initialZoom?: number;
  /** 初始中心点经度 */
  initialLongitude?: number;
  /** 初始中心点纬度 */
  initialLatitude?: number;
  /** 自定义样式 */
  className?: string;
  /** 区域ID长度与缩放级别的映射关系 */
  zoomLevels?: {
    [key: number]: number; // key: 区域id长度, value: 最小缩放级别
  };
  /** 地图样式 URL */
  mapStyle?: string;
  /** 地图容器样式 */
  style?: React.CSSProperties;
  /** 视图范围内省份变化时的回调函数 */
  onVisibleAreasChanged?: (
    visibleAreas: Array<{
      name: string;
      longitude: number;
      latitude: number;
      code: string;
    }>
  ) => void;
  /** 显示区级数据的最小缩放级别 */
  districtMinZoom?: number;
  /** 显示市级数据的最小缩放级别 */
  cityMinZoom?: number;
  /** 自定义请求地理数据的方法 */
  fetchGeoData?: (areaId: string) => Promise<FeatureCollection>;
  /** 其他子组件 */
  children?: React.ReactNode;
}

/**
 * 国家数据代码
 */
const NATIONAL_ID = "100000";

/**
 * 默认区域ID长度与缩放级别的映射关系
 */
const DEFAULT_ZOOM_LEVELS = {
  6: 0, // 国家级别 (6位ID长度)
  8: 5, // 省级 (8位ID长度)
  10: 7, // 市级 (10位ID长度)
  12: 9, // 区/县级 (12位ID长度)
};

/**
 * 默认的地理数据获取函数
 */
const defaultFetchGeoData = (areaId: string): Promise<FeatureCollection> => {
  return fetch(
    `https://geo.datav.aliyun.com/areas_v3/bound/${areaId}_full.json`
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
};

/**
 * GeoMap 组件 - 基于react-map-gl和maplibre-gl的地理数据可视化组件
 *
 * 根据缩放级别自动加载和卸载不同级别的地理数据
 */
const GeoMap: React.FC<GeoMapProps> = ({
  initialZoom = 3,
  initialLongitude = 108,
  initialLatitude = 35,
  className = "",
  zoomLevels = DEFAULT_ZOOM_LEVELS,
  mapStyle,
  style,
  onVisibleAreasChanged,
  cityMinZoom = 5,
  districtMinZoom = 7,
  fetchGeoData,
  children,
}) => {
  // 地图引用
  const mapRef = useRef<MapRef>(null);
  // 当前区域ID
  const [currentAreaId, setCurrentAreaId] = useState<string>(NATIONAL_ID);
  // 地理数据
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  // 当前缩放级别
  const [currentZoom, setCurrentZoom] = useState<number>(initialZoom);
  // 区域中心点数组 (从地理数据中获取的几何中心点centroid)
  const [areaCenters, setAreaCenters] = useState<
    Array<{ name: string; longitude: number; latitude: number; code: string }>
  >([]);

  // 用于保存上一次计算的视图边界和区域数量，避免重复计算
  const lastViewRef = useRef<{
    bounds?: { north: number; south: number; east: number; west: number };
    visibleAreasCount?: number;
    zoom?: number;
  }>({});

  // 市级数据缓存，以省份代码为键 - 所有缓存的数据都会显示
  const [citiesDataCache, setCitiesDataCache] = useState<
    Record<string, FeatureCollection>
  >({});
  // 市级数据中心点缓存，以省份代码为键
  const [citiesCentersCache, setCitiesCentersCache] = useState<
    Record<
      string,
      Array<{ name: string; longitude: number; latitude: number; code: string }>
    >
  >({});
  // 是否显示市级数据 - 根据缩放级别控制
  const [showCitiesData, setShowCitiesData] = useState<boolean>(false);
  // 正在加载的省份ID列表
  const [loadingProvinceIds, setLoadingProvinceIds] = useState<string[]>([]);

  // 区级数据缓存，以市级代码为键
  const [districtsDataCache, setDistrictsDataCache] = useState<
    Record<string, FeatureCollection>
  >({}); // 区级数据中心点缓存，以市级代码为键
  const [districtsCentersCache, setDistrictsCentersCache] = useState<
    Record<
      string,
      Array<{ name: string; longitude: number; latitude: number; code: string }>
    >
  >({});
  // 是否显示区级数据 - 根据缩放级别控制
  const [showDistrictsData, setShowDistrictsData] = useState<boolean>(false);
  // 正在加载的市级ID列表
  const [loadingCityIds, setLoadingCityIds] = useState<string[]>([]);
  // 默认的地理数据获取函数已移至组件外部作为常量
  // 确定使用哪个函数来获取地理数据
  const actualFetchGeoData = useMemo(
    () => fetchGeoData || defaultFetchGeoData,
    [fetchGeoData]
  );

  /**
   * 使用useRequest处理地理数据加载
   */
  const { run: loadGeoData } = useRequest(
    (areaId: string) => actualFetchGeoData(areaId),
    {
      manual: true,
      onSuccess: (data) => {
        setGeoData(data);
        const centers = extractAreaCenters(data);
        setAreaCenters(centers);
      },
      onError: (error) => {
        console.error("Failed to load geo data:", error);
      },
    }
  );

  const extractAreaCenters = useCallback((data: FeatureCollection) => {
    const centers: Array<{
      name: string;
      longitude: number;
      latitude: number;
      code: string;
    }> = []; // 计数器用于调试
    let successCount = 0;
    let failCount = 0;

    data.features.forEach((feature: Feature) => {
      if (feature.properties) {
        try {
          // 优先使用centroid属性作为几何中心点，如果不存在则尝试使用center作为回退
          let centroid =
            (feature.properties.centroid as [number, number]) || null;

          // 如果无法获取centroid，则尝试使用center
          if (!centroid && feature.properties.center) {
            centroid = feature.properties.center as [number, number];
          }

          if (
            centroid &&
            feature.properties.adcode &&
            feature.properties.name
          ) {
            centers.push({
              name: feature.properties.name,
              longitude: centroid[0],
              latitude: centroid[1],
              code: feature.properties.adcode,
            });
            successCount++;
          } else {
            failCount++;
            console.warn(
              `Missing centroid/center data for ${
                feature.properties.name || "unknown area"
              }:`,
              feature.properties.adcode || "unknown code"
            );
          }
        } catch (error) {
          failCount++;
          console.error(
            `Error processing centroid data for feature:`,
            feature.properties?.name || "unknown",
            error
          );
        }
      }
    });

    console.info(
      `Centroid points collection: ${successCount} successful, ${failCount} failed`
    );

    return centers;
  }, []);
  /**
   * 加载可视区域内省份的市级数据
   */
  const loadVisibleProvinceCities = useCallback(
    (provinces: Array<{ name: string; code: string }>) => {
      if (provinces.length === 0) {
        return;
      }

      // 使用 Set 进行去重，避免处理重复的省份
      const uniqueProvinces = Array.from(
        new Set(provinces.map((p) => p.code))
      ).map((code) => {
        const province = provinces.find((p) => p.code === code);
        return { name: province!.name, code };
      });

      // 设置显示市级数据标志 (只要缩放级别足够，就显示市级数据)
      setShowCitiesData((prev) => {
        // 只有当状态需要改变时才更新
        if (!prev) return true;
        return prev;
      });

      // 筛选出需要加载的省份ID (过滤掉已经在加载中的和已缓存的)
      const provincesToLoad = uniqueProvinces.filter(
        (province) =>
          !loadingProvinceIds.includes(province.code) &&
          !citiesDataCache[province.code]
      );

      if (provincesToLoad.length === 0) {
        // 所有市级数据都已缓存，不需要额外操作
        return;
      }

      console.debug(`开始加载${provincesToLoad.length}个省的市级数据`);

      // 记录正在加载的省份ID
      setLoadingProvinceIds((prev) => {
        const newIds = provincesToLoad.map((province) => province.code);
        // 确保没有重复ID
        return [...new Set([...prev, ...newIds])];
      });

      // 并行加载所有省份的市级数据
      const promises = provincesToLoad.map((province) =>
        actualFetchGeoData(province.code)
          .then((data: FeatureCollection) => {
            // 更新缓存 - 直接添加到缓存中，会自动反映在图层上
            setCitiesDataCache((prev) => ({
              ...prev,
              [province.code]: data,
            }));

            // 提取市级数据中心点
            const cityCenters = extractAreaCenters(data);
            setCitiesCentersCache((prev) => ({
              ...prev,
              [province.code]: cityCenters,
            }));

            return { code: province.code, data };
          })
          .catch((error: Error) => {
            console.error(
              `Failed to load cities data for province ${province.name}:`,
              error
            );
            return null;
          })
      );

      // 处理所有加载完成的数据
      Promise.all(promises).then((results) => {
        // 移除已完成加载的省份ID
        const loadedProvinceIds = results
          .filter(Boolean)
          .map((result) => result?.code || "");

        setLoadingProvinceIds((prev) =>
          prev.filter((id) => !loadedProvinceIds.includes(id))
        );
      });
    },
    [
      loadingProvinceIds,
      citiesDataCache,
      extractAreaCenters,
      actualFetchGeoData,
    ]
  );
  /**
   * 加载可视区域内市级的区级数据
   */
  const loadVisibleCityDistricts = useCallback(
    (cities: Array<{ name: string; code: string }>) => {
      if (cities.length === 0) {
        return;
      }

      // 使用 Set 进行去重，避免处理重复的城市
      const uniqueCities = Array.from(new Set(cities.map((c) => c.code))).map(
        (code) => {
          const city = cities.find((c) => c.code === code);
          return { name: city!.name, code };
        }
      );

      // 设置显示区级数据标志
      setShowDistrictsData((prev) => {
        // 只有当状态需要改变时才更新
        if (!prev) return true;
        return prev;
      });

      // 筛选出需要加载的市级ID (过滤掉已经在加载中的和已缓存的)
      const citiesToLoad = uniqueCities.filter(
        (city) =>
          !loadingCityIds.includes(city.code) && !districtsDataCache[city.code]
      );

      if (citiesToLoad.length === 0) {
        // 所有区级数据都已缓存，不需要额外操作
        return;
      }

      console.debug(`开始加载${citiesToLoad.length}个城市的区级数据`);

      // 记录正在加载的市级ID
      setLoadingCityIds((prev) => {
        const newIds = citiesToLoad.map((city) => city.code);
        // 确保没有重复ID
        return [...new Set([...prev, ...newIds])];
      });

      // 并行加载所有市级的区级数据
      const promises = citiesToLoad.map((city) =>
        actualFetchGeoData(city.code)
          .then((data: FeatureCollection) => {
            // 更新缓存
            setDistrictsDataCache((prev) => ({
              ...prev,
              [city.code]: data,
            }));

            // 提取区级数据中心点
            const districtCenters = extractAreaCenters(data);
            setDistrictsCentersCache((prev) => ({
              ...prev,
              [city.code]: districtCenters,
            }));

            return { code: city.code, data };
          })
          .catch((error: Error) => {
            console.error(
              `Failed to load districts data for city ${city.name}:`,
              error
            );
            return null;
          })
      );

      // 处理所有加载完成的数据
      Promise.all(promises).then((results) => {
        // 移除已完成加载的市级ID
        const loadedCityIds = results
          .filter(Boolean)
          .map((result) => result?.code || "");

        setLoadingCityIds((prev) =>
          prev.filter((id) => !loadedCityIds.includes(id))
        );
      });
    },
    [loadingCityIds, districtsDataCache, extractAreaCenters, actualFetchGeoData]
  ); // 获取所有城市中心点
  const allCityCenters = useMemo(() => {
    if (!showCitiesData) return [];
    return Object.values(citiesCentersCache).flat();
  }, [citiesCentersCache, showCitiesData]);

  // 获取所有区级中心点
  const allDistrictCenters = useMemo(() => {
    if (!showDistrictsData) return [];
    return Object.values(districtsCentersCache).flat();
  }, [districtsCentersCache, showDistrictsData]);

  /**
   * 计算当前视图范围内的省份
   * 即使省份只有一小部分在可视范围内也会被计入
   */
  const calculateVisibleAreas = useCallback(() => {
    if (!mapRef.current || !geoData) {
      return;
    }

    // 获取当前视图边界
    const bounds = mapRef.current.getBounds();
    const currentBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    }; // 仅在视图完全没有变化时跳过计算，设置极小的阈值
    if (
      lastViewRef.current.bounds &&
      Math.abs(lastViewRef.current.bounds.north - currentBounds.north) <
        0.0001 &&
      Math.abs(lastViewRef.current.bounds.south - currentBounds.south) <
        0.0001 &&
      Math.abs(lastViewRef.current.bounds.east - currentBounds.east) < 0.0001 &&
      Math.abs(lastViewRef.current.bounds.west - currentBounds.west) < 0.0001
    ) {
      // 视图边界完全没变化，直接返回避免重复计算
      return;
    }

    // 使用抽离出来的函数计算可视区域内的省份
    const visibleCenters = calcVisibleAreas(
      mapRef.current,
      geoData,
      areaCenters
    ); // 仅当计算结果完全相同，且缩放级别也完全相同时，才跳过后续处理
    // 为确保实时响应，移除此处的优化逻辑

    // 更新上次计算的视图边界和区域数量
    lastViewRef.current = {
      bounds: currentBounds,
      visibleAreasCount: visibleCenters.length,
      zoom: currentZoom,
    };

    // 开发环境日志，生产环境可移除
    console.debug("计算结果:", visibleCenters.length, "个区域在视图内");

    // 如果提供了回调函数，则调用
    if (onVisibleAreasChanged) {
      onVisibleAreasChanged(visibleCenters);
    }

    // 根据缩放级别决定显示哪一级数据
    if (currentZoom > districtMinZoom) {
      // 缩放级别大于区级显示阈值时，显示区级数据
      setShowCitiesData(true);
      setShowDistrictsData(true);

      // 加载省级数据
      loadVisibleProvinceCities(visibleCenters);

      // 获取当前视图内的市级数据
      const visibleCities = Object.values(citiesCentersCache)
        .flat()
        .filter((city) =>
          mapRef.current?.getBounds().contains([city.longitude, city.latitude])
        );

      // 加载这些市级的区级数据
      if (visibleCities.length > 0) {
        console.debug(`加载${visibleCities.length}个城市的区级数据`);
        loadVisibleCityDistricts(visibleCities);
      }
    } else if (currentZoom > cityMinZoom) {
      // 缩放级别在市级显示与区级显示阈值之间，显示市级数据，隐藏区级数据
      setShowCitiesData(true);
      setShowDistrictsData(false);
      loadVisibleProvinceCities(visibleCenters);
    } else {
      // 缩放级别小于市级显示阈值时，仅显示省级数据
      setShowCitiesData(false);
      setShowDistrictsData(false);
    }
  }, [
    mapRef,
    geoData,
    areaCenters,
    onVisibleAreasChanged,
    currentZoom,
    loadVisibleProvinceCities,
    loadVisibleCityDistricts,
    citiesCentersCache,
    cityMinZoom,
    districtMinZoom,
  ]);

  // 初始化加载
  useEffect(() => {
    loadGeoData(currentAreaId);
  }, [currentAreaId, loadGeoData]);

  // 监听地图实例和区域中心点变化，计算可见省份
  useEffect(() => {
    // 确保地图已加载且有区域中心点数据
    if (mapRef.current && areaCenters.length > 0) {
      // 使用requestAnimationFrame确保在下一帧渲染前计算，避免阻塞UI
      const animationId = requestAnimationFrame(() => {
        calculateVisibleAreas();
      });

      // 清理函数，取消动画帧请求
      return () => cancelAnimationFrame(animationId);
    }
    return undefined;
  }, [mapRef, areaCenters.length, calculateVisibleAreas]); // 监听缩放级别变化，控制市级和区级数据的显示/隐藏
  useEffect(() => {
    // 创建防抖定时器ID引用，使用极短的延迟时间确保响应速度
    const debounceTimer = setTimeout(() => {
      // 当缩放级别变化时，重新计算可见区域
      calculateVisibleAreas();
    }, 50); // 使用极短的防抖时间，确保更快响应

    // 清理函数，取消之前的定时器
    return () => clearTimeout(debounceTimer);
  }, [currentZoom, calculateVisibleAreas]);

  // 视图状态变化处理
  const handleViewStateChange = useCallback(
    (event: ViewStateChangeEvent) => {
      const newZoom = event.viewState.zoom;
      const lastZoom = lastViewRef.current.zoom || currentZoom;

      // 检查是否有缩放变化
      const hasZoomChange = Math.abs(newZoom - lastZoom) >= 0.005;

      // 获取当前视图边界
      if (mapRef.current) {
        const bounds = mapRef.current.getBounds();
        const currentBounds = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };

        // 检查是否有位置变化
        const hasPositionChange =
          !lastViewRef.current.bounds ||
          Math.abs(lastViewRef.current.bounds.north - currentBounds.north) >=
            0.001 ||
          Math.abs(lastViewRef.current.bounds.south - currentBounds.south) >=
            0.001 ||
          Math.abs(lastViewRef.current.bounds.east - currentBounds.east) >=
            0.001 ||
          Math.abs(lastViewRef.current.bounds.west - currentBounds.west) >=
            0.001;

        // 如果有缩放变化，更新缩放级别相关状态
        if (hasZoomChange) {
          // 更新当前缩放级别
          setCurrentZoom(newZoom);

          // 更新最后一次视图的缩放级别
          lastViewRef.current.zoom = newZoom;

          // 根据缩放级别确定需要加载的区域级别
          let targetAreaIdLength = 6; // 默认国家级别

          for (const [idLength, minZoom] of Object.entries(zoomLevels)) {
            if (newZoom >= minZoom) {
              targetAreaIdLength = parseInt(idLength, 10);
            }
          }

          // 当前区域ID长度不符合缩放级别时更新
          if (currentAreaId.length !== targetAreaIdLength) {
            setCurrentAreaId(NATIONAL_ID);
          }
        }

        // 如果有位置变化或缩放变化，触发可见区域重新计算
        if (hasPositionChange || hasZoomChange) {
          // 直接调用calculateVisibleAreas而非通过防抖，确保移动时实时响应
          calculateVisibleAreas();
        }
      }
    },
    [currentAreaId, zoomLevels, currentZoom, calculateVisibleAreas]
  );
  // 地图加载完成时的处理函数
  const handleMapLoad = useCallback(() => {
    // 地图加载完成后，如果已有区域中心点数据，立即计算可见省份
    if (areaCenters.length > 0 && mapRef.current) {
      // 立即计算可见区域，确保初始视图正确显示
      calculateVisibleAreas();
    }
  }, [areaCenters, calculateVisibleAreas]);

  // 图层样式
  const fillLayerStyle = useMemo(
    () => ({
      "fill-color": "#e2e8f0",
      "fill-opacity": 0.6,
      "fill-outline-color": "#94a3b8",
    }),
    []
  );

  // 添加省级边界图层样式 - 当显示市级或区县级数据时使用
  const provinceBorderStyle = useMemo(
    () => ({
      "line-color": "#64748b",
      "line-width": 1.5,
      "line-opacity": 0.9,
    }),
    []
  );

  // 添加市级边界图层样式 - 当显示区县级数据时使用
  const cityBorderStyle = useMemo(
    () => ({
      "line-color": "#64748b",
      "line-width": 1.2,
      "line-opacity": 0.8,
    }),
    []
  );

  const geoLayer = useMemo(() => {
    return (
      geoData && (
        <Source id="geojson-data" type="geojson" data={geoData}>
          <Layer id="geojson-layer" type="fill" paint={fillLayerStyle} />
          {/* 当显示市级或区级数据时，添加省级边界线以便区分 */}
          {(showCitiesData || showDistrictsData) && (
            <Layer
              id="province-border-layer"
              type="line"
              paint={provinceBorderStyle}
            />
          )}
        </Source>
      )
    );
  }, [
    geoData,
    fillLayerStyle,
    provinceBorderStyle,
    showCitiesData,
    showDistrictsData,
  ]);
  // 城市图层
  const citiesLayer = useMemo(() => {
    if (!showCitiesData) {
      return null;
    }
    // 从缓存中获取所有市级数据并渲染
    return Object.entries(citiesDataCache).map(([provinceCode, cityData]) => (
      <Source
        key={`city-source-${provinceCode}`}
        id={`city-source-${provinceCode}`}
        type="geojson"
        data={cityData}
      >
        <Layer
          id={`city-layer-${provinceCode}`}
          type="fill"
          paint={{
            "fill-color": "#cbd5e1",
            "fill-opacity": 0.4,
            "fill-outline-color": "#94a3b8",
          }}
        />
        {/* 当显示区级数据时，添加市级边界线以便区分 */}
        {showDistrictsData && (
          <Layer
            id={`city-border-layer-${provinceCode}`}
            type="line"
            paint={cityBorderStyle}
          />
        )}
      </Source>
    ));
  }, [showCitiesData, showDistrictsData, citiesDataCache, cityBorderStyle]);
  // 区级图层
  const districtsLayer = useMemo(() => {
    if (!showDistrictsData) {
      return null;
    }
    // 从缓存中获取所有区级数据并渲染
    return Object.entries(districtsDataCache).map(
      ([cityCode, districtData]) => (
        <Source
          key={`district-source-${cityCode}`}
          id={`district-source-${cityCode}`}
          type="geojson"
          data={districtData}
        >
          <Layer
            id={`district-layer-${cityCode}`}
            type="fill"
            paint={{
              "fill-color": "#e2e8f0",
              "fill-opacity": 0.3,
              "fill-outline-color": "#64748b",
            }}
          />
          {/* 添加区县边界线 */}
          <Layer
            id={`district-border-layer-${cityCode}`}
            type="line"
            paint={{
              "line-color": "#94a3b8",
              "line-width": 0.8,
              "line-opacity": 0.6,
            }}
          />
        </Source>
      )
    );
  }, [showDistrictsData, districtsDataCache]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", position: "relative", ...style }}
    >
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: initialLongitude,
          latitude: initialLatitude,
          zoom: initialZoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        onMove={handleViewStateChange}
        onLoad={handleMapLoad}
        attributionControl={false}
      >
        {/* 地理数据图层 */}
        {geoLayer}
        {/* 市级数据图层 */}
        {citiesLayer}
        {/* 区级数据图层 */}
        {districtsLayer}{" "}
        {/* 省份中心点标记 - 在不显示市级数据时或该省没有下属市级数据时展示省份名称 */}
        {areaCenters.map((center) => {
          const hasChildren =
            showCitiesData &&
            Object.keys(citiesDataCache).some((code) => code === center.code);

          // 不显示市级数据，或者没有子区域数据时显示省份名称
          if (!showCitiesData || !hasChildren) {
            return (
              <Marker
                key={`province-${center.code}`}
                longitude={center.longitude}
                latitude={center.latitude}
                anchor="center"
                pitchAlignment="map"
                rotationAlignment="map"
              >
                <div title={center.name}>{center.name}</div>
              </Marker>
            );
          }
          return null;
        })}
        {/* 城市中心点标记 - 在显示市级数据时，对于没有下级区县数据或不显示区级数据时显示城市名称 */}
        {showCitiesData &&
          allCityCenters.map((city) => {
            const hasChildren =
              showDistrictsData &&
              Object.keys(districtsDataCache).some(
                (code) => code === city.code
              );

            // 不显示区级数据，或者没有子区域数据时显示城市名称
            if (!showDistrictsData || !hasChildren) {
              return (
                <Marker
                  key={`city-${city.code}`}
                  longitude={city.longitude}
                  latitude={city.latitude}
                  anchor="center"
                  pitchAlignment="map"
                  rotationAlignment="map"
                >
                  <div title={city.name}>{city.name}</div>
                </Marker>
              );
            }
            return null;
          })}
        {/* 区县中心点标记 - 在显示区级数据时显示区县名称 */}
        {showDistrictsData &&
          allDistrictCenters.map((district) => (
            <Marker
              key={`district-${district.code}`}
              longitude={district.longitude}
              latitude={district.latitude}
              anchor="center"
              pitchAlignment="map"
              rotationAlignment="map"
            >
              <div title={district.name}>{district.name}</div>
            </Marker>
          ))}
        {/* 其他子组件 */}
        {children}
      </Map>
    </div>
  );
};

export default GeoMap;
