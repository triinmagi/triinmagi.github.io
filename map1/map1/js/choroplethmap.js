let map = L.map('map').setView([58.373523, 26.716045], 12)

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors',
})

osm.addTo(map)

// default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
}

addGeoJson('geojson/tartu_city_districts_edu.geojson')

// add geoJSON layer
async function addGeoJson(url) {
  const response = await fetch(url)
  const data = await response.json()
  L.choropleth(data, {
    valueProperty: 'OBJECTID',
    scale: ['#ffffff', '#101f51'],
    steps: 5,
    mode: 'q', // q for quantile, e for equidistant
    style: {
      color: '#3b3838',
      weight: 2,
      fillOpacity: 0.8,
    },
    
onEachFeature: function (feature, layer) {
  layer.bindPopup(
    'District: ' + feature.properties.NIMI +
    '<br>Cell towers: ' + feature.properties.OBJECTID
  )
},
  }).addTo(map)
}