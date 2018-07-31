//useful conversions
var mi2km = 1.60934;
var mi2m = 1609.34;
var km2ft = 3280.84;
var m2ft = 3.28084;
var ft2m = 0.3048;
var ft2km = 0.0003048;
var ft2mi = 0.000189394;
var m2mi = 0.000621371;
var mi2ft = 5280;
var km2mi = 0.621371;
var rad2deg = 180/Math.PI;
var deg2rad = Math.PI/180;

function colorStep(step,max,theColorBegin,theColorEnd,overStep,overStep2x) {
	if(step>max) {
		if(step>=max*2) {
			if(overStep2x!=undefined) {
				return overStep2x;
			} else {
				return theColorEnd;
			}
		} else {
			if(overStep!=undefined) {
				return overStep;
			} else {
				return theColorEnd;
			}
		}
	} else if(step<=0) {
		return theColorBegin;
	} else {
		theColorBegin = parseInt(theColorBegin,16);
		theColorEnd = parseInt(theColorEnd,16);
		
		theR0 = (theColorBegin & 0xff0000) >> 16;
		theG0 = (theColorBegin & 0x00ff00) >> 8;
		theB0 = (theColorBegin & 0x0000ff) >> 0;
		theR1 = (theColorEnd & 0xff0000) >> 16;
		theG1 = (theColorEnd & 0x00ff00) >> 8;
		theB1 = (theColorEnd & 0x0000ff) >> 0;

		theR = interpolate(theR0, theR1, step, max); 
		theG = interpolate(theG0, theG1, step, max);
		theB = interpolate(theB0, theB1, step, max); 
		theVal = ((( theR << 8 ) |  theG ) << 8 ) | theB;
	    return (theVal.toString(16));
	}
}

// return the interpolated value between pBegin and pEnd
function interpolate(pBegin, pEnd, pStep, pMax) {
  if (pBegin < pEnd) {
    return ((pEnd - pBegin) * (pStep / pMax)) + pBegin;
  } else {
    return ((pBegin - pEnd) * (1 - (pStep / pMax))) + pEnd;
  }
}


function blend_colors(foreground,background,alpha) {
	var r1 = parseInt(foreground.substring(0,2),16);
	var g1 = parseInt(foreground.substring(2,4),16);
	var b1 = parseInt(foreground.substring(4,6),16);
	var r2 = parseInt(background.substring(0,2),16);
	var g2 = parseInt(background.substring(2,4),16);
	var b2 = parseInt(background.substring(4,6),16);

	var r3 = Math.round(alpha * r1 + (1 - alpha) * r2);
	var g3 = Math.round(alpha * g1 + (1 - alpha) * g2);
	var b3 = Math.round(alpha * b1 + (1 - alpha) * b2);

	if(r3>255) r3=255;
	if(g3>255) g3=255;
	if(b3>255) b3=255;

	var rr3 = r3.toString(16);
	var gg3 = g3.toString(16);
	var bb3 = b3.toString(16);
	
	if(rr3.length==1) rr3="0"+rr3;
	if(gg3.length==1) gg3="0"+gg3;
	if(bb3.length==1) bb3="0"+bb3;
		
	return rr3+gg3+bb3;
}

// 'improve' Math.round() to support a second argument
var _round = Math.round;
Math.round = function(number, decimals /* optional, default 0 */) {
  if (arguments.length == 1)
    return _round(number);
  var multiplier = Math.pow(10, decimals);
  return _round(number * multiplier) / multiplier;
}

function rgb(red, green, blue) {
    var decColor =0x1000000+ Math.round(blue) + 0x100 * Math.round(green) + 0x10000 *Math.round(red) ;
    return '#'+decColor.toString(16).substr(1);
}

