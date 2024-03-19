var mapOptions;
var map;
var bounds = new google.maps.LatLngBounds();
const workOrders = document.querySelectorAll(".item");
var geocoder;
var polygons = [];
var flagged = 0;
var directionsRenderer, directionsService;
var polygonData = JSON.parse(localStorage.getItem("polygonData")) || [
  [
    { lat: 12.997489, lng: 77.707143 },
    { lat: 12.994813, lng: 77.695985 },
    { lat: 12.985446, lng: 77.702165 },
    { lat: 12.990798, lng: 77.703195 },
    { lat: 12.992722, lng: 77.712121 },
  ],
  [
    { lat: 13.039981, lng: 77.718195 },
    { lat: 13.019744, lng: 77.71974 },
    { lat: 13.016567, lng: 77.735876 },
    { lat: 13.039813, lng: 77.733816 },
  ],
  [
    { lat: 12.979684, lng: 77.713832 },
    { lat: 12.986543, lng: 77.723445 },
    { lat: 12.97935, lng: 77.730827 },
    { lat: 12.961283, lng: 77.711257 },
  ],
];

var circleData = [
  { center: { lat: 12.950984, lng: 77.635489 }, radius: 1000 },
  { center: { lat: 13.019723, lng: 77.695432 }, radius: 800 },
  { center: { lat: 12.985678, lng: 77.680987 }, radius: 1200 },
];

var rectangleData = [
  [
    { lat: 12.965482, lng: 77.645825 },
    { lat: 12.965482, lng: 77.656389 },
    { lat: 12.953672, lng: 77.656389 },
    { lat: 12.953672, lng: 77.645825 },
    { lat: 12.965482, lng: 77.645825 },
  ],
  [
    { lat: 12.958765, lng: 77.678987 },
    { lat: 12.958765, lng: 77.689012 },
    { lat: 12.947123, lng: 77.689012 },
    { lat: 12.947123, lng: 77.678987 },
    { lat: 12.958765, lng: 77.678987 },
  ],
];

var coordinates = [];
let new_coordinates = [];
let lastElement;

function saveGeoFenceDataToLocalStorage() {
  localStorage.setItem("polygonData", JSON.stringify(polygonData));
  localStorage.setItem("circleData", JSON.stringify(circleData));
  localStorage.setItem("rectangleData", JSON.stringify(rectangleData));
}

