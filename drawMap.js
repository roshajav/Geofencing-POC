var mapOptions;
var map;
var bounds = new google.maps.LatLngBounds();
const workOrders = document.querySelectorAll(".item");
var geocoder;
var polygons = [];

var directionsRenderer, directionsService;

var polygonData = [
  [
    {
      lat: 25.774,
      lng: -80.19,
    },
    {
      lat: 18.466,
      lng: -66.118,
    },
    {
      lat: 32.321,
      lng: -64.757,
    },
    {
      lat: 25.774,
      lng: -80.19,
    },
  ],
  [
    {
      lat: -4.127285,
      lng: 31.68457,
    },
    {
      lat: -4.236856,
      lng: 31.68457,
    },
    {
      lat: -4.258768,
      lng: 31.508789,
    },
    {
      lat: -4.236856,
      lng: 31.486816,
    },
    {
      lat: -4.302591,
      lng: 31.464844,
    },
    {
      lat: -4.477856,
      lng: 31.420898,
    },
    {
      lat: -4.631179,
      lng: 31.464844,
    },
  ],
  [
    {
      lat: -6.926427,
      lng: 33.464355,
    },
    {
      lat: -7.057282,
      lng: 33.662109,
    },
    {
      lat: -7.122696,
      lng: 33.75,
    },
    {
      lat: -7.2099,
      lng: 33.771973,
    },
    {
      lat: -7.471411,
      lng: 33.75,
    },
    {
      lat: -7.536764,
      lng: 33.793945,
    },
    {
      lat: -7.536764,
      lng: 33.969727,
    },
  ],
];

var coordinates = [];
let new_coordinates = [];
let lastElement;