function addCommas(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function isArray(theVar) {
	if(Object.prototype.toString.call( theVar ) === '[object Array]' ) {
		return true;
	} else {
		return false;
	}
}

function inArray(needle, haystack, convert) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
		if(convert==undefined) {
	        if(haystack[i] == needle) return true;
		} else {
			switch(convert) {
				case "string":
					if(String(haystack[i])==String(needle)) return true;
				break;
				case "float":
					if(parseFloat(haystack[i])==parseFloat(needle)) return true;
				break;
				case "int":
					if(parseInt(haystack[i])==parseInt(needle)) return true;
				break;
				default:
					if(haystack[i] == needle) return true;
				break;
			}
		} 
   }
    return false;
}

function arraysEqual(array1,array2) {
	if(!array1||!array2) return false;
	if(array1.length!=array2.length) return false;
    for (var i = 0; i < array1.length; i++) {
        // Check if we have nested arrays
        if (isArray(array1[i]) && isArray(array2[i])) {
            if(!arraysEqual(array1[i],array2[i])) return false;
        }
        else if (array1[i] != array2[i]) {
            return false;
        }
    }
    return true;
}

//parses URL vars for permalink variables -- works for arrays, too
//permalink parameters can be in any order but if they don't have indices explicitly listed, they MUST have kt be the parameter that separates each det
function getUrlVars(url) {
    var vars = [];
    var hash;
	if(!url) {
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
 	} else {
 		var hashes = url.split('&');
 	}
 	var last_indx;
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        if(hash[0]) {
			if((hash[0].indexOf("[")!==-1)&&(hash[0].indexOf("]")!==-1)) {
				var arr_name = hash[0].substring(0,hash[0].indexOf("["));
				var arr_indx = hash[0].substring(hash[0].indexOf("[")+1,hash[0].indexOf("]"));
				if(arr_indx=="") {
					if(arr_name=="kt") {
						if(last_indx!=undefined) {
							arr_indx = last_indx+1;
						} else {
							arr_indx = 0;
						}
					} else {
						arr_indx = last_indx;
					}
				} else {
					arr_indx = parseInt(arr_indx);
				}
				var arr = [];
				if(!vars[arr_name]) {
					//vars.push(arr_name);
					arr[arr_indx] = hash[1];
					vars[arr_name] = arr;
				} else {
					vars[arr_name][arr_indx] = hash[1];
				}
				last_indx = parseInt(arr_indx);
			} else {
				//vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}
		}
    }
    return vars;
}


function colorStep(step,max,theColorBegin,theColorEnd,overStep,overStep2x) {
	if(step>max) {
		if(step>=max*2) {
			if(overStep2x!=undefined) {
				return overStep2x;
			} else {
				return theColorEnd;
			}
		} else {
			if(overStep!=undefined) {
				return overStep;
			} else {
				return theColorEnd;
			}
		}
	} else if(step<=0) {
		return theColorBegin;
	} else {
		theColorBegin = parseInt(theColorBegin,16);
		theColorEnd = parseInt(theColorEnd,16);
		
		theR0 = (theColorBegin & 0xff0000) >> 16;
		theG0 = (theColorBegin & 0x00ff00) >> 8;
		theB0 = (theColorBegin & 0x0000ff) >> 0;
		theR1 = (theColorEnd & 0xff0000) >> 16;
		theG1 = (theColorEnd & 0x00ff00) >> 8;
		theB1 = (theColorEnd & 0x0000ff) >> 0;

		theR = interpolate(theR0, theR1, step, max); 
		theG = interpolate(theG0, theG1, step, max);
		theB = interpolate(theB0, theB1, step, max); 
		theVal = ((( theR << 8 ) |  theG ) << 8 ) | theB;
	    return (theVal.toString(16));
	}
}

// return the interpolated value between pBegin and pEnd
function interpolate(pBegin, pEnd, pStep, pMax) {
  if (pBegin < pEnd) {
    return ((pEnd - pBegin) * (pStep / pMax)) + pBegin;
  } else {
    return ((pBegin - pEnd) * (1 - (pStep / pMax))) + pEnd;
  }
}


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function isEmptyArray(arr) {
	if(!isArray(arr)) return false;
	if(arr.length!=1) return false;
	if(arr[0]=="") {
		return true;
	} else {
		return false;
	}
}