function InitMap() {
  var location = new google.maps.LatLng(28.620585, 77.228609);
  mapOptions = {
    zoom: 12,
    minZoom: 3,
    maxZoom: 20,
    center: { lat: 0, lng: 0 },
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  var marker = new google.maps.Marker({
    position: location,
    map: map,
    title: "Your Location",
    draggable: true,
  });

  google.maps.event.addListener(marker, "dragend", function (event) {
    map.setCenter(marker.getPosition());
    checkLocationInHazardousArea(marker.getPosition());
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        marker.setPosition(userLocation);
        map.setCenter(userLocation);
        checkLocationInHazardousArea(userLocation);
      },
      function () {
        handleLocationError(true, map.getCenter());
      }
    );
  } else {
    handleLocationError(false, map.getCenter());
  }

  var all_overlays = [];
  var selectedShape;

  function populateDefaultPolygons() {
    for (let i = 0; i < polygonData.length; i++) {
      var polygon = new google.maps.Polygon({
        paths: polygonData[i],
        clickable: true,
        draggable: true,
        editable: true,
        strokeColor: "#FF0000",
        id: Math.random().toString(16).slice(2),
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#e80707",
        fillOpacity: 0.5,
      });
      polygons.push(polygon);
      polygon.setMap(map);
    }
  }

  function addCircle(circle) {
    var circleObject = new google.maps.Circle({
      strokeColor: "#fcfc03",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#fcfc03",
      fillOpacity: 0.5,
      map: map,
      center: circle.center,
      radius: circle.radius,
      clickable: true,
      draggable: true,
      editable: true,
    });
  }

  function addRectangle(rectangle) {
    var rectangleObject = new google.maps.Rectangle({
      strokeColor: "#f73d0a",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#f73d0a",
      fillOpacity: 0.5,
      map: map,
      bounds: {
        north: rectangle[0].lat,
        south: rectangle[2].lat,
        east: rectangle[1].lng,
        west: rectangle[3].lng,
      },
      clickable: true,
      draggable: true,
      editable: true,
    });
  }

  function populateDefaultCircles() {
    circleData.forEach(function (circle) {
      addCircle(circle);
    });
  }

  function populateDefaultRectangles() {
    rectangleData.forEach(function (rectangle) {
      addRectangle(rectangle);
    });
  }

  populateDefaultCircles();
  populateDefaultRectangles();
  populateDefaultPolygons();

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.RECTANGLE,
      ],
    },
    circleOptions: {
      fillColor: "#fcfc03",
      fillOpacity: 0.5,
      strokeColor: "#fcfc03",
      strokeWeight: 2,
      strokeOpacity: 0.8,
      clickable: true,
      editable: true,
      draggable: true,
      zIndex: 1,
      id: Math.random().toString(16).slice(2),
    },
    polygonOptions: {
      fillColor: "#e80707",
      fillOpacity: 0.5,
      strokeColor: "#e80707",
      strokeWeight: 2,
      strokeOpacity: 0.8,
      clickable: true,
      draggable: true,
      editable: true,
      id: Math.random().toString(16).slice(2),
    },
    rectangleOptions: {
      fillColor: "#f73d0a",
      fillOpacity: 0.5,
      strokeColor: "#f73d0a",
      strokeWeight: 2,
      strokeOpacity: 0.8,
      clickable: true,
      draggable: true,
      editable: true,
      id: Math.random().toString(16).slice(2),
    },
  });

  function clearSelection() {
    if (selectedShape) {
      selectedShape.setEditable(false);
      selectedShape = null;
    }
  }

  function stopDrawing() {
    drawingManager.setMap(null);
  }

  function setSelection(shape) {
    clearSelection();
    selectedShape = shape;
    shape.setEditable(true);
  }

  function deleteSelectedShape() {
    if (selectedShape) {
      selectedShape.setMap(null);
      drawingManager.setMap(map);
      coordinates.splice(0, coordinates.length);
      document.getElementById("info").innerHTML = "";
      saveGeoFenceDataToLocalStorage();
    }
  }

  function CenterControl(controlDiv, map, name) {
    var controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid black";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginBottom = "10px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Select to delete the shape";
    controlDiv.appendChild(controlUI);

    var controlText = document.createElement("div");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingRight = "5px";
    controlText.style.display = "flex";
    controlText.style.alignItems = "center";
    controlText.innerHTML =
      '<span><i class="material-icons">delete</i></span><span>Delete</span>';
    controlUI.appendChild(controlText);

    controlUI.addEventListener("click", function () {
      deleteSelectedShape();
    });
  }

  drawingManager.setMap(map);

  var getPolygonCoords = function (newShape) {
    coordinates.splice(0, coordinates.length);
    var len = newShape.getPath().getLength();
    for (var i = 0; i < len; i++) {
      coordinates.push(newShape.getPath().getAt(i).toUrlValue(6));
    }
    document.getElementById("info").innerHTML = coordinates;
    saveGeoFenceDataToLocalStorage();
  };

  google.maps.event.addListener(
    drawingManager,
    "polygoncomplete",
    function (event) {
      event.getPath().getLength();
      google.maps.event.addListener(event, "dragend", function () {
        getPolygonCoords(event);
      });
      google.maps.event.addListener(event.getPath(), "insert_at", function () {
        getPolygonCoords(event);
      });
      google.maps.event.addListener(event.getPath(), "set_at", function () {
        getPolygonCoords(event);
      });
      polygons.push(event);
    }
  );

  google.maps.event.addListener(
    drawingManager,
    "circlecomplete",
    function (circle) {
      circle.setMap(null);
      circleData.push({
        center: {
          lat: circle.getCenter().lat(),
          lng: circle.getCenter().lng(),
        },
        radius: circle.getRadius(),
      });
      populateDefaultCircles();
    }
  );

  google.maps.event.addListener(
    drawingManager,
    "rectanglecomplete",
    function (rectangle) {
      rectangle.setMap(null);
      const bounds = rectangle.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      rectangleData.push([
        { lat: ne.lat(), lng: sw.lng() },
        { lat: ne.lat(), lng: ne.lng() },
        { lat: sw.lat(), lng: ne.lng() },
        { lat: sw.lat(), lng: sw.lng() },
      ]);
      populateDefaultRectangles();
    }
  );

  google.maps.event.addListener(
    drawingManager,
    "overlaycomplete",
    function (event) {
      all_overlays.push(event);
      if (event.type !== google.maps.drawing.OverlayType.MARKER) {
        var newShape = event.overlay;
        newShape.type = event.type;
        google.maps.event.addListener(newShape, "click", function () {
          setSelection(newShape);
        });
        setSelection(newShape);
      }
    }
  );

  var centerControlDiv = document.createElement("div");
  var centerControl = new CenterControl(
    centerControlDiv,
    map,
    "centerControlDiv"
  );
  centerControlDiv.index = 2;
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(
    centerControlDiv
  );
}

function checkLocationInHazardousArea(location) {
  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    if (google.maps.geometry.poly.containsLocation(location, polygon)) {
      alert("You are in a hazardous area! Please move away!");
      flagged = 1;
      return;
    }
  }

  for (let i = 0; i < circleData.length; i++) {
    const circle = circleData[i];
    const center = new google.maps.LatLng(circle.center.lat, circle.center.lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      center,
      location
    );
    if (distance <= circle.radius) {
      alert("You are in a low risk area. Please be cautious!");
      flagged = 1;
      return;
    }
  }

  for (let i = 0; i < rectangleData.length; i++) {
    const rectangle = rectangleData[i];
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(rectangle[2].lat, rectangle[3].lng),
      new google.maps.LatLng(rectangle[0].lat, rectangle[1].lng)
    );
    if (bounds.contains(location)) {
      alert("You are in a medium risk area. Please be cautious!");
      flagged = 1;
      return;
    }
  }

  if (flagged == 1) {
    alert("You are in safe zone now!");
    flagged = 0;
  }
}

InitMap();

const taskVsLatLongArr = [
  [12.9887029, 77.7087437],
  [12.9958017, 77.6938219],
  [12.9820517, 77.7309389],
  [12.8913125, 77.7410666],
];

workOrders.forEach((item, index) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    setMarker(taskVsLatLongArr[index]);
    item.classList.add("background: rgb(128, 128, 128)");
  });
});

function addMarker(location) {
  marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
  });
}

function setMarker(assetLatLongArray) {
  var location = new google.maps.LatLng(
    assetLatLongArray[0],
    assetLatLongArray[1]
  );
  addMarker(location);
}
