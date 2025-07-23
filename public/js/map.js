mapboxgl.accessToken = mapToken;
mapCoordinates=JSON.parse(mapCoordinates);
mapTitle=JSON.parse(mapTitle);
mapLocation=JSON.parse(mapLocation);

const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12',
        center: mapCoordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9, // starting zoom
});


const marker = new mapboxgl.Marker({color:'Red'})
.setLngLat(mapCoordinates)
.setPopup(
        new mapboxgl.Popup({offset:25}).setHTML(`<h1>${mapTitle}</h1><P>Exact Location will be provided after booking</P>`)
)
.addTo(map);
