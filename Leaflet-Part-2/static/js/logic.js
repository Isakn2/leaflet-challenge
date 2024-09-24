// Base Layers: Satellite, Grayscale, Outdoors
let satelliteMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; Satellite Map contributors'
});

let grayscaleMap = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap Grayscale'
});

let outdoorsMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap contributors'
});

// Create map with default layer
let myMap = L.map("map", {
    center: [20.0, 5.0],
    zoom: 2,
    layers: [satelliteMap]  // default base layer only
});

// Earthquake data URL (from the USGS GeoJSON feed)
let earthquakeDataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Tectonic Plates URL
let tectonicPlatesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

// Add earthquake data layer
let earthquakeLayer = L.geoJSON(null, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.geometry.coordinates[2]),  // Depth is the 3rd coordinate
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3>
                         <p>Location: ${feature.properties.place}</p>
                         <p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
    }
});

// Add tectonic plates layer
let tectonicPlatesLayer = L.geoJSON(null, {
    style: function () {
        return {
            color: "orange",
            weight: 2
        };
    }
});

// Load Earthquake and Tectonic Plates data
d3.json(earthquakeDataUrl).then(function(data) {
    earthquakeLayer.addData(data); // Load earthquake data
    earthquakeLayer.addTo(myMap); // Add earthquake layer to map after data is loaded
});

d3.json(tectonicPlatesUrl).then(function(data) {
    tectonicPlatesLayer.addData(data); // Load tectonic plates data
    tectonicPlatesLayer.addTo(myMap); // Add tectonic plates layer to map after data is loaded
});

// Function to scale circle size by earthquake magnitude
function getRadius(magnitude) {
    return magnitude ? magnitude * 4 : 1;  // Increased the multiplier to make circles larger
}

// Function to get color based on depth of earthquake (green to red gradient)
function getColor(depth) {
    return depth > 90 ? '#FF0000' :   // red (deep)
           depth > 70 ? '#FF4500' : // light red
           depth > 50 ? '#FFA500' : // orange
           depth > 30 ? '#FFD700' : // light orange
           depth > 10 ? '#ADFF2F' : // light green
                        '#00FF00';  // green (shallow)
}

// Base Layers
let baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorsMap
};

// Overlay Layers
let overlayMaps = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicPlatesLayer
};

// Add Layer Control with overlays checked by default
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false // keep menu open by default
}).addTo(myMap);

// Add legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let depthLimits = [-10, 10, 30, 50, 70, 90];
    let depthColors = [
        "#00FF00", // green (shallow)
        "#ADFF2F", // light green
        "#FFD700", // light orange
        "#FFA500", // orange
        "#FF4500", // light red
        "#FF0000"  // red (deep)
    ];

    // Add a header to the legend
    let legendInfo = `<h1>Earthquake Depth (km)</h1>`;
    div.innerHTML = legendInfo;

    // Create a list for the legend items
    let ul = document.createElement('ul'); // Create a new unordered list

    // Create a colored box and label for each depth range
    for (let i = 0; i < depthLimits.length; i++) {
        let from = depthLimits[i];
        let to = depthLimits[i + 1] ? depthLimits[i + 1] : "+";

        // Create list item with color box and text
        let li = document.createElement('li');
        li.style.listStyle = 'none'; // Remove default list styling
        li.style.padding = '5px 0'; // Add some padding for spacing

        // Create a small colored box
        let colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.backgroundColor = depthColors[i];
        colorBox.style.marginRight = '5px'; // Space between box and text

        li.appendChild(colorBox); // Append the colored box to the list item
        li.innerHTML += `${from} - ${to} km`; // Add depth range text
        ul.appendChild(li); // Append the list item to the unordered list
    }

    div.appendChild(ul); // Append the list to the legend div

    return div;
};

// Add the legend to the map
legend.addTo(myMap);
