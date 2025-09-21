import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./App.css";

mapboxgl.accessToken = "pk.eyJ1Ijoic2t5ZmFybSIsImEiOiJjbWZyMXN6dmgwMmF4MnFvZ3hzajJ1enpsIn0.6fUROzff1aR4Rq3QHmXfYA";

function SkyFarmWebView() {
  const [polygon, setPolygon] = useState<number[][] | null>(null);

  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const drawRef = useRef(
    new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
    })
  );

  const handleMapEvents = () => {
    const data = drawRef.current.getAll();

    if (data.features.length > 1) {
      const lastFeature = data.features[data.features.length - 1];
      drawRef.current.deleteAll();
      drawRef.current.add(lastFeature);
    }

    const newData = drawRef.current.getAll();

    if (newData.features.length === 0) {
      setPolygon(null);
      return;
    }

    let rawCoords = (newData.features[0].geometry as { coordinates: number[][][] }).coordinates[0];

    if (
      rawCoords.length > 1 &&
      rawCoords[0][0] === rawCoords[rawCoords.length - 1][0] &&
      rawCoords[0][1] === rawCoords[rawCoords.length - 1][1]
    ) {
      rawCoords = rawCoords.slice(0, -1);
    }

    setPolygon(rawCoords);
  };

  useEffect(() => {

    //(window as any).ReactNativeWebView.postMessage(JSON.stringify(polygon))
    console.log(JSON.stringify(polygon))
  }, [polygon])

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [-46.5178, -18.5789],
      zoom: 13,
    });

    mapRef.current = map;

    map.addControl(drawRef.current);
    map.on("draw.create", handleMapEvents);
    map.on("draw.update", handleMapEvents);
    map.on("draw.delete", () => setPolygon(null));

    return () => {
      map.remove();
    };
  }, []);

  return (
    <main>
      <div ref={mapContainerRef} className="map-container" />
      {polygon?.length}
    </main>
  );
}

export default SkyFarmWebView;
