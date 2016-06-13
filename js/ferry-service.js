/**
 * FerryService module
 *
 */

// Use ';' to clear any unfinished previous statement  
;(function (global, $) {
	'use strict';

    // 'new' an object
    var FerryService = function (options) {
        return new FerryService.init(options);
    };


    /**
     * private
     */

    /**
     * 'addressComponentTypes' contains type and its corresponding key, either 'short_name' or 'long_name'
     *
     * 'locality': 'long_name' is borough like "Manhattan" and "Queens"
     * 'sublocality_level_1': 'short_name', is city like "New York"
     * 'administrative_area_level_2' : 'long_name', is county like "Nassau County"
     * 'postal_code': 'short_name' is 5 digit zipcode such as '10001'
     */
    var addressComponentTypes = {
        locality: 'long_name',
        sublocality_level_1: 'short_name',  
        administrative_area_level_2: 'long_name',
        postal_code: 'short_name'
    };


    /**
     * haversineDistance returns the distance between pos1, pos2 by using Haversine formula
     *
     * @param options = {
     *   pos1 { lat: { Number }, lng: { Number } },
     *   pos2 { lat: { Number }, lng: { Number } },
     *   isMiles: Boolean
     * }
     * @return distace = { Number } 
     */

    var haversineDistance = function (pos1, pos2, isMiles) {
        var toRad = function (x) {
            return x * Math.PI / 180;
        }
        // R is earth's mean radius: 6371km 
        var R = 6371;
        var lngDiff = toRad(pos2.lng - pos1.lng);
        var latDiff = toRad(pos2.lat - pos1.lat);

        var a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) + 
            Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) * 
            Math.sin(lngDiff / 2) * Math.sin(lngDiff /2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var distance = R * c;

        if (isMiles) distance /= 1.60934;
        return distance;
    };


    /**
     * public
     */

    // prototype holds methods to save memory space
    FerryService.prototype = {
    	// 'this' refers to the calling object at execution time


        /**
          * getAccessibleStationsIds
          *
          * @param place = { Object } // 'place' refers to google maps place object
          * @return accessibleStations = [ Object ] // 'accessibleStations' refers to geographically accessible ferry station array
          */
        getAccessibleStationsIds: function (place) {
             // 'address' will contain the address components from 'place' by using 'addressComponentTypes'
             var address = {};
             for (var i = 0; i < place.address_components.length; i++) {
                 var componentType = place.address_components[i].types[0];
                 if (addressComponentTypes[componentType]) {
                     address[componentType] = place.address_components[i][addressComponentTypes[componentType]];
                 }
             }

             var accessibleStationIds;

             // When postal code is provided by google place object
             if (address.postal_code) {
                 var postalCode = address.postal_code;

                 // Check if place.address_components' 'postal_code' is in 'ferryStationGroups', 
                 // which contains speical geographic location postal codes to access only certain ferry stations
                 for (var station in this.postalCodeGroups) {
                     if (this.postalCodeGroups[station].indexOf(postalCode) !== -1) {
                         accessibleStationIds = this.ferryStationGroups[station]
                     }
                 }
             } 
             
             // If 'accessibleStationsIds' are not found in 'postalCodeGroups', 
             // then use 'sublocality_level_1', 'locality' or 'administrative_area_level_2'
             if (!accessibleStationIds) {
                 var city = ( address.sublocality_level_1 || address.locality || address.administrative_area_level_2).toLowerCase();
                 if (this.ferryStationGroups[city]) {
                     accessibleStationIds = this.ferryStationGroups[city];
                 }
             }

             // If 'accessibleStationsIds' are not found in both 'postalCodeGroups' and 'ferryStationGroups',
             // set 'accessibleStationIds' to an array of all ferry station IDs
             if (!accessibleStationIds) {
                 accessibleStationIds = this.ferryStationGroups.all;
             }

             return accessibleStationIds;
        },

    	/**
	     * findClosestStation
	     *
	     * @param place = { Object } // 'place' refers to google maps place object
	     * @return station = [ Object ] // 'stations' refers to ferry station object
	     */
    	findClosestStation: function (place) {
    		var accessibleStationIds = this.getAccessibleStationsIds(place);

    		// 'accessibleStations' refers an array of ferry station objects with the ids in 'accessibleStationIds' array
    		var accessibleStations = this.ferryStations.filter(function (station) {
    			return accessibleStationIds.indexOf(station.id) !== -1
    		});

    	    var pos = {
	            lat: place.geometry.location.lat(), 
	            lng: place.geometry.location.lng()
	        };

	        // All ferry station objects have 'lat' and 'lng' properties, 
	        // 'closestStation' will get the closest ferry station object from place object's geolocation 
	        var closestStation = accessibleStations.reduce(function (prev, curr) {
	        	return (haversineDistance(prev, pos) < haversineDistance(curr, pos)) ? prev : curr;
	        });

	        return closestStation;
    	},

        /*
         * findPath
         *
         * @param origin = { Object } // 'origin' refers to google maps place object
         * @param dest = { Object } // 'dest' refers to google maps place object
         * @return[ Object ] // return array contains the closest ferry station from origin and dest
        */ 
        findPath: function (origin, dest) {
            // originStation refers to the closest ferry station from origin
            var originStation = this.findClosestStation(origin);
            // destStation refers to the closest ferry station from dest
            var destStation = this.findClosestStation(dest);

            // If originStation is same as destStation, return false
            if (originStation.id === destStation.id) {
                return false;
            } else {
                return [originStation, destStation];
            }
            
        }
    };


    // The actual object is created here, allowing us to 'new' an object without calling 'new'
    FerryService.init = function (options) {
    	// 'option' parameter is configured like the following sample
    	// options = {
    	// 	ferryStations: [],
    	// 	ferryStationGroups: {}
    	// 	postalCodeGroups: {}
    	// }

    	var self = this;
    	self.ferryStations = options.ferryStations;
    	self.ferryStationGroups = options.ferryStationGroups;
    	self.postalCodeGroups = options.postalCodeGroups;
    };    


    // The 'new' keyword is not needed because it is used in FerryService constructor function
    FerryService.init.prototype = FerryService.prototype;
    
    // Attach 'FerryService' to the global object
    global.FerryService = FerryService;

}(window, jQuery));