//verbose translation of kt depending on units
function ktOrMt(kt) {
	if(kt>=1000) {
		return kt/1000 + " megaton";
	} else if (kt<1) {
		return kt*1000 + " ton";
	} else {
		return kt + " kiloton";
	}
}

//simple linear interpolation -- returns x3 for a given y3
function lerp(x1,y1,x2,y2,y3) {
	return ((y2-y3) * x1 + (y3-y1) * x2)/(y2-y1);
}

//try to get country code of target, for stats -- easier to do on client end than later
function get_target_country(target_lat,target_lng) {
    targe_country = "-1"; //change to blank -- too expensive to do this on every det. can reprocess later.
    /*
	var latlng = new google.maps.LatLng(target_lat, target_lng);
	geocoder.geocode({'latLng': latlng}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				$(results[0]["address_components"]).each(function(index, value) {
					if(value["types"][0]=="country") target_country = value["short_name"];
				})
			}
		} else {
			if(status==google.maps.GeocoderStatus.ZERO_RESULTS) {
				target_country = "00"; //probably ocean
			}
		}
	})*/
}

//logging function -- if the target country isn't known, will try to look it up first. otherwise is a huge pain.
function log_det(data) {
	if(data.target_lat&&data.target_lng&&!data.target_country) {
		var target_country = "-1";
		var latlng = new google.maps.LatLng(data.target_lat, data.target_lng);
		data.target_country = target_country;
		log_det(data);
		//same as above
		/*
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					$(results[0]["address_components"]).each(function(index, value) {
						if(value["types"][0]=="country") target_country = value["short_name"];
					})
				} 
			} else {
				if(status==google.maps.GeocoderStatus.ZERO_RESULTS) {
					target_country = "00"; //probably ocean
				}
			}
			data.target_country = target_country;
			log_det(data);
		})*/
	} else {
		//console.log(data);
		$.ajax({
			type:"GET",
			url:"../nukemap_shared/stats.php",
			data: data,
			dataType: "jsonp",
			complete : function(){
       // console.log(this.url)
    }
		});
	}
}

