import * as layers from "./layers.js"
console.log(layers)

let map = L.map('map', {
  center: [58.373523, 26.716045],
  zoom: 12,
  zoomControl: true // Disable default zoom control
})

map.createPane('customDistrictsPane')
map.getPane('customDistrictsPane').style.zIndex = 390

let districtsLayer
let choroplethLayer
let heatMapLayer
let markersLayer

let activeWmsLayers = {}

map.zoomControl.setPosition('topright')

function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
}

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors'
})
const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Esri, Maxar, Earthstar Geographics, and the GIS community',
  maxZoom: 19
})

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
})

const baseLayers = {
  "OpenStreetMap": osmLayer,
  "Satellite": satelliteLayer,
  "Topographic": topoLayer
}

  osmLayer.addTo(map)

// Districts GeoJSON with styling
async function loadDistrictsLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson')
    const data = await response.json()
    
    districtsLayer = L.geoJson(data, {
      style: function(feature) {
        return {
          fillColor: getDistrictColor(feature.properties.OBJECTID),
          fillOpacity: 0.5,
          weight: 1,
          opacity: 1,
          color: 'grey'
        }
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.NIMI || 'District ' + feature.properties.OBJECTID)
      },
      pane: 'customDistrictsPane'
    })
  } catch (error) {
    console.error("Error loading districts data:", error)
  }
}

// function to color the layer 
function getDistrictColor(id) {
  switch (id) {
    case 1: return '#ff0000'
    case 13: return '#009933'
    case 6: return '#0000ff'
    case 7: return '#ff0066'
    default: return '#ffffff'
  }
}

// Choropleth layer
async function loadChoroplethLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson')
    const data = await response.json()
    
    choroplethLayer = L.choropleth(data, {
      valueProperty: 'OBJECTID',
      scale: ['#e6ffe6', '#004d00'],
      steps: 11,
      mode: 'q',
      style: {
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup('Value: ' + feature.properties.OBJECTID)
      },
      pane: 'customDistrictsPane'
    })
  } catch (error) {
    console.error("Error loading choropleth data:", error)
  }
}

// Heat Map Layer
async function loadHeatMapLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()
    
    const heatData = data.features.map(function(feature) {
      return [
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        feature.properties.area || 1
      ]
    })
    
    heatMapLayer = L.heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 17,
    })

  } catch (error) {
    console.error("Error loading heatmap data:", error)
  }
}

// Cell Towers - Markers with Clusters
async function loadMarkersLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()
    
    const geoJsonLayer = L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: 'red',
          fillOpacity: 0.5,
          color: 'red',
          weight: 1,
          opacity: 1
        })
      },
      onEachFeature: function(feature, layer) {
        if (feature.properties) {
          layer.bindPopup('Cell Tower<br>Area: ' + (feature.properties.area || 'Unknown'))
        }
      }
    })
    
    markersLayer = L.markerClusterGroup()
    markersLayer.addLayer(geoJsonLayer)
  } catch (error) {
    console.error("Error loading markers data:", error)
  }
}

function loadWmsLayers(layersList = [], overlayLayers = {}) {
  layersList.forEach(layer => {
    const paneName = `${layer.layers}-pane`;
    map.createPane(paneName);
    map.getPane(paneName).style.zIndex = layer.zIndex;
    const newLayer = L.tileLayer.wms(layer.url, {
      version: layer.version,
      layers: layer.layers,
      format: layer.format,
      transparent: layer.transparent,
      pane: paneName
    });
    overlayLayers[layer.title.en] = newLayer;
    activeWmsLayers[layer.layers] = false;
  });
}

function toggleActiveState(layerId, boolean) {
  // check if layer name's value is of type boolean, then we know this layer is present in the list
  if (typeof(activeWmsLayers[layerId]) == "boolean") {
    activeWmsLayers[layerId] = boolean // update the value to new one
  }
}

