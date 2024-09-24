// Create the map and set its view
let myMap = L.map("map", {
    center: [20.0, 5.0],
    zoom: 2
});

// Add a tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Earthquake data URL (from the USGS GeoJSON feed)
let earthquakeDataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Function to determine the marker radius based on earthquake magnitude
function getRadius(magnitude) {
    return magnitude ? magnitude * 4 : 1;  // Increased the multiplier to make circles larger
}

// Function to determine the marker color based on earthquake depth (green to red)
function getColor(depth) {
    // Use a series of conditional statements to determine color based on depth
    if (depth <= 10) return "#00FF00"; // green (shallow)
    else if (depth <= 30) return "#ADFF2F"; // light green
    else if (depth <= 50) return "#FFD580"; // light orange
    else if (depth <= 70) return "#FFA500"; // orange
    else if (depth <= 90) return "#FF4500"; // dark orange
    else return "#FF0000"; // red (deep)
}

// Fetch earthquake data and plot it on the map
d3.json(earthquakeDataUrl).then(function (data) {
    // Create the GeoJSON layer
    let geojson = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),
                fillColor: getColor(feature.geometry.coordinates[2]), // Depth is the 3rd coordinate
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3>
                             <p>Location: ${feature.properties.place}</p>
                             <p>Depth: ${feature.geometry.coordinates[2]} km</p>`); // Depth is the 3rd coordinate
        }
    }).addTo(myMap);

    // Call the function to add the legend
    addLegend(geojson);
});

// Add a legend
function addLegend(geojson) {
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        let limits = [-10, 10, 30, 50, 70, 90]; // Depth limits
        let colors = [
            "#00FF00", // green (shallow)
            "#ADFF2F", // light green
            "#FFD580", // light orange
            "#FFA500", // orange
            "#FF4500", // dark orange
            "#FF0000"  // red (deep)
        ];
        let labels = [];

        // Add a header to the legend
        let legendInfo = "<h1>Earthquake Depth (km)</h1>";
        div.innerHTML = legendInfo;

        // Loop through each limit and color to create a label for the legend
        for (let i = 0; i < limits.length; i++) {
            let from = limits[i];
            let to = limits[i + 1] ? limits[i + 1] : "+";
            labels.push(
                `<li><span style="background-color: ${colors[i]}"></span> ${from} - ${to} km</li>`
            );
        }

        // Join the labels into a list and add them to the div
        div.innerHTML += "<ul>" + labels.join("") + "</ul>"; // Unordered list to div 

        return div;
    };

    // Add the legend to the map
    legend.addTo(myMap);
}
