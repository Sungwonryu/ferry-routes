var calculateRoute = function (fromPlace, toPlace, path) {
	// Center initialized to 110 Wall st, New York, NY 10005
	var myOptions = {
	  zoom: 10,
	  center: new google.maps.LatLng(40.7049120,-74.0064030),
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var from = fromPlace.formatted_address;
	var to = toPlace.formatted_address;

	var waypoints = [];

	for (var i = 0; i < path.length; i++) {
		waypoints.push({
			location: new google.maps.LatLng(path[i].lat, path[i].lng),
			stopover: true
		});
	}

	// Draw the map
	var mapObject = new google.maps.Map(document.getElementById("map"), myOptions);
	var directionsService = new google.maps.DirectionsService();
	var directionsRequest = {
	  origin: from,
	  destination: to,
	  waypoints: waypoints,
	  travelMode: google.maps.DirectionsTravelMode.DRIVING,
	  unitSystem: google.maps.UnitSystem.METRIC
	};

	directionsService.route(
	  directionsRequest,
	  function(response, status)
	  {
	    if (status == google.maps.DirectionsStatus.OK)
	    {
	      new google.maps.DirectionsRenderer({
	        map: mapObject,
	        directions: response
	      });
	    }
	    else
	      $("#error").append("Unable to retrieve your route<br />");
	  }
	);
};


var fillInAddress = function (options) {
	var inputId = options.inputId;
	var place = options.place;
	var componentForm = {
	    street_number: 'short_name',
	    administrative_area_level_2: 'long_name',
	    route: 'long_name',
	    locality: 'long_name',
	    administrative_area_level_1: 'short_name',
	    country: 'long_name',
	    postal_code: 'short_name'
	};

	$div = $('#' + inputId).closest('div');


	// Update the inputs after getting google maps place information
	for (var i = 0; i < place.address_components.length; i++) {
		var addressType = place.address_components[i].types[0];
		if (componentForm[addressType]) {
			var value = place.address_components[i][componentForm[addressType]];
			$div.find('.' + addressType).val(value);
		}
	}
	$div.find('input.autocomplete').val(place.formatted_address);
	$div.find('input.latitude').val(place.geometry.location.lat());
	$div.find('input.longitude').val(place.geometry.location.lng());
};

// Create Autocomplete and FerryService objects and Add event listener on autocomplete inputs and geolocation links
var init = function () {
	// Set up Google address autocomplete on two HTML inputs with id of 'from' and 'to'
	var autocompletes = {};
	autocompletes.from = Autocomplete({ inputId: 'from', callback: fillInAddress });
	autocompletes.to = Autocomplete({ inputId: 'to', callback: fillInAddress });


	// Create 'nycFerryService' object using 'FerrySercvie' constructor
	var options = {
	    ferryStations: nycFerryStationList,
	    ferryStationGroups: nycFerryStationGroups,
	    postalCodeGroups: nycFerryStationZipcodeGroups,
	};	
	var nycFerryService = FerryService(options);

	$('#calculate-route').on('submit',function (event) {
		event.preventDefault();

		var fromPlace = autocompletes.from.getPlace();
		var toPlace = autocompletes.to.getPlace();
		// Get 'path' which contains two FerryStation objects
		var path = nycFerryService.findPath(fromPlace, toPlace);
		// Get and draw the route by using google maps directionsservice
		calculateRoute(fromPlace, toPlace, path);
	});	

	$('.geolocation').on('click', function (event) {
		event.preventDefault(event);

		// Get the inputId of autocomplete object
		var inputId = $(event.target).closest('div.address').find('input.autocomplete').attr('id');
		autocompletes[inputId].getGeolocation(fillInAddress);
	})
};


$(document).ready(init);