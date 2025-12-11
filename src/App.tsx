import { useState, useEffect, useMemo, useRef } from 'react';
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';

// Define the shape of our optimized data
interface StoreData {
  id: number;
  n: string; // name
  c: string; // category
  a: string; // address
  l: [number, number]; // [lat, lng]
}

import { useSupercluster } from './hooks/useSupercluster';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { DesktopLeftPanel } from './components/DesktopLeftPanel';
import { StoreDetailView } from './components/StoreDetailView';
import { StoreListView } from './components/StoreListView';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { Category } from './data/categories';
import { getCategoryGroup } from './data/categoryMapping';

function App() {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY,
    libraries: ['services'],
  });

  // Data Loading State
  const [stores, setStores] = useState<StoreData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({
    jungwon: false,
    sujeong: false,
    bundang: false,
  });

  const [level, setLevel] = useState(4);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [bounds, setBounds] = useState<{ sw: { lat: number; lng: number }; ne: { lat: number; lng: number } } | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  // 5-2. Real Data State
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  
  // 5-3. Cluster List State
  const [clusterStores, setClusterStores] = useState<StoreData[] | null>(null);
  const [isFromSearch, setIsFromSearch] = useState(false); // Track if cluster list is from search

  // 6. Search State
  const [searchQuery, setSearchQuery] = useState('');

  // 7. Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');

  // Panel visibility state (for desktop toggle)
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // Minimized state (for mobile)
  const [isMinimized, setIsMinimized] = useState(false);

  // Highlighted store marker (for visual feedback)
  const [highlightedStoreId, setHighlightedStoreId] = useState<number | null>(null);

  // Scroll position preservation for search results
  const searchListScrollRef = useRef<number>(0);

  // Filter stores based on search query and category
  const filteredStores = useMemo(() => {
    let result = stores;

    // Category filter (대분류 기반)
    if (selectedCategory !== '전체') {
      result = result.filter(store => getCategoryGroup(store.c) === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(store =>
        store.n.toLowerCase().includes(query) ||
        store.a.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, selectedCategory, stores]);

  // Progressive Data Loading: 중원구 -> 수정구+분당구
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        // 1단계: 중원구 먼저 로드 (초기 화면)
        const jungwonResponse = await fetch('/data/jungwon.json');
        const jungwonData: StoreData[] = await jungwonResponse.json();

        if (!cancelled) {
          setStores(jungwonData);
          setLoadingProgress(prev => ({ ...prev, jungwon: true }));
        }

        // 2단계: 수정구 + 분당구 병렬 로드
        const [sujeongResponse, bundangResponse] = await Promise.all([
          fetch('/data/sujeong.json'),
          fetch('/data/bundang.json')
        ]);

        const [sujeongData, bundangData]: [StoreData[], StoreData[]] = await Promise.all([
          sujeongResponse.json(),
          bundangResponse.json()
        ]);

        if (!cancelled) {
          setStores([...jungwonData, ...sujeongData, ...bundangData]);
          setLoadingProgress({ jungwon: true, sujeong: true, bundang: true });
          setDataLoading(false);
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-fit map bounds when search results change (with debounce)
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Keep panel open but clear results when search is cleared
      setClusterStores(null);
      setIsFromSearch(false);
      setSelectedStore(null);
      return;
    }
    
    const timer = setTimeout(() => {
      fitBoundsToResults();
      
      // Auto-show search results list (no limit)
      if (filteredStores.length > 0) {
        setClusterStores(filteredStores);
        setIsFromSearch(true);
        setSelectedStore(null);
        setIsMinimized(false);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [filteredStores, searchQuery]);

  // Relayout map when panel visibility changes (PC only)
  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.relayout();
      }, 300); // Wait for transition to complete
    }
  }, [isPanelVisible, map]);

  // Update bounds when map changes
  const updateBounds = () => {
    if (!map) return;
    const b = map.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    setBounds({
        sw: { lat: sw.getLat(), lng: sw.getLng() },
        ne: { lat: ne.getLat(), lng: ne.getLng() }
    });
    setLevel(map.getLevel());
  };

  // Initial bounds set
  useEffect(() => {
    if (map) updateBounds();
  }, [map]);

  // Use Custom Supercluster Hook
  // FIXED MAPPING: 
  // Kakao Level: 1 (Close) -> 14 (Far)
  // SC Zoom: 18 (Close) -> 5 (Far)
  // Formula: SC Zoom = 19 - Kakao Level
  const scZoom = Math.max(0, 19 - level);

  const { clusters, supercluster } = useSupercluster({
    points: filteredStores,
    bounds,
    zoom: scZoom,
    options: { radius: 60, maxZoom: 17 } // Cluster up to very close levels (17), split at 18
  });


  const moveToMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Check if user position already exists and is close to current location
          if (userPosition) {
            const distance = Math.sqrt(
              Math.pow(userPosition.lat - lat, 2) + Math.pow(userPosition.lng - lng, 2)
            );
            
            // If position hasn't changed much (within ~100m), toggle off
            if (distance < 0.001) {
              setUserPosition(null);
              return;
            }
          }
          
          // Set new position and move map
          setUserPosition({ lat, lng });
          
          if (map) {
            map.setCenter(new kakao.maps.LatLng(lat, lng));
            map.setLevel(3);
          }
        },
        (err) => console.error(err)
      );
    }
  };

  // Fit map bounds to show all filtered stores
  const fitBoundsToResults = () => {
    if (!map || filteredStores.length === 0) return;

    // Check if any search results are already visible in current viewport
    const currentBounds = map.getBounds();
    if (currentBounds) {
      const visibleResults = filteredStores.filter(store => {
        const [lat, lng] = store.l;
        const sw = currentBounds.getSouthWest();
        const ne = currentBounds.getNorthEast();
        
        return lat >= sw.getLat() && lat <= ne.getLat() &&
               lng >= sw.getLng() && lng <= ne.getLng();
      });
      
      // If at least one result is visible, don't move the map
      if (visibleResults.length > 0) {
        return;
      }
    }

    if (filteredStores.length === 1) {
      // Single result: center on it
      const [lat, lng] = filteredStores[0].l;
      map.setCenter(new kakao.maps.LatLng(lat, lng));
      map.setLevel(3);
    } else {
      // Multiple results: fit bounds to show all
      const bounds = new kakao.maps.LatLngBounds();
      filteredStores.forEach(store => {
        const [lat, lng] = store.l;
        bounds.extend(new kakao.maps.LatLng(lat, lng));
      });
      map.setBounds(bounds);
    }
  };


  if (loading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-blue-600 font-bold text-lg mb-4">
            {loading ? '지도 로딩 중...' : '가맹점 데이터 로딩 중...'}
          </div>
          {dataLoading && (
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className={loadingProgress.jungwon ? 'text-green-600' : 'text-gray-400'}>
                  {loadingProgress.jungwon ? '✓' : '○'} 중원구
                </span>
                <span className={loadingProgress.sujeong ? 'text-green-600' : 'text-gray-400'}>
                  {loadingProgress.sujeong ? '✓' : '○'} 수정구
                </span>
                <span className={loadingProgress.bundang ? 'text-green-600' : 'text-gray-400'}>
                  {loadingProgress.bundang ? '✓' : '○'} 분당구
                </span>
              </div>
              {loadingProgress.jungwon && !loadingProgress.bundang && (
                <div className="text-xs text-blue-500 mt-2">
                  중원구 가맹점이 표시됩니다. 나머지 구 데이터 로딩 중...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (error) return <div className="flex items-center justify-center h-screen bg-red-50 text-red-500">지도를 불러오는데 실패했습니다.</div>;

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gray-100">
          {/* Map Layer (Background) - Avoid left panel on desktop */}
          <div className={`absolute inset-0 z-0 transition-all duration-300 ${isPanelVisible ? 'md:left-[400px]' : 'md:left-0'}`}>
            <Map
                center={{ lat: 37.4200, lng: 127.1265 }}
                style={{ width: '100%', height: '100%' }}
                level={level}
                onZoomChanged={updateBounds}
                onDragEnd={updateBounds} // Crucial for updating bounds on drag
                onCreate={setMap}
                onClick={() => {
                    // Minimize on mobile
                    if (window.innerWidth < 768) {
                        setIsMinimized(true);
                    }

                    // Close detail view
                    setSelectedStore(null);
                    setHighlightedStoreId(null);

                    // If searching, restore search results list
                    if (searchQuery.trim()) {
                        setClusterStores(filteredStores);
                        setIsFromSearch(true);
                    } else if (!isFromSearch) {
                        // Not searching and not from search - clear everything
                        setClusterStores(null);
                        setIsFromSearch(false);
                    }
                }} // Minimize on mobile, clear selections on map click
            >
                {/* User Position */}
                {/* User Location Marker - Naver/Kakao style */}
                {userPosition && (
                    <CustomOverlayMap
                        position={userPosition}
                        clickable={false}
                    >
                        <div 
                            className="relative"
                            style={{ 
                                width: '48px', 
                                height: '48px',
                                marginLeft: '-24px',
                                marginTop: '-24px'
                            }}
                        >
                            {/* Outer pulse ring */}
                            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                            {/* Middle ring */}
                            <div className="absolute inset-2 bg-blue-500 rounded-full opacity-40"></div>
                            {/* Inner dot with border */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 bg-white rounded-full shadow-lg" style={{ border: '3px solid #3b82f6' }}></div>
                            </div>
                        </div>
                    </CustomOverlayMap>
                )}

                {/* Render Clusters & Markers manually */}
                {(() => {
                    // Manual overlap detection - group markers at same/very close positions
                    const renderedPositions: { [key: string]: any[] } = {};
                    const manualClusters: any[] = [];
                    
                    // First pass: group overlapping markers
                    clusters.forEach((cluster) => {
                        const [lng, lat] = cluster.geometry.coordinates;
                        const { cluster: isCluster, point_count: pointCount } = cluster.properties;
                        
                        if (isCluster) {
                            // Keep original clusters
                            manualClusters.push({ type: 'cluster', cluster, lat, lng, pointCount });
                        } else {
                            // Check if this position already has markers
                            const posKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`; // Group within ~10m
                            
                            if (!renderedPositions[posKey]) {
                                renderedPositions[posKey] = [];
                            }
                            renderedPositions[posKey].push(cluster);
                        }
                    });
                    
                    // Second pass: create manual clusters for overlapping markers
                    Object.values(renderedPositions).forEach((markers: any[]) => {
                        if (markers.length > 1) {
                            // Multiple markers at same position -> create manual cluster
                            const [lng, lat] = markers[0].geometry.coordinates;
                            manualClusters.push({
                                type: 'manual-cluster',
                                lat, lng,
                                markers,
                                count: markers.length
                            });
                        } else {
                            // Single marker - render normally
                            const [lng, lat] = markers[0].geometry.coordinates;
                            manualClusters.push({
                                type: 'marker',
                                cluster: markers[0],
                                lat, lng
                            });
                        }
                    });
                    
                    // Third pass: render all items
                    return manualClusters.map((item, idx) => {
                        if (item.type === 'cluster') {
                            // Original cluster from supercluster
                            const size = item.pointCount < 100 ? 40 : item.pointCount < 500 ? 50 : 60;
                            return (
                                <CustomOverlayMap
                                    key={`cluster-${item.cluster.id}`}
                                    position={{ lat: item.lat, lng: item.lng }}
                                    clickable={true}
                                >
                                    <div 
                                        onClick={() => {
                                            const leaves = supercluster?.getLeaves(item.cluster.id, Infinity);
                                            if (leaves) {
                                                const storeList = leaves.map(leaf => {
                                                    const [lng, lat] = leaf.geometry.coordinates;
                                                    return {
                                                        id: leaf.properties.id,
                                                        n: leaf.properties.n,
                                                        c: leaf.properties.c,
                                                        a: leaf.properties.a,
                                                        l: [lat, lng] as [number, number]
                                                    };
                                                });
                                                setClusterStores(storeList);
                                                setIsFromSearch(false);
                                                setSelectedStore(null);
                                                setHighlightedStoreId(null);
                                                setIsMinimized(false);
                                            }
                                        }}
                                        className="flex items-center justify-center rounded-full bg-blue-500 text-white font-bold cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
                                        style={{ width: `${size}px`, height: `${size}px` }}
                                    >
                                        {item.pointCount}
                                    </div>
                                </CustomOverlayMap>
                            );
                        } else if (item.type === 'manual-cluster') {
                            // Manual cluster created from overlapping markers
                            const size = item.count < 10 ? 40 : 50;
                            return (
                                <CustomOverlayMap
                                    key={`manual-cluster-${idx}`}
                                    position={{ lat: item.lat, lng: item.lng }}
                                    clickable={true}
                                >
                                    <div 
                                        onClick={() => {
                                            const storeList = item.markers.map((marker: any) => {
                                                const [lng, lat] = marker.geometry.coordinates;
                                                return {
                                                    id: marker.properties.id,
                                                    n: marker.properties.n,
                                                    c: marker.properties.c,
                                                    a: marker.properties.a,
                                                    l: [lat, lng] as [number, number]
                                                };
                                            });
                                            setClusterStores(storeList);
                                            setIsFromSearch(false);
                                            setSelectedStore(null);
                                            setHighlightedStoreId(null);
                                            setIsMinimized(false);
                                        }}
                                        className="flex items-center justify-center rounded-full bg-blue-500 text-white font-bold cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
                                        style={{ width: `${size}px`, height: `${size}px` }}
                                    >
                                        {item.count}
                                    </div>
                                </CustomOverlayMap>
                            );
                        } else {
                            // Single marker
                            const cluster = item.cluster;
                            const storeData = stores.find(s => s.id === cluster.properties.id);
                            
                            // Skip if highlighted (will render separately)
                            if (highlightedStoreId === cluster.properties.id) {
                                return null;
                            }
                            
                            return (
                                <MapMarker
                                    key={`leaf-${cluster.properties.id}`}
                                    position={{ lat: item.lat, lng: item.lng }}
                                    image={{
                                        src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                                        size: { width: 24, height: 35 }
                                    }}
                                    title={cluster.properties.n}
                                    clickable={true}
                                    onClick={() => {
                                        if (storeData) {
                                            setSelectedStore(storeData);
                                            setHighlightedStoreId(storeData.id);
                                            setClusterStores(null);
                                            setIsFromSearch(false);
                                            setIsMinimized(false);
                                        }
                                    }}
                                />
                            );
                        }
                    });
                })()}

                {/* Highlighted Marker - Render last to appear on top */}
                {highlightedStoreId && selectedStore && (
                    <MapMarker
                        key={`highlighted-${highlightedStoreId}`}
                        position={{ lat: selectedStore.l[0], lng: selectedStore.l[1] }}
                        image={{
                            src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                            size: { width: 36, height: 52 }
                        }}
                        title={selectedStore.n}
                        clickable={true}
                        onClick={() => {
                            // Allow clicking to deselect or keep selected
                            setSelectedStore(selectedStore);
                            setHighlightedStoreId(selectedStore.id);
                        }}
                    />
                )}
            </Map>
          </div>

          {/* UI Layer (Foreground) - Category Filter */}
          <div className={`absolute inset-x-0 top-0 z-10 p-4 pointer-events-none flex justify-center transition-all duration-300 ${isPanelVisible ? 'md:left-[400px]' : 'md:left-0'}`}>
              <div className="w-full md:w-auto max-w-2xl pointer-events-auto">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
          </div>

          {/* Show Panel Button (when hidden on desktop) */}
          {!isPanelVisible && (
            <button
              onClick={() => setIsPanelVisible(true)}
              className="hidden md:block absolute top-4 left-4 z-20 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-blue-50 transition-colors"
              aria-label="패널 보이기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#004098]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Location Button */}
          <button 
            onClick={moveToMyLocation}
            className="absolute bottom-24 md:bottom-8 right-4 z-20 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-blue-50 transition-colors"
            aria-label="내 위치로 이동"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#004098]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Mobile Bottom Sheet */}
          <div className="md:hidden">
                <MobileBottomSheet
                    isOpen={true}
                    minimized={isMinimized}
                    onMinimize={() => setIsMinimized(!isMinimized)}
                    onBack={
                      selectedStore ? () => {
                        setSelectedStore(null);
                        setHighlightedStoreId(null);
                        if (!clusterStores) {
                          setSearchQuery('');
                        }
                        setIsMinimized(false);
                      } : undefined
                    }
                    searchBar={!selectedStore ? (
                      <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSubmit={fitBoundsToResults}
                        placeholder="가게 이름이나 주소 검색..."
                        resultCount={searchQuery ? filteredStores.length : undefined}
                        totalCount={!searchQuery ? filteredStores.length : undefined}
                        selectedCategory={selectedCategory}
                      />
                    ) : undefined}
                >
                    {/* Content based on state */}
                    <div className="transition-all duration-300 ease-in-out" key={selectedStore ? 'detail' : clusterStores ? 'list' : 'empty'}>
                      {selectedStore ? (
                          <div className="animate-slideInRight pt-4">
                            <StoreDetailView
                                name={selectedStore.n}
                                category={selectedStore.c}
                                address={selectedStore.a}
                            />
                          </div>
                      ) : clusterStores ? (
                          <div className="animate-fadeIn">
                            <StoreListView
                                stores={clusterStores}
                                scrollPositionRef={isFromSearch ? searchListScrollRef : undefined}
                                onSelectStore={(store) => {
                                    const fullStore = stores.find(s => s.id === store.id);
                                    if (fullStore) {
                                        if (map) {
                                            map.panTo(new kakao.maps.LatLng(fullStore.l[0], fullStore.l[1]));
                                        }
                                        setHighlightedStoreId(fullStore.id);
                                        setSelectedStore(fullStore);
                                        setIsMinimized(false);
                                    }
                                }}
                            />
                          </div>
                      ) : (
                          <div className="text-center py-8 text-gray-400 text-sm animate-fadeIn min-h-[100px] flex items-center justify-center">
                            {searchQuery ? (
                              <p>검색 결과가 없습니다</p>
                            ) : (
                              <p>🔍 가게를 검색하거나<br/>지도에서 마커를 클릭해보세요</p>
                            )}
                          </div>
                      )}
                    </div>
                </MobileBottomSheet>
          </div>

          {/* Desktop Left Panel */}
          <div className="hidden md:block">
                <DesktopLeftPanel
                    isVisible={isPanelVisible}
                    onClose={() => setIsPanelVisible(false)}
                    onBack={
                      selectedStore ? () => {
                        setSelectedStore(null);
                        setHighlightedStoreId(null);
                        if (!clusterStores) {
                          setSearchQuery('');
                        }
                      } : undefined
                    }
                    searchBar={!selectedStore ? (
                      <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSubmit={fitBoundsToResults}
                        placeholder="가게 이름이나 주소 검색..."
                        resultCount={searchQuery ? filteredStores.length : undefined}
                        totalCount={!searchQuery ? filteredStores.length : undefined}
                        selectedCategory={selectedCategory}
                      />
                    ) : undefined}
                >
                    {/* Content based on state */}
                    <div className="transition-all duration-300 ease-in-out" key={selectedStore ? 'detail' : clusterStores ? 'list' : 'empty'}>
                      {selectedStore ? (
                          <div className="animate-slideInRight pt-4">
                            <StoreDetailView
                                name={selectedStore.n}
                                category={selectedStore.c}
                                address={selectedStore.a}
                            />
                          </div>
                      ) : clusterStores ? (
                          <div className="animate-fadeIn">
                            <StoreListView
                                stores={clusterStores}
                                scrollPositionRef={isFromSearch ? searchListScrollRef : undefined}
                                onSelectStore={(store) => {
                                    const fullStore = stores.find(s => s.id === store.id);
                                    if (fullStore) {
                                        if (map) {
                                            map.panTo(new kakao.maps.LatLng(fullStore.l[0], fullStore.l[1]));
                                        }
                                        setHighlightedStoreId(fullStore.id);
                                        setSelectedStore(fullStore);
                                    }
                                }}
                            />
                          </div>
                      ) : (
                          <div className="text-center py-8 text-gray-400 text-sm animate-fadeIn min-h-[100px] flex items-center justify-center">
                            {searchQuery ? (
                              <p>검색 결과가 없습니다</p>
                            ) : (
                              <p>🔍 가게를 검색하거나<br/>지도에서 마커를 클릭해보세요</p>
                            )}
                          </div>
                      )}
                    </div>
                </DesktopLeftPanel>
          </div>
    </div>
  );
}

export default App;