function InitMap() {
  var location = new google.maps.LatLng(28.620585, 77.228609);
  mapOptions = {
    zoom: 8,
    minZoom: 3,
    maxZoom: 20,
    //center: location,
    // center: {
    //     lat: 24.886,
    //     lng: -70.268
    // },
    center: { lat: 0, lng: 0 },
    mapTypeId: google.maps.MapTypeId.RoadMap,
  };

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        var marker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "Your Location",
        });

        map.setCenter(userLocation);
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

  // construct and populate default data

  function populateDefaultPolygons() {
    for (let i = 0; i < polygonData.length; i++) {
      new google.maps.Polygon({
        paths: polygonData[i],
        clickable: true,
        // draggable: true,
        // editable: true,
        strokeColor: "#FF0000",
        id: Math.random().toString(16).slice(2),
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#ADFF2F",
        fillOpacity: 0.5,
      }).setMap(map);
    }
  }

  populateDefaultPolygons();

  /*	
	
			function calculateAndDisplayRoute(directionsService, directionsRenderer) {debugger
			
			 directionsRenderer = new google.maps.DirectionsRenderer();
     directionsRenderer.getMap(map);
     directionsService = new google.maps.DirectionsService();

  directionsService
    .route({
      origin: new google.maps.LatLng(51.7519, -1.2578),
      destination: new google.maps.LatLng(50.8429, -0.1313),
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
      directionsRenderer.setDirections(response);
    })
    .catch((e) => window.alert("Directions request failed due to " + status));
}
	
	
	
	setTimeout(

     calculateAndDisplayRoute()

	,20000)
	

*/

  var drawingManager = new google.maps.drawing.DrawingManager({
    //drawingMode: google.maps.drawing.OverlayType.MARKER,
    //drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        // google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.RECTANGLE,
      ],
    },
    markerOptions: {
      //icon: 'images/beachflag.png'
    },
    circleOptions: {
      fillColor: "#ffff00",
      fillOpacity: 0.2,
      strokeWeight: 3,
      clickable: true,
      editable: true,
      zIndex: 1,
    },
    polygonOptions: {
      clickable: true,
      draggable: true,
      editable: true,
      // fillColor: '#ffff00',
      fillColor: "#ADFF2F",
      fillOpacity: 0.5,
    },
    rectangleOptions: {
      clickable: true,
      draggable: true,
      editable: true,
      fillColor: "#ffff00",
      fillOpacity: 0.5,
    },
  });

  function clearSelection() {
    if (selectedShape) {
      selectedShape.setEditable(false);
      selectedShape = null;
    }
  }
  //to disable drawing tools
  function stopDrawing() {
    drawingManager.setMap(null);
  }

  function setSelection(shape) {
    clearSelection();
    stopDrawing();
    selectedShape = shape;
    shape.setEditable(true);
  }

  function deleteSelectedShape() {
    if (selectedShape) {
      selectedShape.setMap(null);
      drawingManager.setMap(map);
      coordinates.splice(0, coordinates.length);
      document.getElementById("info").innerHTML = "";
    }
  }

  function CenterControl(controlDiv, map, name) {
    if (name === "centerControlDiv") {
      // Set CSS for the control border.
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

      // Set CSS for the control interior.
      var controlText = document.createElement("div");
      controlText.style.color = "rgb(25,25,25)";
      controlText.style.fontFamily = "Roboto,Arial,sans-serif";
      controlText.style.fontSize = "16px";
      controlText.style.lineHeight = "38px";
      controlText.style.paddingLeft = "5px";
      controlText.style.paddingRight = "5px";
      controlText.innerHTML =
        '<span><i class="material-icons">delete</i></span><span>Delete</span>';
      controlUI.appendChild(controlText);

      //to delete the polygon
      controlUI.addEventListener("click", function () {
        deleteSelectedShape();
      });
    }

    if (name === "centerControlDiv1") {
      // Set CSS for the control border.
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

      // Set CSS for the control interior.
      var controlText = document.createElement("div");
      controlText.style.color = "rgb(25,25,25)";
      controlText.style.fontFamily = "Roboto,Arial,sans-serif";
      controlText.style.fontSize = "16px";
      controlText.style.lineHeight = "38px";
      controlText.style.paddingLeft = "5px";
      controlText.style.paddingRight = "5px";
      controlText.innerHTML =
        '<span><i class="material-icons">add</i></span><span>Add</span>';
      controlUI.appendChild(controlText);

      //to delete the polygon
      controlUI.addEventListener("click", function () {
        deleteSelectedShape();
      });
    }
  }

  drawingManager.setMap(map);

  var getPolygonCoords = function (newShape) {
    coordinates.splice(0, coordinates.length);

    var len = newShape.getPath().getLength();

    for (var i = 0; i < len; i++) {
      coordinates.push(newShape.getPath().getAt(i).toUrlValue(6));
    }
    document.getElementById("info").innerHTML = coordinates;
  };

  google.maps.event.addListener(
    drawingManager,
    "polygoncomplete",
    function (event) {
      event.getPath().getLength();
      google.maps.event.addListener(event, "dragend", getPolygonCoords(event));

      google.maps.event.addListener(event.getPath(), "insert_at", function () {
        getPolygonCoords(event);
      });

      google.maps.event.addListener(event.getPath(), "set_at", function () {
        getPolygonCoords(event);
      });
    }
  );

  google.maps.event.addListener(
    drawingManager,
    "overlaycomplete",
    function (event) {
      all_overlays.push(event);
      if (event.type !== google.maps.drawing.OverlayType.MARKER) {
        //  drawingManager.setDrawingMode(null);

        var newShape = event.overlay;
        newShape.type = event.type;
        debugger;
        google.maps.event.addListener(newShape, "click", function () {
          // setSelection(newShape);
        });
        //`setSelection(newShape);
      }
    }
  );

  var centerControlDiv = document.createElement("div");
  var centerControlDiv1 = document.createElement("div");
  var centerControl = new CenterControl(
    centerControlDiv,
    map,
    "centerControlDiv"
  );
  var centerControl = new CenterControl(
    centerControlDiv1,
    map,
    "centerControlDiv1"
  );

  centerControlDiv.index = 1;
  centerControlDiv1.index = 2;
  map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(centerControlDiv);
  map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(
    centerControlDiv1
  );
}

InitMap();

//WorkOrder lat longs
const taskVsLatLongArr = [
  [12.9887029, 77.7087437],
  [12.9958017, 77.6938219],
  [12.9820517, 77.7309389],
  [12.8913125, 77.7410666],
];

//Adding on click listener for work order lat long
workOrders.forEach((item, index) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    setMarker(taskVsLatLongArr[index]);
    item.classList.add("background: rgb(128, 128, 128)");
  });
});

// Function for adding a marker to the page.
function addMarker(location) {
  marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
  });
}

// For Calling the addMarker function
function setMarker(assetLatLongArray) {
  var location = new google.maps.LatLng(
    assetLatLongArray[0],
    assetLatLongArray[1]
  );
  addMarker(location);
}