function phys_unit(unit_val, unit_type) {
	var token = randomString();
	var output = "";
	switch(unit_type) {
		case "psi": var desc = "psi = pounds per square inch, a unit of pressure. Click to convert to kilopascals (kPa)."; break;
		case "kPa": var desc = "kPa = kilopascals, a unit of pressure. Click to convert to pounds per square inch (psi)."; break;
		case "rem": var desc = "rem = Roentgen equivalent man, a unit of equivalent radiation dose. Click to sieverts (Sv)."; break;
		case "Sv": var desc = "Sv = Sievert, a unit of equivalent radiation dose. Click to Roentgen equivalent man (rem)."; break;
		case "cal/cm&sup2;": var desc = "cal/cm^2 = calories per square centimeter, a unit of heat. Click to convert to Joules per square centimer."; break;
		case "J/cm&sup2;": var desc = "J/cm^2 = Joules per square centimeter, a unit of heat. Click to convert to calories per square centimeter."; break;	
	}
	output+="<span id='switch-unit-physical-"+token+"-label' class='switch-unit-physical-label'>"+addCommas(unit_val)+"</span> <a href='#' onclick=\"switchUnitsPhysical(); return false;\" class='switch-unit-physical-switcher' id='switch-unit-physical-"+token+"' baseUnit='"+unit_val+"' baseType='"+unit_type+"' unitType='"+unit_type+"' title='"+desc+"'>"+unit_type+"</a>";
	return output;
}
/*
function switchUnitsPhysical() {

	$(".switch-unit-switcher").each( function () {
		var baseUnit = $(this).attr("baseUnit");
		var baseType = $(this).attr("baseType");
		var unit_type = $(this).attr("unit_type");

		var val;
	
		switch(unit_type) {
			case "psi": val = Math.round(6.89475729*baseUnit,1); newUnit = "kPa"; break;
			case "kPa": val = baseUnit; newUnit = "psi"; break;
			case "rem": val = 0.01*baseUnit; newUnit = "Sv"; break;
			case "Sv": val = baseUnit; newUnit = "rem"; break;
			case "cal/cm&sup2;": val = Math.round(4.18400*baseUnit,1); newUnit = "J/cm&sup2;"; break;
			case "J/cm&sup2;": val = baseUnit; newUnit = "cal/cm&sup2;"; break;
		}

		switch(newUnit) {
			case "psi": var desc = "psi = pounds per square inch, a unit of pressure. Click to convert to kilopascals (kPa)."; break;
			case "kPa": var desc = "kPa = kilopascals, a unit of pressure. Click to convert to pounds per square inch (psi)."; break;
			case "rem": var desc = "rem = Roentgen equivalent man, a unit of equivalent radiation dose. Click to sieverts (Sv)."; break;
			case "Sv": var desc = "Sv = Sievert, a unit of equivalent radiation dose. Click to Roentgen equivalent man (rem)."; break;
			case "cal/cm&sup2;": var desc = "cal/cm^2 = calories per square centimeter, a unit of heat. Click to convert to Joules per square centimer."; break;
			case "J/cm&sup2;": var desc = "J/cm^2 = Joules per square centimeter, a unit of heat. Click to convert to calories per square centimeter."; break;	
		}
	
		var ouput ="<span id='switch-unit-physical-"+token+"-label' class='switch-unit-physical-label'>"+addCommas(unit_val)+"</span> <a href='#' onclick=\"switchUnitsPhysical(); return false;\" class='switch-unit-physical-switcher' id='switch-unit-physical-"+token+"' baseUnit='"+unit_val+"' baseType='"+unit_type+"' unitType='"+unit_type+"' title='"+desc+"'>"+unit_type+"</a>";
	
	}

}*/

var current_unit_physical = 0; //imperial = 0; SI = 1
var current_unit; //for distance

//takes km and makes a formatted link for easy unit conversion
function distance(radius_km,show_area,is_area,prefer_smaller) {
	if(current_unit) {
		var current = current_unit;
	} else {
		var current = "km";
	}

	var radius_mi = radius_km*km2mi;
	var radius_m = radius_km*1000;
	var radius_ft = radius_mi*mi2ft;
	var output = "";
	var token = randomString();

	if(is_area!==true) {
		if(current=="km") {
			if((Math.round(radius_km,0)==0)||prefer_smaller==true) {
				output+="<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_m,-1))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' km='"+radius_km+"'>m</a>";
			} else {
				output+="<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_km,decimals(radius_km)))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' km='"+radius_km+"'>km</a>";
			}
		 } else {
			if((Math.round(radius_mi,0)==0)||(prefer_smaller==true)) {
				output+="<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_ft,-1))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' km='"+radius_km+"'>ft</a>";
			} else {
				output+="<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_mi,decimals(radius_mi)))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' km='"+radius_km+"'>mi</a>";
			}
		 }

		if(show_area==true) {
			var token = randomString();
			if(current=="km") {
				if(Math.round(radius_km*radius_km*Math.PI,2)==0) {
					output+=" ("+"<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_m*radius_m*Math.PI,-1))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' area='true' km='"+radius_km*radius_km*Math.PI+"'>m</a>&sup2;)";
				} else {
					output+=" ("+"<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_km*radius_km*Math.PI,decimals(radius_km*radius_km*Math.PI)))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' area='true' km='"+radius_km*radius_km*Math.PI+"'>km</a>&sup2;)";
				}
			} else {
				if(Math.round(radius_mi*radius_mi*Math.PI,2)==0) {
					output+=" ("+"<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_ft*radius_ft*Math.PI,-1))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' area='true' km='"+radius_km*radius_km*Math.PI+"'>ft</a>&sup2;)";
				} else {
					output+=" ("+"<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_mi*radius_mi*Math.PI,decimals(radius_mi*radius_mi*Math.PI)))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' area='true' km='"+radius_km*radius_km*Math.PI+"'>mi</a>&sup2;)";
				}
		
			}
		}
	} else {
		radius_mi = radius_km * 0.386102;
		radius_ft = radius_km * 1.07639e7;
		if(current=="km") {
			if(Math.round(radius_km,0)==0) {
				output+="<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_m,-1))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' area='true' km='"+radius_km+"'>m</a>&sup2;";
			} else {
				output+="<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_km,decimals(radius_km)))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' area='true' km='"+radius_km+"'>km</a>&sup2;";
			}
		 } else {
			if(Math.round(radius_mi,0)==0) {
				output+="<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_ft,-1))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' area='true' km='"+radius_km+"'>ft</a>&sup2;";
			} else {
				output+="<span id='switch-unit-"+token+"-label' class='switch-unit-label'>"+addCommas(Math.round(radius_mi,decimals(radius_mi)))+"</span> <a href='#' title='Convert units' onclick=\"switchUnits(); return false;\" class='switch-unit-switcher' id='switch-unit-"+token+"' area='true' km='"+radius_km+"'>mi</a>&sup2;";
			}
		 }

	
	}
	
	return output;
}