function buildRequestUrl(e, baseUrl, layerName) {
  // build a bounding box for the current map view
  const bounds = map.getBounds()
  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth()
  ].join(',')
  // get size values from map object
  const size = map.getSize()
  const sizeX = size.x
  const sizeY = size.y
  // get x and y points and round them to avoid strange errors
  const xPoint = Math.floor(e.containerPoint.x)
  const yPoint = Math.floor(e.containerPoint.y)
  // WMS endpoint and request parameters
  const wmsUrl = baseUrl
  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetFeatureInfo',
    query_layers: layerName,
    layers: layerName,
    info_format: 'application/json',
    x: xPoint,
    y: yPoint,
    srs: 'EPSG:4326',
    width: sizeX,
    height: sizeY,
    bbox: `${bbox}`
  })
  return wmsUrl + params
}

function fetchWmsData(fullUrl, layerName) {
  fetch(fullUrl)
    .then(response => response.json())
    .then(data => {
      const content = document.getElementById('info-content');
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const props = feature.properties;
        let html = `<h4>${getLayerName(layers.wmsLayers, layerName)}</h4><ul>`;
        for (const key in props) {
          html += `<li><strong>${key}:</strong> ${props[key]}</li>`;
        }
        html += `</ul>`;
        content.innerHTML += html;
      } else {
        content.innerHTML += `<em>No features found for ${getLayerName(layers.wmsLayers, layerName)}</em><br>`;
      }
    })
    .catch(error => {
      console.error('Request failed:', error);
    });
}

function getLayerName(layersData, layerName) {
  const result = layersData.filter(layer => layer.layers === layerName);
  return result[0].title.en;
}


async function initializeLayers() {
    await Promise.all([
    loadDistrictsLayer(),
    loadChoroplethLayer(),
    loadHeatMapLayer(),
    loadMarkersLayer()
  ])

  const overlayLayers = {
    "Markers": markersLayer,
    "Heatmap": heatMapLayer,
    "Choropleth layer": choroplethLayer,
    "Tartu districts": districtsLayer
  }
  
  loadWmsLayers(layers.wmsLayers, overlayLayers)

  const layerControlOptions = {
    collapsed: false,
    position: 'topleft'
  }
  
  const layerControl = L.control.layers(baseLayers, overlayLayers, layerControlOptions)
  
  layerControl.addTo(map)

  map.on("overlayadd", event => {
  const layerId = event.layer.options.layers;
  toggleActiveState(layerId, true);
  console.log(activeWmsLayers);
});

  map.on("overlayremove", event => {
    const layerId = event.layer.options.layers;
    toggleActiveState(layerId, false);
    console.log(activeWmsLayers);
  });

map.on("click", function (event) {
  const infoBox = document.getElementById("info-box");
  const infoWindowContent = document.getElementById('info-content')
  infoWindowContent.innerHTML = ""
  Object.entries(activeWmsLayers).forEach(([key, value]) => {
    if (value === true) {
      infoBox.style.display = "block";
      const url = buildRequestUrl(
        event,
        "https://landscape-geoinformatics.ut.ee/geoserver/pa2023/wms?",
        key
      );
      console.log("WMS URL:", url);
      fetchWmsData(url, key);
    }
  });
});

  osmLayer.addTo(map)
  //districtsLayer.addTo(map)
}

// then call the function to execute it
initializeLayers()

document.getElementById("info-close").addEventListener("click", () => {
  const infoBox = document.getElementById("info-box");
  infoBox.style.display = "none";
});

import { turfFunctions } from "./turfPractice.js"

turfFunctions(map)

export { defaultMapSettings }

map.on('click', function(event) {
  console.log(`[${event.latlng.lng}, ${event.latlng.lat}]`)
  // define coordinates of the point
  let pointCoords = [event.latlng.lng, event.latlng.lat]
  // create a turf point
  let turfPoint = turf.point(pointCoords)
  //convert the point to GeoJSON format and add it to the map
  L.geoJSON(turfPoint).addTo(map)})