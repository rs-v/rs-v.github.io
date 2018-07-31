var types = [];	
var type_counts = [];
var type_colors = [];
var type_names = [];
var current_type;
var counted_types;
var radarLat;
var radarLng;
var radarRad;
var showMarkers = false;
var placesDebug = true;
var earthRadius = 6371;

var placesMode;

var rad2deg = (180/Math.PI);
var deg2rad = (Math.PI/180);

var drillMax = 3; //note that this is exponential! 
var curThreads = 0;
var totalThreads = 0;

var placeMarkers = [];

var infowindow;

var placesInfoDIV;

function get_places(lat,lng,radius_m,markers,infoID) {
	infoWindow = new google.maps.InfoWindow();
	radarLat = lat;
	radarLng = lng;
	radarRad = radius_m;
	showMarkers = markers;
	placesInfoDIV = infoID;
	
	if(placeMarkers.length) {
		for(var i=0; i<placeMarkers.length;i++) {
			placeMarkers[i].setMap(null);
		}
		placeMarkers=[];
	}

	type_counts = [];
	types = [];

	types.push("hospital");
	type_names.push("hospitals/medical facilities");
	type_colors.push("#ff0000");

	types.push("fire_station");
	type_names.push("fire stations");
	type_colors.push("#ffae00");

	types.push("school");
	type_names.push("schools/educational facilities");
	type_colors.push("#98AFC7");

	//perhaps make this an array of the exact types to weed out the wrong ones?
	types.push("place_of_worship");
	type_names.push("places of worship");
	type_colors.push("#ffffff");

	var out = "";
	for(var i = 0; i<types.length;i++) {
		out+="<li style='color:"+type_colors[i]+"'><span style='color:#000;'>"+type_names[i]+": <span id='humtype_"+types[i]+"'>Calculating...</span></span></li>";					
		(function(iter) {
		setTimeout(function() {radarBounds(iter,radarLat,radarLng,radarRad/1000,0)},iter*1000);
		})(i);
	}
	out = "<hr><b>Humanitarian impact.</b> Within the 10 psi radius of this detonation there were also:<ul>" + out;
	out+="</ul><small>NOTE: These categorizations are done automatically by Google, not me. Sometimes they are bit off. The numbers may change over the course of a few minutes as more information is obtained from Google.</small>";
	if(document.getElementById(placesInfoDIV)) {
		document.getElementById(placesInfoDIV).innerHTML = out;
	}
}

function radarBounds(i,lat,lng,radius,drill) {
		curThreads++;
		totalThreads++;
		var ii = [i,drill];
		(function(iter) {
			maxLat = lat + (radius/earthRadius)*rad2deg;
			minLat = lat - (radius/earthRadius)*rad2deg;
  		    maxLng = lng + (radius/earthRadius/Math.cos((lat*deg2rad)))*rad2deg;
		    minLng = lng - (radius/earthRadius/Math.cos((lat*deg2rad)))*rad2deg;
		    
			var request = {
				//location: new google.maps.LatLng(radarLat,radarLng),
				bounds: new google.maps.LatLngBounds(new google.maps.LatLng(minLat,minLng),new google.maps.LatLng(maxLat,maxLng)),
				types: Array(types[iter[0]])
			};
			service.radarSearch(request, function (results, status) {
				curThreads--;
				if(status=="OK") {
					if(results.length<190) {
						var good_results = 0;	
						for(var x=0;x<results.length;x++) {
							var rlat = results[x].geometry.location.lat();
							var rlng = results[x].geometry.location.lng();
							//check if it is really within the radius of the circle	
							if(distance_between(radarLat,radarLng,rlat,rlng)*1000<= radarRad) {
								if(showMarkers)	createMarker(results[x],iter[0]);
								good_results++;
							}
						}
						if(type_counts[iter[0]]) {
							type_counts[iter[0]]+=good_results;
						} else {
							type_counts[iter[0]]=good_results;
						}
						document.getElementById("humtype_"+types[iter[0]]).innerHTML = addCommas(type_counts[iter[0]]);
					} else {
						var dlat = (radius/2/earthRadius)*(180/Math.PI);
						var dlng = (radius/2/earthRadius/Math.cos((lat*(Math.PI/180))))*(180/Math.PI);
						var drill = iter[1];
						drill++;
						if(drill<drillMax) {
							console.log("DRILLING DOWN for "+type_names[iter[0]]+", drill level "+drill);
							setTimeout(function () {radarBounds(iter[0],lat+dlat,lng+dlng,radius/2,drill)},1000);
							setTimeout(function () {radarBounds(iter[0],lat-dlat,lng+dlng,radius/2,drill)},2000);
							setTimeout(function () {radarBounds(iter[0],lat+dlat,lng-dlng,radius/2,drill)},3000);
							setTimeout(function () {radarBounds(iter[0],lat-dlat,lng-dlng,radius/2,drill)},4000);
						} else {
							if(type_counts[iter[0]]) {
								type_counts[iter[0]]+=results.length;
							} else {
								type_counts[iter[0]]=results.length;
							}
							document.getElementById("humtype_"+types[iter[0]]).innerHTML = "+"+addCommas(type_counts[iter[0]]);
							if(!document.getElementById("hummax")) {
								document.getElementById(placesInfoDIV).innerHTML = document.getElementById(placesInfoDIV).innerHTML + "<small id='hummax'>*There may be many more than we could display here, due to limits on Google Maps' API and our lack of desire to crash your browser.</small>";
							}
						}
					}
					//console.log(type_names[iter],status,results.length);
				} else if (status=="OVER_QUERY_LIMIT") {
					//wait 2 secs and try again
					setTimeout(function() { radarBounds(iter[0],lat,lng,radius,iter[1]),2000 } );
				}
			});
		})(ii);
}



