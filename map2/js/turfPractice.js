export function turfFunctions(map) {
  console.log("Hey!")
  //alert("Hello!")

  const pointCoords = [26.71552, 58.37393]
  const myPoint = turf.point(pointCoords)
  const geoJSON_point = L.geoJSON(myPoint)
  geoJSON_point.addTo(map)

  const lineCoords = [
  [26.71379, 58.37476],
  [26.71554, 58.37349],
  [26.71553, 58.37434],
  [26.71630, 58.37378],
  [26.71473, 58.37407]]
  const myLine = turf.lineString(lineCoords)
  const geoJSON_linestring = L.geoJSON(myLine)
  geoJSON_linestring.addTo(map)

  const polygonCoords = [[
  [26.71355, 58.37468],
  [26.71404, 58.37430],
  [26.71433, 58.37429],
  [26.71550, 58.37345],
  [26.71660, 58.37388],
  [26.71615, 58.37420],
  [26.71589, 58.37431],
  [26.71552, 58.37461],
  [26.71521, 58.37496],
  [26.71480, 58.37481],
  [26.71449, 58.37502],
  [26.71355, 58.37468]]]
  const myPolygon = turf.polygon(polygonCoords)
  const geoJSON_polygon = L.geoJSON(myPolygon)
  geoJSON_polygon.addTo(map)

  const SecondPointCoords = [26.71489, 58.37439]
  const mySecondPoint = turf.point(SecondPointCoords)
  const geoJSON_secondpoint = L.geoJSON(mySecondPoint)
  geoJSON_secondpoint.addTo(map)

  const options = { units: 'meters' }

  const distance = turf.distance(myPoint, mySecondPoint, options)
  console.log(`Distance is ${distance} meters.`)
  const distanceRounded = Math.round(distance)
  const roundedToTwoDecimals = Math.round(distance*100)/100
  console.log(`Rounded to nearest integer: ${distanceRounded}.`)
  console.log(`Rounded to two decimal points: ${roundedToTwoDecimals}.`)

  const areaMeasurement = turf.area(myPolygon)
  const areaRounded = Math.round(areaMeasurement)
  console.log(`Area without rounding: ${areaMeasurement}.`)
  console.log(`Rounded area is ${areaRounded} square meters.`)

  const statueBuffer = turf.buffer(myPoint, 20, {units: 'meters'})
  L.geoJSON(statueBuffer).addTo(map)

  const pathwayBuffer = turf.buffer(myLine, 20, {units: 'meters'})
  L.geoJSON(pathwayBuffer).addTo(map)

  const parkBuffer = turf.buffer(myPolygon, 20, {units: 'meters'})
  L.geoJSON(parkBuffer).addTo(map)

  const parkBufferNegative = turf.buffer(myPolygon, -10, {units: 'meters'})
  L.geoJSON(parkBufferNegative).addTo(map)

  const TurfPointCoords = [26.71216, 58.37428]
  const myTurfPoint = turf.point(TurfPointCoords)
  const geoJSON_TurfPoint = L.geoJSON(myTurfPoint)
  geoJSON_TurfPoint.addTo(map)

  
  const features = turf.featureCollection([myPoint, myTurfPoint, myLine, myPolygon])
  const enveloped = turf.envelope(features)
  L.geoJSON(enveloped).addTo(map)

  const points = turf.points(pointsCollection)
  L.geoJSON(points).addTo(map)

  const pointsWithinBorders = turf.pointsWithinPolygon(points, myPolygon)
  console.log(pointsWithinBorders)
  L.geoJSON(pointsWithinBorders).addTo(map)


//University main building
const uni = turf.point([26.7202, 58.3811])

//Geography building
const museum = turf.point([26.7160, 58.3735])

//Delta building
const delta = turf.point([26.7248, 58.38457])

const chemicum = turf.point([26.6934, 58.3672])

//Markers
L.geoJSON(uni).addTo(map).bindPopup("University main building")
L.geoJSON(museum).addTo(map).bindPopup("Natural History Museum")

//Create line
const routeLine = turf.lineString([
  uni.geometry.coordinates,
  museum.geometry.coordinates
])

L.geoJSON(routeLine, {
  style: { color: "orange", weight: 3 }
}).addTo(map)

//Measure distance
const routeDistance = turf.distance(uni, museum, { units: 'meters' })
const routeRounded = Math.round(routeDistance)

console.log(`Distance to Department of Geography: ${routeRounded} meters`)

//Distance on map
const midpoint = turf.midpoint(uni, museum)
L.geoJSON(midpoint)
  .addTo(map)
  .bindPopup(`Distance to Department of Geography: ${routeRounded} m`)

//Line between main building and Delta
const lineToDelta = turf.lineString([
  uni.geometry.coordinates,
  delta.geometry.coordinates
])

//Delta marker
L.geoJSON(delta)
  .addTo(map)
  .bindPopup("Delta Centre")

//Draw line
L.geoJSON(lineToDelta, {
  style: { color: "green", weight: 3 }
}).addTo(map)

//Measure distance
const deltaDistance = turf.distance(uni, delta, { units: 'meters' })
const deltaRounded = Math.round(deltaDistance)

console.log(`Distance to Delta: ${deltaRounded} meters`)

//Distance on map
const deltaMidpoint = turf.midpoint(uni, delta)
L.geoJSON(deltaMidpoint)
  .addTo(map)
  .bindPopup(`Distance to Delta: ${deltaRounded} m`)

//Chemicum marker
L.geoJSON(chemicum)
  .addTo(map)
  .bindPopup("Chemicum")

//Create line
const lineToChemicum = turf.lineString([
  uni.geometry.coordinates,
  chemicum.geometry.coordinates
])

L.geoJSON(lineToChemicum, {
  style: { color: "blue", weight: 3 }
}).addTo(map)

//Measure distance
const chemDistance = turf.distance(uni, chemicum, { units: 'meters' })
const chemRounded = Math.round(chemDistance)

console.log(`Distance to Chemicum: ${chemRounded} meters`)

//Show on map
const chemMidpoint = turf.midpoint(uni, chemicum)
L.geoJSON(chemMidpoint)
  .addTo(map)
  .bindPopup(`Distance to Chemicum: ${chemRounded} m`)

}

import { pointsCollection } from "../js/points.js"