//tries to make sensible decisions about how many decimals we round to
function decimals(number) {
	if(number>=1000) {
		return -1;
	} else if(number>=100) {
		return 0;
	} else if(number>=10) {
		return 1;
	} else {
		return 2;
	}
}

//just generates a short random string -- useful for making little javascript tokens
function randomString() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 5;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}


//converts feet to meters, miles, and kilometers automatically
function switchUnits() {
	if(!current_unit) {
		var current = $(".switch-unit-switcher").html();
	} else {
		var current = current_unit;
	}
	$(".switch-unit-switcher").each( function () {
		var km = $(this).attr("km");
		var area = $(this).attr("area");
		if(km!==undefined) {
			if(area==undefined) {
				switch(current) {
					case("ft"): case("mi"):
						if(Math.round(km,0)==0) {
							$("#"+$(this).attr("id")+"-label").html(addCommas(Math.round(km*1000,-1)));
							$(this).html("m");					
						} else {
							$("#"+$(this).attr("id")+"-label").html(addCommas(Math.round(km,2)));
							$(this).html("km");					
						}
					break;					
					case("km"): case("m"):
						if(Math.round(km*.621371,0)==0) {
							$("#"+$(this).attr("id")+"-label").html(addCommas(Math.round(km*3280.84,-1)));
							$(this).html("ft");					
						} else {
							$("#"+$(this).attr("id")+"-label").html(addCommas(Math.round(km*.621371,2)));
							$(this).html("mi");					
						}					
					break;
				}	
			} else if(area=="true") {
				switch(current) {
					case("ft"): case("mi"):
						if(Math.round(km,2)==0) {
							$("#"+$(this).attr("id")+"-label").html(addCommas(Math.round(km*1000,-1)));
							$(this).html("m");					
						} else {
							$("#"+$(this).attr("id")+"-label").html(addCommas(Math.round(km,2)));
							$(this).html("km");					
						}
					break;					
					case("km"): case("m"):
						if(Math.round(km*0.386102,2)==0) {
							$("#"+$(this).attr("id")+"-label").html(addCommas(Math.round(km*1.07639e7,-1)));
							$(this).html("ft");					
						} else {
							$("#"+$(this).attr("id")+"-label").html(addCommas(Math.round(km*0.386102,2)));
							$(this).html("mi");					
						}					
					break;
				}	

			}
		}
	})
	current_unit = (current=="mi"?"km":"mi");
}

if (typeof register == 'function') { register("shared.js"); }