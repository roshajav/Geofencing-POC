
var mapOptions;
var map;
var bounds = new google.maps.LatLngBounds();

var geocoder;
var polygons = [];


	 var singida = [
    new google.maps.LatLng(-6.926427, 33.464355),
    new google.maps.LatLng(-7.057282, 33.662109),
    new google.maps.LatLng(-7.122696, 33.750000),
    new google.maps.LatLng(-7.209900, 33.771973),
    new google.maps.LatLng(-7.471411, 33.750000),
    new google.maps.LatLng(-7.536764, 33.793945),
    new google.maps.LatLng(-7.536764, 33.969727)
  ];


  var Tabora = [
    new google.maps.LatLng(-4.127285, 31.684570),
    new google.maps.LatLng(-4.236856, 31.684570),
    new google.maps.LatLng(-4.258768, 31.508789),
    new google.maps.LatLng(-4.236856, 31.486816),
    new google.maps.LatLng(-4.302591, 31.464844),
    new google.maps.LatLng(-4.477856, 31.420898),
    new google.maps.LatLng(-4.631179, 31.464844)
  ];

var coordinates = []
let new_coordinates = []
let lastElement

function InitMap() {
    var location = new google.maps.LatLng(28.620585, 77.228609)
    mapOptions = {
        zoom: 5,
        //center: location,
		center: { lat: 24.886, lng: -70.268 },
        mapTypeId: google.maps.MapTypeId.RoadMap,
		// mapTypeId: "terrain",
    }
	
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions)
    var all_overlays = [];
    var selectedShape;
	//----------------------------------

	
const triangleCoords = [
    { lat: 25.774, lng: -80.19 },
    { lat: 18.466, lng: -66.118 },
    { lat: 32.321, lng: -64.757 },
    { lat: 25.774, lng: -80.19 },
  ];
  // Construct the polygon.
  var bermudaTriangle = new google.maps.Polygon({
    paths: triangleCoords,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
  });

  bermudaTriangle.setMap(map);
  
  
  var obj = {
        'id':'shubham',
        'rented':'yes',
        'area':bermudaTriangle
    };
	
    bermudaTriangle.objInfo = obj;
	
	  google.maps.event.addListener(bermudaTriangle, 'click', function(event) {debugger
        console.log(this.objInfo);
		
		bermudaTriangle.setMap(null);
		
			function polygonCenter(poly) {
							const vertices = poly.getPath();

							// put all latitudes and longitudes in arrays
							const longitudes = new Array(vertices.length).map((_, i) => vertices.getAt(i).lng());
							const latitudes = new Array(vertices.length).map((_, i) => vertices.getAt(i).lat());

							// sort the arrays low to high
							latitudes.sort();
							longitudes.sort();

							// get the min and max of each
							const lowX = latitudes[0];
							const highX = latitudes[latitudes.length - 1];
							const lowy = longitudes[0];
							const highy = longitudes[latitudes.length - 1];

							// center of the polygon is the starting point plus the midpoint
							const centerX = lowX + ((highX - lowX) / 2);
							const centerY = lowy + ((highy - lowy) / 2);

							return (new google.maps.LatLng(centerX, centerY));
						}
		
		
		
						var polycenter = polygonCenter(bermudaTriangle);
		
						const markerViewWithText = new google.maps.marker.AdvancedMarkerElement({
				  map,
				  position: polycenter,
				  title: "Title text for the marker at lat: 37.419, lng: -122.03",
				});
		
							
    });
  
  
  
    const bermudaTriangle1 = new google.maps.Polygon({
    paths: singida,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
  });

  bermudaTriangle1.setMap(map);
  
    const bermudaTriangle2 = new google.maps.Polygon({
    paths: Tabora,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
  });

  bermudaTriangle2.setMap(map);
  
  attachPolygonInfoWindow(bermudaTriangle)

function attachPolygonInfoWindow(polygon) {
    var infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(polygon, 'mouseover', function (e) {
        infoWindow.setContent("Polygon bermudaTriangle");
        var latLng = e.latLng;
        infoWindow.setPosition(latLng);
        infoWindow.open(map);
    });
}

/*
map.setOnPolygonClickListener(new OnPolygonClickListener() {
			 void onPolygonClick(Polygon polygon){debugger
			   //do whatever with polygon!
			 }
});

	*/
	
	
 //	--------------------------------------------
    
    var drawingManager = new google.maps.drawing.DrawingManager({
        //drawingMode: google.maps.drawing.OverlayType.MARKER,
        //drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                //google.maps.drawing.OverlayType.MARKER,
                //google.maps.drawing.OverlayType.CIRCLE,
                google.maps.drawing.OverlayType.POLYGON,
                //google.maps.drawing.OverlayType.RECTANGLE
            ]
        },
        markerOptions: {
            //icon: 'images/beachflag.png'
        },
        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 0.2,
            strokeWeight: 3,
            clickable: false,
            editable: true,
            zIndex: 1
        },
        polygonOptions: {
            clickable: true,
            draggable: false,
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
		
		
		if(name === "centerControlDiv" ){
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
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = '<span><i class="material-icons">delete</i></span><span>Delete</span>';
        controlUI.appendChild(controlText);

        //to delete the polygon
        controlUI.addEventListener('click', function () {
            deleteSelectedShape();
        });
		}
		
		if(name === "centerControlDiv1" ){
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
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = '<span><i class="material-icons">add</i></span><span>Add</span>';
        controlUI.appendChild(controlText);

        //to delete the polygon
        controlUI.addEventListener('click', function () {
            deleteSelectedShape();
        });
		}
		

        
    }

    drawingManager.setMap(map);

    var getPolygonCoords = function (newShape) {

        coordinates.splice(0, coordinates.length)

        var len = newShape.getPath().getLength();

        for (var i = 0; i < len; i++) {
            coordinates.push(newShape.getPath().getAt(i).toUrlValue(6))
        }
        document.getElementById('info').innerHTML = coordinates
       
       
    }

    google.maps.event.addListener(drawingManager, 'polygoncomplete', function (event) {
        event.getPath().getLength();
        google.maps.event.addListener(event, "dragend", getPolygonCoords(event));

        google.maps.event.addListener(event.getPath(), 'insert_at', function () {
            getPolygonCoords(event)
            
        });

        google.maps.event.addListener(event.getPath(), 'set_at', function () {
            getPolygonCoords(event)
        })
    })

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
        all_overlays.push(event);
        if (event.type !== google.maps.drawing.OverlayType.MARKER) {
            drawingManager.setDrawingMode(null);

            var newShape = event.overlay;
            newShape.type = event.type;
            google.maps.event.addListener(newShape, 'click', function () {
                setSelection(newShape);
            });
            setSelection(newShape);
        }
    })

    var centerControlDiv = document.createElement('div');
	var centerControlDiv1 = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map, "centerControlDiv");
	var centerControl = new CenterControl(centerControlDiv1, map, "centerControlDiv1");

    
    centerControlDiv.index = 1;
	 centerControlDiv1.index = 2;
    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(centerControlDiv);
	map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(centerControlDiv1);

}

InitMap()
