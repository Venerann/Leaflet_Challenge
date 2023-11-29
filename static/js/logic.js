// Define the map and set its initial view to a specific location and zoom level
const map = L.map('map').setView([0, 0], 2);

// Add base maps
const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});

const darkMap = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors, CartoDB'
});

// Create overlay layers
const earthquakeLayer = L.layerGroup();
const tectonicPlatesLayer = L.layerGroup();

// Add the base map layer
streetMap.addTo(map);

// Fetch and plot earthquake data
const earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson';

fetch(earthquakeUrl)
  .then(response => response.json())
  .then(data => {
    // Loop through earthquake data and create markers
    data.features.forEach(feature => {
      const mag = feature.properties.mag;
      const depth = feature.geometry.coordinates[2];
      const location = feature.geometry.coordinates.slice(0, 2).reverse();
      const title = feature.properties.title;

      // Customize marker size and color based on magnitude and depth
      const marker = L.circleMarker(location, {
        radius: mag * 3, // Adjust the factor as needed
        color: 'black',
        weight: 1,
        fillColor: getColor(depth),
        fillOpacity: 0.8
      });

      // Add popup with additional information
      marker.bindPopup(`<b>${title}</b><br/>Magnitude: ${mag}<br/>Depth: ${depth} km`);

      // Add marker to the earthquake layer
      marker.addTo(earthquakeLayer);
    });

    // Create a legend
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'info legend');
      const depths = [0, 10, 30, 50, 70, 90];

      div.innerHTML += '<h4>Depth (km)</h4>';
      for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<i style="background:' +
          getColor(depths[i] + 1) +
          '"></i> ' +
          depths[i] +
          (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
      }

      return div;
    };

    legend.addTo(map);
  });

// Fetch and plot tectonic plates data
const tectonicPlatesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

fetch(tectonicPlatesUrl)
  .then(response => response.json())
  .then(data => {
    // Create GeoJSON layer for tectonic plates
    const tectonicPlates = L.geoJSON(data, {
      style: {
        color: 'orange',
        weight: 2
      }
    });

    // Add tectonic plates layer to the layer group
    tectonicPlates.addTo(tectonicPlatesLayer);
  });

// Define base maps
const baseMaps = {
  'Street Map': streetMap,
  'Dark Map': darkMap
};

// Define overlay maps
const overlayMaps = {
  'Earthquakes': earthquakeLayer,
  'Tectonic Plates': tectonicPlatesLayer
};

// Add layer controls to the map
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Function to get color based on depth
function getColor(depth) {
  return depth > 90
    ? '#800026'
    : depth > 70
    ? '#BD0026'
    : depth > 50
    ? '#E31A1C'
    : depth > 30
    ? '#FC4E2A'
    : depth > 10
    ? '#FD8D3C'
    : '#FEB24C';
}