/* OLD FUNCTIONS */

function radarSearch(type) {
	if(placesDebug) console.log("Searching for "+types[type]+" around "+radarLat+","+radarLng+" at a radius of "+(radarRad/1000)+" km");
	var request = {
		location: new google.maps.LatLng(radarLat,radarLng),
		radius: radarRad,
		types: Array(types[type])
	};
	if(placesMode) {
		service.nearbySearch(request,places_callback);
	} else {
		service.radarSearch(request, places_callback);
	}
}


function places_callback (results, status){
	if(status=="OK") {
		if(placesDebug) console.log("FOUND RESULTS FOR "+types[current_type],status);

		if(type_counts[current_type]) {
			type_counts[current_type]+=results.length;
		} else {
			type_counts[current_type]=results.length;
		}
		if(placesDebug) console.log("RESULTS! "+results.length);
		if(showMarkers) {
			for(var i=0;i<results.length;i++) {
				createMarker(results[i]);
			}
		}
	} else if(status=="ZERO_RESULTS"){
		if(!type_counts[current_type]) {
			type_counts[current_type] = '0';
			if(placesDebug) console.log("NO RESULTS FOR "+types[current_type]);
		}
	} else {
		if(placesDebug) console.log("OTHER: "+types[current_type],status);
	}
	current_type++
	if(document.getElementById(placesInfoDIV)) {
		document.getElementById(placesInfoDIV).innerHTML = "<hr>Fetching humanitarian impact information..."+Array(current_type+1).join(".");
	}

	var got200;

	if(current_type<types.length) {
		radarSearch(current_type);
	} else {
		var out ="";
		for(var x=0;x<types.length;x++) {
			if(type_counts[x]>0) {
				if(type_counts[x]>=190) got200 = true; //we use 190 b/c something Google Places rounds down in funny ways
				if(placesMode) {
					out+="<li> "+(type_counts[x]>=190?"+200*":type_counts[x])+" " + type_names[x]+"<br>";
				} else {
					out+="<li style='color:"+type_colors[x]+"'><span style='color:#000;'>"+(type_counts[x]>=190?"+200*":type_counts[x])+" " + type_names[x]+"</span></li>";					
				}
			}
		}
		if(out) {
			out = "<hr>This detonation also destroyed:<ul>" + out;
			out+="</ul>";
			if(got200) out+="<small>*The Google Maps API only allowed retrieval of up to 200 results in any given category; there may be many more.</small>";
			document.getElementById(placesInfoDIV).innerHTML = out;		
		}
	}
}

function outputTypes() {
	var out ="";
	for(var x=0;x<types.length;x++) {
		if(type_counts[x]>0) {
			if(type_counts[x]>=190) got200 = true; //we use 190 b/c something Google Places rounds down in funny ways
			if(placesMode) {
				out+="<li> "+(type_counts[x]>=190?"+200*":type_counts[x])+" " + type_names[x]+"<br>";
			} else {
				out+="<li style='color:"+type_colors[x]+"'><span style='color:#000;'>"+(type_counts[x]>=190?"+200*":type_counts[x])+" " + type_names[x]+"</span></li>";					
			}
		}
	}
	if(out) {
		out = "<hr>This detonation also destroyed:<ul>" + out;
		out+="</ul>";
		if(got200) out+="<small>*The Google Maps API only allowed retrieval of up to 200 results in any given category; there may be many more.</small>";
		document.getElementById(placesInfoDIV).innerHTML = out;		
	}
}

function createMarker(place,which) {
	if(placesMode) {
		placeMarkers.push(new google.maps.Marker({
			map: map,
			position: place.geometry.location,
			icon: {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
				},
			title: (place.name + " ("+type_names[which]+")"),
		}));
	} else {
		placeMarkers.push(new google.maps.Marker({
			map: map,
			position: place.geometry.location,
			icon: {
  			  path: google.maps.SymbolPath.CIRCLE,
			  scale: 4,
			  fillColor: type_colors[which],
			  fillOpacity: 1,
			  strokeColor: '#bd8d2c',
			  strokeWeight: 1
			},
			title: type_names[which],
		}));
	}
	var last = (placeMarkers.length-1);
	if(placesDebug) console.log(place);
	  google.maps.event.addListener(placeMarkers[last], 'click', function() {
		service.getDetails(place, function(result, status) {
		  if (status != google.maps.places.PlacesServiceStatus.OK) {
			alert(status);
			return;
		  }
		 console.log(result);
		  infoWindow.setContent(result.name+"<br>"+result.formatted_address);
		  infoWindow.open(map, placeMarkers[last]);
		});
	  });
}

if (typeof register == 'function') { register("places.js"); }