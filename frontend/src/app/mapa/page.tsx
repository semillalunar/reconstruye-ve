"use client";

import React, { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import esriConfig from "@arcgis/core/config";


export default function Mapa3D() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapDiv.current) return;

    // Inicializar el mapa topográfico
    const map = new Map({
      basemap: "topo-3d",
      ground: "world-elevation"
    });

    // Crear la vista 3D (SceneView)
    const view = new SceneView({
      container: mapDiv.current,
      map: map,
      camera: {
        position: {
          latitude: 10.5500, // Un poco al sur para ver de frente
          longitude: -67.0300,
          z: 5000 // Altura en metros
        },
        tilt: 60, // Inclinación para efecto 3D
        heading: 0
      }
    });

    // Cargar los datos desde nuestra API local
    fetch('/api/geo')
      .then(res => res.json())
      .then(data => {
        const features = data.features;
        const graphics: Graphic[] = [];

        features.forEach((feature: any) => {
          // Crear la geometría del punto
          const point = new Point({
            longitude: feature.longitud,
            latitude: feature.latitud
          });

          // Crear el símbolo (Pin Rojo)
          const markerSymbol = new SimpleMarkerSymbol({
            color: [226, 30, 30], // Rojo emergencia
            outline: {
              color: [255, 255, 255],
              width: 2
            },
            size: "14px"
          });

          // Crear la información emergente (Popup)
          const popupTemplate = {
            title: "{nombre}",
            content: `
              <div style="font-size: 14px;">
                <b>Estado de Emergencia:</b><br/>
                🟢 Rescatados: {rescatados}<br/>
                🔴 Fallecidos: {fallecidos}
              </div>
            `
          };

          // Unir geometría, símbolo y atributos en un Graphic
          const pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol,
            attributes: {
              nombre: feature.nombre,
              rescatados: feature.stats.rescatados,
              fallecidos: feature.stats.fallecidos
            },
            popupTemplate: popupTemplate
          });

          graphics.push(pointGraphic);
        });

        // Añadir todos los pines al mapa
        view.graphics.addMany(graphics);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar datos:", err);
        setLoading(false);
      });

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <link rel="stylesheet" href="https://js.arcgis.com/4.29/esri/themes/light/main.css" />
      <div style={{ padding: '15px', backgroundColor: '#1a1a1a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Centro de Mando 3D - Catia La Mar</h1>
        {loading && <span style={{ fontSize: '14px', color: '#ffcc00' }}>Inyectando Inteligencia Geoespacial...</span>}
      </div>
      <div className="mapDiv" ref={mapDiv} style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
}
