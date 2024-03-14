var mapOptions;
var map;
var bounds = new google.maps.LatLngBounds();
const workOrders = document.querySelectorAll(".item");
var geocoder;
var polygons = [];

var directionsRenderer, directionsService;

var polygonData = [
    [{
            lat: 12.994007,
            lng: 77.705056
        },
        {
            lat: 12.993286,
            lng: 77.705089
        },
        {
            lat: 12.993192,
            lng: 77.705947
        },
        {
            lat: 12.994049,
            lng: 77.705829
        },
    ],
    [{
            lat: 13.039981,
            lng: 77.718195
        },
        {
            lat: 13.019744,
            lng: 77.71974
        },
        {
            lat: 13.016567,
            lng: 77.735876
        },
        {
            lat: 13.039813,
            lng: 77.733816
        }
    ],
    [{
            lat: 12.99058,
            lng: 77.710867
        },
        {
            lat: 12.987485,
            lng: 77.710867
        },
        {
            lat: 12.990161,
            lng: 77.716403
        }
    ]
];


var coordinates = []
let new_coordinates = []
let lastElement

function InitMap() {
  var location = new google.maps.LatLng(28.620585, 77.228609);
  mapOptions = {
    zoom: 12,
    minZoom: 3,
    maxZoom: 20,
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
                draggable: true,
                editable: true,
                strokeColor: "#FF0000",
                id: Math.random().toString(16).slice(2),
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#ff9999',
                fillOpacity: 0.5,
            }).setMap(map);

        }
    }


    populateDefaultPolygons();
    var drawingManager = new google.maps.drawing.DrawingManager({
        //drawingMode: google.maps.drawing.OverlayType.MARKER,
        //drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                google.maps.drawing.OverlayType.MARKER,
                google.maps.drawing.OverlayType.CIRCLE,
                google.maps.drawing.OverlayType.POLYGON,
                google.maps.drawing.OverlayType.RECTANGLE
            ]
        },
        markerOptions: {
            //icon: 'images/beachflag.png'
        },
        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 0.2,
            strokeWeight: 3,
            clickable: true,
            editable: true,
            zIndex: 1
        },
        polygonOptions: {
            clickable: true,
            draggable: true,
            editable: true,
            // fillColor: '#ffff00',
            fillColor: '#ADFF2F',
            fillOpacity: 0.5,

        },
        rectangleOptions: {
            clickable: true,
            draggable: true,
            editable: true,
            fillColor: '#ffff00',
            fillOpacity: 0.5,
        }
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
        stopDrawing()
        selectedShape = shape;
        shape.setEditable(true);
    }

    function deleteSelectedShape() {
        if (selectedShape) {
            selectedShape.setMap(null);
            drawingManager.setMap(map);
            coordinates.splice(0, coordinates.length)
            document.getElementById('info').innerHTML = ""
        }
    }

    function CenterControl(controlDiv, map, name) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid black';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '10px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Select to delete the shape';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingRight = '5px';
        controlText.style.display = 'flex';
        controlText.style.alignItems = 'center';
        controlText.innerHTML = '<span><i class="material-icons">delete</i></span><span>Delete</span>';
        controlUI.appendChild(controlText);

        //to delete the polygon
        controlUI.addEventListener('click', function() {
            deleteSelectedShape();
        });


    }

    drawingManager.setMap(map);

    var getPolygonCoords = function(newShape) {

        coordinates.splice(0, coordinates.length)

        var len = newShape.getPath().getLength();

        for (var i = 0; i < len; i++) {
            coordinates.push(newShape.getPath().getAt(i).toUrlValue(6))
        }
        document.getElementById('info').innerHTML = coordinates


    }

    google.maps.event.addListener(drawingManager, 'polygoncomplete', function(event) {
        event.getPath().getLength();
        google.maps.event.addListener(event, "dragend", getPolygonCoords(event));

        google.maps.event.addListener(event.getPath(), 'insert_at', function() {
            getPolygonCoords(event)

        });

        google.maps.event.addListener(event.getPath(), 'set_at', function() {
            getPolygonCoords(event)
        })
    })

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
        all_overlays.push(event);
        if (event.type !== google.maps.drawing.OverlayType.MARKER) {
            //  drawingManager.setDrawingMode(null);

            var newShape = event.overlay;
            newShape.type = event.type;
            google.maps.event.addListener(newShape, 'click', function() {
                setSelection(newShape);
            });
            setSelection(newShape);
        }
    })

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map, "centerControlDiv");


    centerControlDiv.index = 2;
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv);

}

InitMap()

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
