import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./App.css";

mapboxgl.accessToken = "pk.eyJ1Ijoic2t5ZmFybSIsImEiOiJjbWZxMXBuMnYwMXJpMmpxNGc4aHI2eWdtIn0.O6HX2KqayaIWNZfmdsmXTQ";

function SkyFarmWebView() {
  const [polygon, setPolygon] = useState<number[][][] | null>(null);

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

  function removeDuplicateCoordinates(coords: number[][][]): number[][][] {
    if (!coords || coords.length === 0) return coords;

    const unique = coords[0].filter(
      (coord, index, arr) =>
        index === 0 ||
        coord[0] !== arr[index - 1][0] ||
        coord[1] !== arr[index - 1][1]
    );

    if (
      unique.length > 1 &&
      unique[0][0] === unique[unique.length - 1][0] &&
      unique[0][1] === unique[unique.length - 1][1]
    ) {
      unique.pop();
    }

    return [unique];
  }

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

    const rawCoords = (newData.features[0].geometry as { coordinates: number[][][] }).coordinates;
    const filteredCoords = removeDuplicateCoordinates(rawCoords);
    setPolygon(filteredCoords);
  };


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
      {polygon && polygon[0].length >= 3 ? (
        <div className="controls">
          <button className="buttons" style={{ backgroundColor: "red" }}>
            Cancelar
          </button>
          <button className="buttons" style={{ backgroundColor: "green" }}>
            Continuar
          </button>
        </div>
      ) : null}
    </main>
  );
}

export default SkyFarmWebView;
