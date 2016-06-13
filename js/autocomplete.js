/**
 * Autocomplete module
 *
 */

 // Use ';' to clear any unfinished previous statement  
 ;(function (global, $, google) {

 	// 'new' an object
 	var Autocomplete = function (options) {
 		return new Autocomplete.init(options);
 	};

 	// 'prototype' holds methods to save memory space
 	// 'Autocomplete' module depends on jQuery and google maps API 
 	Autocomplete.prototype = {

 		// 'validate' check if its dependencies such as jQuery and google maps are loaded.
 		validate: function () {
 			if (!$) { throw 'jQuery not loaded'; }
 			if (!google) { throw 'google maps not loaded'; }

 			// 'this' refers to the calling object at execution time
 			if (!document.getElementById(this.inputId)) { throw 'HTML input id is not valid'; }
 		},

 		// 'getPlace' returns google maps place object
 		getPlace: function () {
 			return this.place;
 		},

 		// Set 'this.place' by using browser's navigator.gelocation feature and run callback function
 		getGeolocation: function (callback) {
 			var self = this;


 			if (!global.navigator.geolocation) {
 				throw 'Your browser doesn\'t support Geolocation API';
 			} else {
 				global.navigator.geolocation.getCurrentPosition(function (position) {
 					var latlng = { lat: parseFloat(position.coords.latitude), lng: parseFloat(position.coords.longitude) };

 			    	var geocoder = new google.maps.Geocoder;
 					return geocoder.geocode({ 'location': latlng }, function (result, status) {
 						if (status === google.maps.GeocoderStatus.OK) {
 							if (result[1]) {
 								self.place = result[1];
 								options = { place: self.place, inputId: self.inputId }
 								callback(options);

 							} else {
 								window.alert('No results found');
 							}
 						} else {
 							window.alert('Geocoder failed due to: ' + status)
 						}
 					});

 				}, function error(err) {
 					console.log('Error(' + err.code + '): ' + err.message); 
 				});
 			}
 		}
 	};

 	Autocomplete.init = function (options) {
 		var self = this;

 		self.inputId = options.inputId;
 		self.autocompleteOptions = options.autocompleteOptions || { types: ['geocode'] };

		self.validate();
		self.autocomplete = new google.maps.places.Autocomplete((document.getElementById(self.inputId)), self.autocompleteOptions);
		self.place;

 		// google.maps.event.addListener(self.autocomplete, 'place_changed', function(callback) {
 		self.autocomplete.addListener('place_changed', function() {
 			self.place = self.autocomplete.getPlace();
 			// console.log(self.autocomplete);
 			options.callback({ place: self.place, inputId: self.inputId });
 		});
 	};

 	// Make 'Autocomplete.init.prototype' point at 'Autocomplete.prototype'. 
 	// So, we don't have to use the 'new' keyword
    Autocomplete.init.prototype = Autocomplete.prototype;
    
    // Attach our 'Autocomplete' to the global object
    global.Autocomplete = Autocomplete;
    
 }(window, jQuery, google));

