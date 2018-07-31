var windsock_marker;
var fallout_contours = [];
var fallout_points = [];
var fallout_drag_listener;
var marker_drag_listener;
var fallout_debug = false;

var old_marker_pos; 

var fallout_current;

//useful constants
var deg2rad = (Math.PI/180);
var rad2deg = (180/Math.PI);
var ft2mi = 0.000189394;
var mi2km = 1.60934;

var sqmi2sqkm = 2.58999;
var sqkm2sqmi = 0.386102;

//defaults
var rad_doses = [1,10,100,1000];
var fallout_angle_default = 225;

var fo = new fallout();

/* TO DO 

- make it so hovering over the legend highlights the current contour 

*/

function fallout() {

	if(fallout_debug) console.log("fallout object loaded");

	//Fallout parameters derived from Miller's Simplified Fallout Scaling System 
	this.SFSS_fallout_params = function(kt) {
		
		if(kt<1||kt>10*pow(10,5)) {
			return false;
		}

		var logW = log10(kt); //to avoid recalculation

		//alpha values (p.249-250)
		var alpha_2_3 = unlog10(-0.509+0.076*logW); 
		var alpha_4   = unlog10( 0.270+0.089*logW);
		var alpha_5   = unlog10(-0.176+0.022*logW);
		var alpha_5pr = unlog10(-0.054+0.095*logW);
		var alpha_6   = unlog10( 0.030+0.036*logW);
		var alpha_7   = unlog10( 0.043+0.141*logW);
		var alpha_8   = unlog10( 0.185+0.151*logW);
		if(kt<=28) {
		var alpha_9   = unlog10( 1.371-0.124*logW);
		} else {
		var alpha_9   = unlog10( 0.980+0.146*logW);	
		}

		//pre_reqs for X-distances (p.250)
		var a_s       = unlog10( 2.880+0.348*logW); 
		var a         = unlog10( 3.389+0.431*logW); 
		var b         = 1.40*pow(10,3)*pow(kt,0.431);
		if(kt<=28) {
		var h         = unlog10( 3.820+0.445*logW); 
		} else {
		var h         = unlog10( 4.226+0.164*logW); 
		}
		var a_R_s     = unlog10( 1.070+0.098*logW); 
		var R_s       = unlog10( 2.319+0.333*logW); 
		var a_o       = unlog10(log10(a)-(h*log10(a_R_s))/(h-R_s)); 

		var k_a       = 2.303*(log10(a_R_s)/(h-R_s));
		var z_s       = ( 2.303*(log10(a_s)-log10(a_o)))/k_a; //typo in the original!!

		if(kt>=9) {
		var z_o       = (1900+(alpha_2_3+0.020)*z_s)/alpha_2_3;
		} else {
		var z_o       = (h-b)
		}	
		
		//X-distances (p.251)
		if(kt<=28) {
		var X_1       =-unlog10( 3.308+0.496*logW); 
		var X_5       = unlog10( 3.644+0.467*logW); 
		var X_6       = unlog10( 3.850+0.481*logW); 
		var X_7       = unlog10( 3.862+0.586*logW); 
		var X_8       = unlog10( 4.005+0.596*logW); 
		var X_9       = unlog10( 5.190+0.319*logW); 
		} else {
		var X_1       =-unlog10( 3.564+0.319*logW); 
		var X_5       = unlog10( 4.049+0.186*logW); 
		var X_6       = unlog10( 4.255+0.200*logW); 
		var X_7       = unlog10( 4.268+0.305*logW);  
		var X_8       = unlog10( 4.410+0.315*logW); 
		var X_9       = unlog10( 5.202+0.311*logW); 
		}
		var Y_s       = unlog10( 3.233+0.400*logW); 
		
		//p. 250
		var X_2		  = alpha_2_3*z_s-a_s; 		
		var X_3       = alpha_2_3*z_s+a_s; 		
		var X_4       = (alpha_4*(alpha_4*z_o-1900))/(alpha_4+0.020); 

		//intensity ridges (p.251)
		if(kt<=28) {
		var k_1_2     = unlog10(-2.503-0.404*logW);
		} else {
		var k_1_2     = unlog10(-2.600-0.337*logW);
		}
		var I_2_3     = unlog10(k_1_2*(X_2-X_1)/2.303); 
	
		if(kt<=28) {
			a_h 	  = unlog10(-0.431-0.014*logW);
		} else {
			a_h 	  = unlog10(-0.837+0.267*logW);	
		}	
		var a_b_2	  = unlog10( 0.486+0.262*logW);

		var phi_5	= ((alpha_5+a_h)+Math.sqrt(a_b_2+pow(alpha_5+a_h,2)))/((alpha_5-a_h)+Math.sqrt(a_b_2+pow(alpha_5-a_h,2)));
		var phi_6   = ((alpha_6+a_h)+Math.sqrt(a_b_2+pow(alpha_6+a_h,2)))/((alpha_6-a_h)+Math.sqrt(a_b_2+pow(alpha_6-a_h,2)));
		var phi_7   = ((alpha_7+a_h)+Math.sqrt(a_b_2+pow(alpha_7+a_h,2)))/((alpha_7-a_h)+Math.sqrt(a_b_2+pow(alpha_7-a_h,2)));
		var phi_8   = ((alpha_8+a_h)+Math.sqrt(a_b_2+pow(alpha_8+a_h,2)))/((alpha_8-a_h)+Math.sqrt(a_b_2+pow(alpha_8-a_h,2)));
		var phi_9   = ((alpha_9+a_h)+Math.sqrt(a_b_2+pow(alpha_9+a_h,2)))/((alpha_9-a_h)+Math.sqrt(a_b_2+pow(alpha_9-a_h,2)));

		var phi_5pr = ((alpha_5+a_h)+Math.sqrt(a_b_2+pow(alpha_5+a_h,2)))/(alpha_2_3+Math.sqrt(a_b_2+pow(alpha_2_3,2)));
		var phi_6pr = ((alpha_6+a_h)+Math.sqrt(a_b_2+pow(alpha_6+a_h,2)))/(alpha_2_3+Math.sqrt(a_b_2+pow(alpha_2_3,2)));
		var phi_7pr = ((alpha_7+a_h)+Math.sqrt(a_b_2+pow(alpha_7+a_h,2)))/(alpha_2_3+Math.sqrt(a_b_2+pow(alpha_2_3,2)));
		var phi_8pr = ((alpha_8+a_h)+Math.sqrt(a_b_2+pow(alpha_8+a_h,2)))/(alpha_2_3+Math.sqrt(a_b_2+pow(alpha_2_3,2)));
		var phi_9pr = ((alpha_9+a_h)+Math.sqrt(a_b_2+pow(alpha_9+a_h,2)))/(alpha_2_3+Math.sqrt(a_b_2+pow(alpha_2_3,2)));

		if(kt<=28) {
		var K_5_A_alpha 	= unlog10(-3.286-0.298*logW);
		} else {
		var K_5_A_alpha 	= unlog10(-2.889-0.572*logW);	
		}
		var K_6_A_alpha 	= unlog10(-1.134-0.074*logW);
		var K_7_A_alpha 	= unlog10(-0.989-0.037*logW);
		var K_9_A_alpha 	= unlog10(-2.166-0.552*logW);

		var K_5pr_A_alpha	= unlog10(-3.185-0.406*logW);	
		var K_6pr_A_alpha	= unlog10(-1.225-0.022*logW);	
		var K_7pr_A_alpha	= unlog10(-1.079-0.020*logW);	
		var K_9pr_A_alpha	= unlog10(-2.166-0.552*logW);	
	
		var I_1 = 1; //set at 1 r/hr
		var I_4 = 1; //set at 1 r/hr
		if(alpha_5 >= a_h) {
			var I_5   = 4.606*a*K_5_A_alpha*log10(phi_5);
		} else {
			var I_5   = 4.606*a*K_5pr_A_alpha*log10(phi_5pr);
		}
		if(alpha_6 >= a_h) {
			var I_6   = 4.606*a*K_6_A_alpha*log10(phi_6);
		} else {
			var I_6   = 4.606*a*K_6pr_A_alpha*log10(phi_6pr);
		}
		if(alpha_7 >= a_h) {
			var I_7   = 4.606*a*K_7_A_alpha*log10(phi_7);
		} else {
			var I_7   = 4.606*a*K_7pr_A_alpha*log10(phi_7pr);
		}
		// there is no I_8
		if(alpha_9 >= a_h) {
			var I_9   = 4.606*a*K_9_A_alpha*log10(phi_9);
		} else {
			var I_9   = 4.606*a*K_9pr_A_alpha*log10(phi_9pr);
		}
	
		//Y_8 is from a table with interpolation for other values
		//Each index here is a log10 of a yield (0 = 1KT, 1 = 10KT, 2 = 100KT, etc.)
		var Y_8_vals = [6620,12200,48200,167000,342000,650000];
		if(logW==Math.round(logW)||kt==1000) { //the log10 function botches 
			var Y_8 = Y_8_vals[Math.round(logW)];		
		} else {
			var Y_8_1 = Y_8_vals[Math.floor(logW)];
			var Y_8_2 = Y_8_vals[Math.ceil(logW)];
			var Y_8 = Y_8_1 + (Y_8_2-Y_8_1) * (unlog10(logW)/unlog10(Math.ceil(logW)));
		}
		//alternative method that just curve fits
		//var Y_8 = Math.exp(((((9.968481E-4)*Math.log(kt)-.027025999)*Math.log(kt)+.22433052)*Math.log(kt)-.12350012)*Math.log(kt)+8.7992249);
	
		return {
				x1:X_1,
				x2:X_2,
				x3:X_3,
				x4:X_4,
				x5:X_5,
				x6:X_6,
				x7:X_7,
				x8:X_8,
				x9:X_9,
				ys:Y_s,
				y8:Y_8,
				i1:I_1,
				i2:I_2_3,
				i3:I_2_3,
				i4:I_4,
				i5:I_5,
				i6:I_6,
				i7:I_7,
				i9:I_9,
				zo:z_o
		};	
	}

	//returns in miles -- one might wonder why we separate this from the points function. It is so you can access this data (say, for the legend) without complete recalculation of all of the information.
	
	//rad_doses is an array of radiation doses in rads/hr to computer
	
	//fission fraction is a number less than or equal to 1 (100%) and greater than zero
	this.SFSS_fallout = function(kt,rad_doses,fission_fraction,windspeed) {

		var x_var = 0;
		var y_var = 1;
		var i_var = 2;
		var p = this.SFSS_fallout_params(kt);

		if(!fission_fraction) fission_fraction = 1;

		if(fallout_debug) console.log(p);
	
		var dose_data = [];
				
		for(var i=0;i<rad_doses.length;i++) {
			if(fission_fraction < 1) {
				var rad = rad_doses[i] * (1/fission_fraction); //fission fraction decreases the overall radiation linearly, so we search for the distances of higher values.
			} else {
				var rad = rad_doses[i];
			}
			
			//create the dose_data object -- all input distances in feet, all output in miles
			var d = {
				
				r: rad_doses[i],
				
				draw_stem: 
					rad<=p.i2?true:false //quick test to see if we are above the stem threshhold anyway
				,
				
				draw_cloud:
					rad<=p.i7?true:false //ditto for cloud -- numbers above these values produce nonsense results
				,
																
				max_cloud_rad: 
					p.i7 / (1/fission_fraction) //this allows us to report what the maximum mappable radiation level is for this yield -- note we take into account fission fraction here
				,

				max_stem_rad:
					p.i2 / (1/fission_fraction) //ditto
				,
			
				x_center: p.x2*ft2mi,

				upwind_stem_distance: ((
					log_lerp(p.x1,p.i1,p.x2,p.i2,rad)
				)*ft2mi),

				downwind_stem_distance: (( 
					log_lerp(p.x3,p.i3,p.x4,p.i4,rad)
				)*ft2mi),
				
				max_stem_width: ((
					log_lerp(0,p.i2,p.ys,1,rad) 
				)*ft2mi),

				upwind_cloud_distance: ((
					rad>p.i6 ?
					log_lerp(p.x6,p.i6,p.x7,p.i7,rad):
					log_lerp(p.x5,p.i5,p.x6,p.i6,rad)
				)*ft2mi),

				downwind_cloud_distance: ((
					log_lerp(p.x7,p.i7,p.x9,p.i9,rad)
				)*ft2mi),
			
				max_cloud_width: ((
					(
					(p.y8*log10(p.i7/rad))
					/
					(log10(p.i7/p.i9))
					)
					//*.8 //correction to match drawings, but values are correct
				)*ft2mi),
								
				cloud_widen_point: ((
					p.x7+(p.x8-p.x7)*(
					(
					(p.y8*log10(p.i7/rad))
					/
					(log10(p.i7/p.i9))
					)	
					 /p.y8)
				)*ft2mi)
			};

			//adjust for wind speed, uses Glasstone 1977's relation to change downwind values
			if(windspeed>15) {
				var wm = (1+((windspeed-15)/60));		
			} else if(windspeed<15) {
				var wm = (1+((windspeed-15)/30));
			}
			if(wm) {
				d.downwind_cloud_distance*=wm;
				d.downwind_stem_distance*=wm;
			}

			//estimate of the area enclosed -- sq mi
			if(d.draw_stem) {
				d.stem_area = (
					//stem - ellipse estimate -- this is OK
					(
					Math.PI * ((d.downwind_stem_distance-d.upwind_stem_distance)/2) * (d.x_center-d.upwind_stem_distance) 
					)
					);
			} else {
				d.stem_area = 0;
			}
			if(d.draw_cloud) {			
				d.cloud_area = (
					//cloud ellipse 1			
					(				
					Math.PI * (d.downwind_cloud_distance) * (d.max_cloud_width) 
					) /2
	
					//cloud ellipse 2
					+				
					(				
					Math.PI * d.downwind_cloud_distance-((d.cloud_widen_point)/2-(d.upwind_cloud_distance)/2) * (d.max_cloud_width) 		
					) /2
				);
			} else {
				d.cloud_area = 0;
			}
								
			dose_data[rad_doses[i]] = d;
		}

		if(fallout_debug) console.log(dose_data);
		return dose_data;
	}
	
	//f is a single dose_data object returned by the above function
	this.SFSS_fallout_points = function(f,angle,steps) {
		var p = [];
						
		if(fallout_debug) console.log(f);

		var stem_circle_radius = (f.x_center-f.upwind_stem_distance);
		var stem_inner_x = Math.sin(80*deg2rad)*stem_circle_radius;

		if(f.draw_stem) {
			//stem top		
			draw_arc(p,	f.upwind_stem_distance,0,	f.x_center,stem_circle_radius,	steps/2);
			draw_arc(p,	f.x_center,stem_circle_radius,	stem_inner_x, f.max_stem_width, steps/2);		

			//test if the stem and the cloud join
			if(((f.upwind_cloud_distance+f.x_center)<f.downwind_stem_distance)&&f.draw_cloud) {
				var pp = [];
				draw_arc(pp, f.upwind_cloud_distance+f.x_center,0, f.cloud_widen_point+f.x_center, f.max_cloud_width,steps);
				pp = trim_points(pp,1,f.max_stem_width,"<");
				add_points(p,pp);
			} else {
				p.push([f.downwind_stem_distance*.8,f.max_stem_width]);
				p.push([f.downwind_stem_distance,0]);
				if(f.draw_cloud) draw_arc(p, f.upwind_cloud_distance+f.x_center,0, f.cloud_widen_point+f.x_center, f.max_cloud_width,steps);
			}
		} else {
			if(f.draw_cloud) draw_arc(p, f.upwind_cloud_distance+f.x_center,0, f.cloud_widen_point+f.x_center, f.max_cloud_width,steps);
		}

		if(f.draw_cloud) {
			//cloud
			draw_arc(p, f.cloud_widen_point+f.x_center, f.max_cloud_width,	f.downwind_cloud_distance-f.x_center*2, 0, steps);
			draw_arc(p,	f.downwind_cloud_distance-f.x_center*2, 0, f.cloud_widen_point+f.x_center, -f.max_cloud_width, steps);
		}

		if(f.draw_stem) {
			//stem bottom
			if(((f.upwind_cloud_distance+f.x_center)<f.downwind_stem_distance)&&f.draw_cloud) {
				var pp = [];
				draw_arc(pp, f.cloud_widen_point+f.x_center, -f.max_cloud_width, f.upwind_cloud_distance+f.x_center,0, steps);	
				pp = trim_points(pp,1,-f.max_stem_width,">");
				add_points(p,pp);
			} else {
				if(f.draw_cloud) draw_arc(p, f.cloud_widen_point+f.x_center, -f.max_cloud_width, f.upwind_cloud_distance+f.x_center,0, steps);
				p.push([f.downwind_stem_distance,0]);				
				p.push([f.downwind_stem_distance*.8,-f.max_stem_width]);
			}
			draw_arc(p,	stem_inner_x, -f.max_stem_width, f.x_center,-stem_circle_radius, steps/2);
			draw_arc(p,	f.x_center,-stem_circle_radius,	f.upwind_stem_distance,0, steps/2);
		} else {
			if(f.draw_cloud) draw_arc(p, f.cloud_widen_point+f.x_center, -f.max_cloud_width, f.upwind_cloud_distance+f.x_center,0, steps);		
		}
				
		rotate_points(p,angle);
		
		return p;

	}

	//draws a partial arc joining points x1,y1 and x2,y2 centered at xc,yc
	function draw_arc(p,x1,y1,x2,y2,steps) {
		if(x1<x2) {
			if(y1<y2) {
				//top left
				var xc = x2;
				var yc = y1;
			} else {
				//top right
				var xc = x1;
				var yc = y2;
			}
		} else {
			if(y1<y2) {
				//bottom left
				var xc = x1;
				var yc = y2;
			} else {
				//bottom right				
				var xc = x2;
				var yc = y1;				
			}
		}
		
		var e_width = Math.abs(xc==x1?xc-x2:xc-x1);
		var e_height = Math.abs(yc==y1?yc-y2:yc-y1);
		
		var start_angle = Math.atan2(y1-yc,x1-xc);
		var stop_angle = Math.atan2(y2-yc,x2-xc);

		if(start_angle<0) start_angle+=Math.PI*2;

		var step = (stop_angle-start_angle)/steps;
	
		if(step<0) {			
			for(var theta=start_angle; theta > stop_angle; theta+=step) { 
				var x = xc + e_width*Math.cos(theta);
				var y = yc + e_height*Math.sin(theta);    
				p.push([x,y]);
			}
		} else {
			for(var theta=start_angle; theta < stop_angle; theta+=step) { 
				var x = xc + e_width*Math.cos(theta);
				var y = yc + e_height*Math.sin(theta);    
				p.push([x,y]);
			}
		}
		p.push([x2,y2]);		
	}
	
	//trims points based on criteria
	//input is an array of points (p), a lat/lng flag (0 = lat, 1 = lng), a value to compare to (compare), and a comparison mode (string)
	function trim_points(p,latlng,compare,mode) {
		var pp = [];
		for(var i = 0; i<p.length;i++) {
			var bad = false;
			switch(mode) {
				case "<" : var bad = p[i][latlng]<compare; break;
				case "<=": var bad = p[i][latlng]<=compare; break;
				case ">" : var bad = p[i][latlng]>compare; break;
				case ">=": var bad = p[i][latlng]>=compare; break;
				case "==": var bad = p[i][latlng]==compare; break;
				case "!=": var bad = p[i][latlng]!=compare; break;
			}
			if(!bad) pp.push(p[i]);
		}
		return pp;
	}

	//adds points arrays from pp to p
	function add_points(p,pp) {
		for(var i=0; i<pp.length;i++) {
			p.push(pp[i]);
		}
	}
	
	
}

function plot_fallout(gz, points,color,legend) {
	var R = 6371; //Earth's mean radius in km
	var coords = [];
	if(color.substring(0,1)!="#") color="#"+color;
	for(var i=0;i<points.length;i++) {

		var lat = gz.lat()+rad2deg*(points[i][1]*mi2km/R);
		var lng = gz.lng()+rad2deg*(points[i][0]*mi2km/R/Math.cos(deg2rad*(gz.lat())));

		coords.push(new google.maps.LatLng(lat,lng));

		if(fallout_debug) {
			fallout_points.push(new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(lat,lng),
				icon: {
				  path: google.maps.SymbolPath.CIRCLE,
				  scale: 3,
				  fillColor: color,
				  fillOpacity: 1,
				  strokeColor: '#bd8d2c',
				  strokeWeight: 2,
				},
				title: legend + " - "+ i +":("+Math.round(points[i][0],2)+","+Math.round(points[i][1],2)+")",

			}));
		}
	}
	
	if(!fallout_contours[det_index]) fallout_contours[det_index] = [];
	if(fallout_contours[det_index]) {
		var zoff = fallout_contours[det_index].length+1;
	} else {
		var zoff = 1;
	}
	fallout_contours[det_index].push(new google.maps.Polygon({
		paths: coords,
		strokeColor: color,
		strokeOpacity: 1,
		strokeWeight: 0,
		fillColor: color,
		fillOpacity: .25,
		map: map,
		visible: true,
		zIndex: -10*(-det_index+1)+zoff,
	}));
	
}

function plot_fallout_GE(gz_lat,gz_lng,alt,points,color,legend) {
	var R = 6371; //Earth's mean radius in km

	//kml colors are aabbggrr
	var kmlcolor = color.substring(4,6) + color.substring(2,4) + color.substring(0,2);

	var polygonPlacemark = ge.createPlacemark('');

	var polygon = ge.createPolygon('');
	polygon.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);
	polygon.setExtrude(false);
	polygon.setTessellate(true);
	polygonPlacemark.setGeometry(polygon);

	var outer = ge.createLinearRing('');
	outer.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);
	outer.setExtrude(false);
	outer.setTessellate(true);

	for(var i=0;i<points.length;i++) {

		var lat = gz_lat+rad2deg*(points[i][1]*mi2km/R);
		var lng = gz_lng+rad2deg*(points[i][0]*mi2km/R/Math.cos(deg2rad*(gz_lat)));

		outer.getCoordinates().pushLatLngAlt(lat,lng,alt);

	}

	polygon.setOuterBoundary(outer);

	polygonPlacemark.setStyleSelector(ge.createStyle(''));

    var polyStyle = polygonPlacemark.getStyleSelector().getPolyStyle();
    polyStyle.getColor().set("50"+kmlcolor);
    polyStyle.setFill(1);
    polyStyle.setOutline(1);

	var lineStyle = polygonPlacemark.getStyleSelector().getLineStyle();
	lineStyle.setWidth(2);
	
	
	lineStyle.getColor().set("90"+kmlcolor);

	google.earth.addEventListener(polygonPlacemark, 'click', function(event) {
	  // Prevent the default balloon from appearing.
	  event.preventDefault();
	});

	return polygonPlacemark;

}

function do_fallout(kt, wind, fission_fraction, angle, fallout_info_div_id, airburst,hob_ft) {
		if(fallout_debug) console.log("do_fallout");
		clear_fallout(); 

		if(kt<1||kt>10*pow(10,5)) {
			if(fallout_info_div_id!==undefined) {
				if(document.getElementById(fallout_info_div_id)) {
					document.getElementById(fallout_info_div_id).innerHTML = "<hr><b>The fallout model only works for yields between 1 and 100,000 kilotons.</b>";
				}
			}
			return false;
		}
		
		if(!windsock_marker) { //create the wind marker
			new_windsock(angle);
		} else if(angle) {
            windsock_distance = distance_between(marker.getPosition().lat(),marker.getPosition().lng(),windsock_marker.getPosition().lat(),windsock_marker.getPosition().lng());
            var wpos = destination_from_bearing(marker.getPosition().lat(),marker.getPosition().lng(),parseInt(angle)+180,windsock_distance);
            windsock_marker.setPosition(new google.maps.LatLng(wpos[0],wpos[1]));
        }
		if(!angle) angle = fallout_bearing(marker.getPosition(),windsock_marker.getPosition());
		if(!angle) angle=0;

		if(hob_ft) {
			var kt_frac = fallout_kt_hob(kt,fission_fraction,hob_ft);		
		} else {
			var kt_frac = 0;
		}

		fallout_current = {
			kt: kt,
			wind: wind,
			fission_fraction: fission_fraction,
			fallout_info_div_id: fallout_info_div_id,
			rad_doses: rad_doses,
			angle: angle,
			airburst: airburst,
			hob_ft: hob_ft,
			kt_frac: kt_frac,
		}
		draw_fallout();
	
}

//Google Earth fallout init function
function do_fallout_GE(kt, fallout_wind, fallout_fission, fallout_angle, fallout_info_div_id, airburst) {
		if(fallout_debug) console.log("do_fallout_GE");
		clear_fallout(); //clear any previous contours 

		if(kt<1||kt>10*pow(10,5)) {
			if(fallout_info_div_id!==undefined) {
				if(document.getElementById(fallout_info_div_id)) {
					document.getElementById(fallout_info_div_id).innerHTML = "<hr><b>The fallout model only works for yields between 1 and 100,000 kilotons, sorry.</b>";
				}
			}
			return false;
		}
		
		
		var wind = fallout_wind;
		if(wind<0) { //bind the wind speed to respectable options
			wind = 0;
		} else if(wind>50) { 
			wind = 50;
		}
		
		var fission_fraction = fallout_fission;
		if(fission_fraction<=0) {
			fission_fraction = 1;
		} else if (fission_fraction>100) {
			fission_fraction = 100;
		}
	
		if(fallout_angle) {
			var angle = parseInt(fallout_angle);
		} else {
			var angle = fallout_angle_default;
		}
		angle-=90;
		angle*=-1; //I don't know why this is coming out weird, but it is.

		fallout_current = {
			kt: kt,
			wind: wind,
			fission_fraction: fission_fraction,
			fallout_info_div_id: fallout_info_div_id,
			rad_doses: rad_doses,
			angle: angle,
			airburst: airburst
		}
		
		
		draw_fallout_GE();
	
}

//draws fallout using the current settings. we keep these separate from the other function so I can just call it whenever I want to refresh it.
function draw_fallout() {
	if(fallout_debug) console.log('draw_fallout');
	if(fallout_current) {
	
		clear_fallout();
		
		if(fallout_current.fallout_info_div_id) {
			var fallout_info = document.getElementById(fallout_current.fallout_info_div_id);
		}
	
		if(fallout_current.airburst&&fallout_current.kt_frac==0) {

			if(fallout_info) {
				var o= ""
				o+="<hr>";
				o+="<p><b>Fallout:</b> Your choice of burst height is too high to produce significant local fallout. The minimum burst height to produce appreciable fallout for a yield of "+ktOrMt(fallout_current.kt)+" is "+distance(180*Math.pow(fallout_current.kt,.4)*ft2km)+".";
				fallout_info.innerHTML = o;
			}
		} else {
		
			if(windsock_marker) {
				windsock_distance = distance_between(marker.getPosition().lat(),marker.getPosition().lng(),windsock_marker.getPosition().lat(),windsock_marker.getPosition().lng());
				var wpos = destination_from_bearing(marker.getPosition().lat(),marker.getPosition().lng(),parseInt(fallout_current.angle)+180,windsock_distance);
				windsock_marker.setPosition(new google.maps.LatLng(wpos[0],wpos[1])); 
}
			
			var pos = marker.getPosition();
		
			if(fallout_current.kt_frac&&fallout_current.airburst) {
				var sfss = fo.SFSS_fallout(fallout_current.kt_frac,fallout_current.rad_doses,(fallout_current.fission_fraction/100),fallout_current.wind);
			} else {
				var sfss = fo.SFSS_fallout(fallout_current.kt,fallout_current.rad_doses,(fallout_current.fission_fraction/100),fallout_current.wind);
			}
		
			if(fallout_info) {
				var o = "";
				o+="<hr><div>";
				o+= "Estimated total-dose <b>fallout contours</b> for a "+ktOrMt(fallout_current.kt);
				if(fallout_current.airburst&&fallout_current.kt_frac) {
					o+=" airburst*";
				} else {
					o+=" surface burst";
				}
				if(fallout_current.fission_fraction<100) {
					o+=" ("+(fallout_current.fission_fraction>1?Math.round(fallout_current.fission_fraction):fallout_current.fission_fraction)+"% fission)";
				}
				o+=" with a "+fallout_current.wind+" mph wind:";

				o+= "<span class='hider-arrow' expanded='1'> &#9660;</span>"
				o+= "<div id='collapsed-content'>";

			}
		
			if(fallout_debug) console.log(sfss);
		
			var steps = 15;

			dets[det_index].fallout_angle = Math.round(fallout_current.angle);
			dets[det_index].fallout_rad_doses = fallout_current.rad_doses;
		
			for(var i = 0; i<fallout_current.rad_doses.length; i++) {
				var f_color = colorStep(log10(rad_doses[i]),log10(1000),"FFFF00","FF0000","010000","010000");
	
				var ss = sfss[fallout_current.rad_doses[i]];

				plot_fallout(pos,fo.SFSS_fallout_points(ss,fallout_current.angle,steps),f_color,fallout_current.rad_doses[i]+" r/hr");

				if(fallout_info) {
					o+= "<p><div class='legendkey falloutlegendkey' style='background-color: #"+blend_colors(blend_colors("000000",background_color,.25),f_color,.25)+"; border: 1px solid #ff5d2e;'></div> Fallout contour for <b>"+addCommas(fallout_current.rad_doses[i])+"</b> rads per hour: ";
					o+= "<br><ul>";
				
					if(ss.draw_cloud||ss.draw_stem) {
						if(!ss.draw_cloud&&ss.draw_stem) {
							o+= "<li>Maximum downwind cloud (stem only) distance: "+distance(ss.downwind_stem_distance*mi2km,false);
							o+= "<li>Maximum stem width: "+distance(ss.max_stem_width*2*mi2km,false);
							o+= "<li>Approximate area affected: "+distance(ss.stem_area*sqmi2sqkm,false,true);
							o+= "<li>The selected radiation level is too high for cloud fallout at this yield, and so this contour is not mapped. Maximum radiation contour for cloud fallout that can be mapped for this yield is "+addCommas(Math.round(ss.max_cloud_rad))+" r/hr.";
						} else if (ss.draw_cloud&&!ss.draw_stem) {
							o+= "<li>Maximum downwind cloud distance: "+distance(ss.downwind_cloud_distance*mi2km,false);
							o+= "<li>Maximum width: "+distance(ss.max_cloud_width*2*mi2km,false);
							o+= "<li>Approximate area affected: "+distance(ss.stem_area+ss.cloud_area*sqmi2sqkm,false,true);
							o+= "<li>The selected radiation level is too high for stem fallout at this yield, and so this contour is not mapped. Maximum radiation contour for stem fallout that can be mapped for this yield is "+addCommas(Math.round(ss.max_stem_rad))+" r/hr.";
						} else {
							o+= "<li>Maximum downwind cloud distance: "+distance(ss.downwind_cloud_distance*mi2km,false);
							o+= "<li>Maximum width: "+distance(ss.max_cloud_width*2*mi2km,false);
							o+= "<li>Approximate area affected: "+distance(ss.stem_area+ss.cloud_area*sqmi2sqkm,false,true);
						}
					} else {
						o+= "<li>The selected radiation level is too high for fallout at this yield, and so this contour is not mapped. Maximum radiation contour for cloud fallout that can be mapped for this yield is "+addCommas(Math.round(ss.max_cloud_rad))+" r/hr; for stem fallout it is "+addCommas(Math.round(ss.max_stem_rad))+" r/hr.";					
					}	
					o+= "</ul>";
				}
			}	
		
			if(fallout_info) {		
				if(det_index>0) {
					var fallouts = 0;
					for(var i=0;i<=det_index;i++) {
						if(fallout_contours[i]) {
							if(fallout_contours[i].length) fallouts++;
						}
					}
					if(fallouts>1) o+="<small>You have multiple fallout contours plotted. The above information is valid only for the active contour.</small><br>";
				}
				if(fallout_current.kt_frac&&fallout_current.airburst) {
					o+="<small>*At a burst height of "+distance(fallout_current.hob_ft*ft2km)+", the fallout is equivalent to a "+ktOrMt(Math.round(fallout_current.kt_frac))+" surface burst with the same fission fraction.</small><br>";
				}
				if(windsock_marker) {
					o+= "<small id='fallout_windsock'>Fallout windsock is "+distance(distance_between(marker.getPosition().lat(),marker.getPosition().lng(),windsock_marker.getPosition().lat(),windsock_marker.getPosition().lng()), false)+" from ground zero. <a href='#' onclick='hide_windsock(); return false;' id='hide_windsock'>Click here to hide the windsock.</a></small><br>";
				} else {
					o+= "<small id='fallout_windsock'><a href='#' onclick='hide_windsock(); return false;' id='hide_windsock'>Click here to show the windsock.</a></small><br>";			
				}
				o+="<small>To change the radiation doses to map, <a href='#' onclick='change_doses();return false;'>click here</a>.</small><br>";

				o+= "<small>For more information on the fallout model and its interpretation, <a href=\"faq\#fallout\" target=\"_blank\">click here</a>.</small>";
				o+="</div></div>";
				fallout_info.innerHTML = o;			
			}

			old_marker_pos = pos;
		}
	}
}

//Google Earth drawing function
function draw_fallout_GE() {
	if(fallout_debug) console.log('draw_fallout_GE');
	if(fallout_current) {
	
		clear_fallout_GE();

		if(placemark) {
			var pos = placemark.getGeometry();
			var lat = pos.getLatitude;
			var lng = pos.getLongitude;
		} else {
			var lat = det_lat[det_index];
			var lng = det_lng[det_index];
		}
		
		var sfss = fo.SFSS_fallout(fallout_current.kt,fallout_current.rad_doses,(fallout_current.fission_fraction/100),fallout_current.wind);

		if(fallout_current.fallout_info_div_id) {
			var fallout_info = document.getElementById(fallout_current.fallout_info_div_id);
		}
				
		if(fallout_info) {
			var o = "";
			o+="<hr>";
			o+= "Estimated total-dose <b>fallout contours</b> for a "+addCommas(fallout_current.kt)+" kt surface burst"+(fallout_current.airburst?"*":"");
			
			if(fallout_current.fission_fraction<100) {
				o+=" ("+(fallout_current.fission_fraction>1?Math.round(fallout_current.fission_fraction):fallout_current.fission_fraction)+"% fission)";
			}
			o+=" with a "+fallout_current.wind+" mph wind:<br>";
		}
		
		if(fallout_debug) console.log(sfss);
		
		var steps = 15;
		
		clouds[det_index].falloutContours = [];
		
		for(var i = 0; i<fallout_current.rad_doses.length; i++) {
			var f_color = colorStep(log10(fallout_current.rad_doses[i]),log10(1000),"FFFF00","FF0000","010000","010000");
	
			var ss = sfss[fallout_current.rad_doses[i]];
			var fallout_alt = (i*20)+200;
			

			var fallout_polygon = plot_fallout_GE(lat,lng,fallout_alt,fo.SFSS_fallout_points(ss,fallout_current.angle,steps),f_color,fallout_current.rad_doses[i]+" r/hr");
			clouds[det_index].falloutContours.push('det-'+det_index+'-fallout-'+fallout_current.rad_doses[i]);
			fallout_polygon.setName('det-'+det_index+'-fallout-'+fallout_current.rad_doses[i]);

			ge.getFeatures().appendChild(fallout_polygon);

			
			if(fallout_info) {
				o+= "<p><div class='legendkey falloutlegendkey' style='background-color: #"+blend_colors(blend_colors("000000",background_color,.25),f_color,.25)+"; border: 1px solid #ff5d2e;'></div> Fallout contour for <b>"+addCommas(fallout_current.rad_doses[i])+"</b> rads per hour: ";
				o+= "<br><ul>";
				
				if(ss.draw_cloud||ss.draw_stem) {
					if(!ss.draw_cloud&&ss.draw_stem) {
						o+= "<li>Maximum downwind cloud (stem only) distance: "+distance(ss.downwind_stem_distance*mi2km,false);
						o+= "<li>Maximum stem width: "+distance(ss.max_stem_width*2*mi2km,false);
						o+= "<li>Approximate area affected: "+distance(ss.stem_area*sqmi2sqkm,false,true);
						o+= "<li>The selected radiation level is too high for cloud fallout at this yield, and so this contour is not mapped. Maximum radiation contour for cloud fallout that can be mapped for this yield is "+addCommas(Math.round(ss.max_cloud_rad))+" r/hr.";
					} else if (ss.draw_cloud&&!ss.draw_stem) {
						o+= "<li>Maximum downwind cloud distance: "+distance(ss.downwind_cloud_distance*mi2km,false);
						o+= "<li>Maximum width: "+distance(ss.max_cloud_width*2*mi2km,false);
						o+= "<li>Approximate area affected: "+distance(ss.stem_area+ss.cloud_area*sqmi2sqkm,false,true);
						o+= "<li>The selected radiation level is too high for stem fallout at this yield, and so this contour is not mapped. Maximum radiation contour for stem fallout that can be mapped for this yield is "+addCommas(Math.round(ss.max_stem_rad))+" r/hr.";
					} else {
						o+= "<li>Maximum downwind cloud distance: "+distance(ss.downwind_cloud_distance*mi2km,false);
						o+= "<li>Maximum width: "+distance(ss.max_cloud_width*2*mi2km,false);
						o+= "<li>Approximate area affected: "+distance(ss.stem_area+ss.cloud_area*sqmi2sqkm,false,true);
					}
				} else {
					o+= "<li>The selected radiation level is too high for fallout at this yield, and so this contour is not mapped. Maximum radiation contour for cloud fallout that can be mapped for this yield is "+addCommas(Math.round(ss.max_cloud_rad))+" r/hr; for stem fallout it is "+addCommas(Math.round(ss.max_stem_rad))+" r/hr.";					
				}	
				o+= "</ul>";
			}
		}	
		
		if(fallout_info) {
			o+="<hr><small>*NOTE: The fallout shown is for a <u>surface</u> burst, not an airburst. Airbursts produce almost no fallout of significance if their fireball does not come into contact with the ground.</small>";
			fallout_info.innerHTML = o;			
		}		

		//old_marker_pos = pos;
	}
}


function hide_windsock() {
	if(windsock_marker) {
		windsock_marker.setMap(null);
		windsock_marker = null;
		document.getElementById('hide_windsock').innerHTML = "Click here to show the windsock.";
		if(fallout_drag_listener) google.maps.event.removeListener(fallout_drag_listener);
	} else {
		new_windsock();
		document.getElementById('hide_windsock').innerHTML = "Click here to hide the windsock.";
	}
}

//this scales the fission yield according to height of burst. Input is kt, fission_fraction (0-1), height of burst (feet)
//returns a new kilotonnage, or 0 if the hob is too high for local fallout
//taken from eq. 4.4.1 of H.G. Norment, "DELFIC: Department of Defense Fallout Prediction System, Vol. I-Fundamentals" (DNA 5159F-1, 31 December 1979), page 53. 
function fallout_kt_hob(kt,fission_fraction,hob) {
	if(hob==0) return kt; //surface burst, no doubt
	var fission_kt = kt*(fission_fraction/100);
	var scaled_hob_activity_decay_constant = hob/Math.pow(kt,(1/3));
	var scaled_hob = hob/Math.pow(kt,(1/3.4));
	var max_hob = 180*Math.pow(kt,.4); //Glasstone and Dolan, 1977 edn., p.71
	if(hob>=max_hob) { //using Glasstone' def of negligible fallout rather than DELFICs, because DELFICs seems about 40-50% lower for no reason
		return 0;
	} else 
	if (scaled_hob_activity_decay_constant<=0) {
		return 0;
	} else {
		var f_d = Math.pow(0.45345,scaled_hob_activity_decay_constant/65);
		var scaled_kt = (fission_kt*f_d)/(fission_fraction/100);
		return scaled_kt;
	}
}


function new_windsock(angle) {
	//clear any vestiges
	if(windsock_marker) {
		windsock_marker.setMap(null);
		windsock_marker = null;
	}
	if(fallout_drag_listener) google.maps.event.removeListener(fallout_drag_listener);
	if(marker_drag_listener) google.maps.event.removeListener(marker_drag_listener);
	
	var pos = marker.getPosition();
		
	if(!angle&angle!==0) {
	    if(document.getElementById("fallout_angle").value) {
	        angle = document.getElementById("fallout_angle").value;
	    } else {
	    	angle = fallout_angle_default; //default angle
        }
	}

    windsock_distance =  (16-map.getZoom())*2-1;

    var wpos = destination_from_bearing(marker.getPosition().lat(),marker.getPosition().lng(),angle+180,windsock_distance);

	windsock_marker = new google.maps.Marker({
	  map: map,
	  position: new google.maps.LatLng(wpos[0], wpos[1]),
	  draggable: true,
	  icon: {
	    url: "images/windsock2.png",
        scaledSize: new google.maps.Size(30, 38),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(8,35),
	  },
	  title: 'Drag me to change wind direction for fallout',
	  animation: google.maps.Animation.DROP	  
	});
	
	fallout_drag_listener = google.maps.event.addListener(windsock_marker, 'dragend', function () {
	var new_angle = fallout_bearing(marker.getPosition(),windsock_marker.getPosition());
	if(new_angle<0) new_angle+=360;

     $("#fallout_angle").val(new_angle);
	fallout_current.angle = new_angle
		draw_fallout();
		if(document.getElementById("fallout_windsock")) {
			document.getElementById("fallout_windsock").innerHTML = "Fallout windsock is "+distance(distance_between(marker.getPosition().lat(),marker.getPosition().lng(),windsock_marker.getPosition().lat(),windsock_marker.getPosition().lng()), false)+" from ground zero. <a href='#' onclick='hide_windsock(); return false;' id='hide_windsock'>Click here to hide windsock.</a>";
		}
		update_permalink();
	});
	
	marker_drag_listener  = google.maps.event.addListener(marker, 'dragend', function () {
		move_windsock();
		draw_fallout();
	})
}

function move_windsock() {
	if(old_marker_pos&&windsock_marker) {
		var dlat = marker.getPosition().lat()-old_marker_pos.lat();
		var dlng = marker.getPosition().lng()-old_marker_pos.lng();
		if(windsock_marker) windsock_marker.setPosition(new google.maps.LatLng(windsock_marker.getPosition().lat()+dlat,windsock_marker.getPosition().lng()+dlng)); 
	}
}

function change_doses() {
	var current = '';
	for(var i=0; i<rad_doses.length;i++) {
		current+=''+rad_doses[i];
		if(i<rad_doses.length-1) current+=",";
	}
	var input_doses = window.prompt("To change the doses plotted in the fallout curves, enter them in below as numbers separated by commas. These numbers are in rads/hour, between 1 and 30,000. Invalid numbers will be ignored.",current);

	if(input_doses) {
		var new_doses = [];
		var input_doses_array = input_doses.split(",");
		for(var i=0; i<input_doses_array.length;i++) {
			var n = parseInt(input_doses_array[i]);
			if((n>0)&&(n<=30000)) {
				new_doses.push(n);
			}
		}
		if(new_doses.length>0) {
			rad_doses = new_doses;
			rad_doses.sort(function(a,b){return a-b});
			if(fallout_current) {
				fallout_current.rad_doses = rad_doses;
				draw_fallout();
			}
		}
	}
	dets[det_index].rad_doses = fallout_current.rad_doses;
	update_permalink();
}

function rotate_points(points_array,angle_degrees) {
	//normalize angle for wind
	angle_degrees=(90-angle_degrees)+180; 
	//rotate
	var angle_rad = (angle_degrees) * deg2rad;
	var sinA = Math.sin(angle_rad);
	var cosA = Math.cos(angle_rad);
	for(var i=0;i<points_array.length;i++) {
		var px = points_array[i][0];
		var py = points_array[i][1];
		points_array[i][0] = px * cosA - py * sinA;
		points_array[i][1] = px * sinA + py * cosA;
	}
}

function fallout_bearing(pos1,pos2) {
	var lat1 = pos1.lat()*(deg2rad);
	var lat2 = pos2.lat()*(deg2rad);
	var lon1 = pos1.lng()*(deg2rad);
	var lon2 = pos2.lng()*(deg2rad);
	var y = Math.sin(lon2-lon1) * Math.cos(lat2);
	var x = Math.cos(lat1)*Math.sin(lat2) -
			Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
	var brng = (Math.atan2(y, x) * (rad2deg));
	brng+=180;
	if(brng>360) brng=360-brng;
	return Math.round(brng);
}

function clear_fallout() {
	if(fallout_points.length) {
		for(var i=0; i<fallout_points.length;i++) {
			fallout_points[i].setMap(null);
		}
		falloutMarkers=[];
	}
	if(fallout_contours[det_index]) {
		if(fallout_contours[det_index].length) {
			for(var i=0; i<fallout_contours[det_index].length;i++) {
				fallout_contours[det_index][i].setMap(null);
			}
			fallout_contours[det_index]=[];
		}
	}
}

function clear_fallout_GE(index) {
	if(index==undefined) index = det_index;
	if(clouds[index]!==undefined) {
		if(clouds[index].falloutContours!==undefined) {
			if(clouds[index].falloutContours.length) {		
				for(var i=0;i<clouds[index].falloutContours.length;i++) {
					remove_object(clouds[index].falloutContours[i]);
				}
			}
			clouds[index].falloutContours = [];
		}
	}

	var features = ge.getFeatures();
	for(var i=0;i<features.getChildNodes().getLength();i++) {
		if(features.getChildNodes().item(i).getName()) {
			if((features.getChildNodes().item(i).getName().indexOf("det-"+index+"-fallout"))!==-1) {
				features.removeChild(features.getChildNodes().item(i));
				i = 0; //we have to start over after each deletion b/c the indices change
			}  
		}
	}



}

//sometimes you just want it to stop...
//clears fallout marker and all refresh events
function stop_fallout() {
	if(windsock_marker) {
		windsock_marker.setMap(null);
		windsock_marker = null;
	}
	if(fallout_drag_listener) google.maps.event.removeListener(fallout_drag_listener);
	if(marker_drag_listener) google.maps.event.removeListener(marker_drag_listener);
	fallout_current = undefined;
}


//simple linear interpolation -- returns x3 for a given y3
function lerp(x1,y1,x2,y2,y3) {
	return ((y2-y3) * x1 + (y3-y1) * x2)/(y2-y1);
}

//linear interpolation that gets a log of all Y values first
function log_lerp(x1,y1,x2,y2,y3) {
	return lerp(x1,Math.log(y1),x2,Math.log(y2),Math.log(y3));
}


//same as Math.pow, just cleans up the function a bit
function pow(n,x) {
	return Math.pow(n,x);
}

function log(n) {
	return (Math.log(n));
}


function log10(n) {
	return (Math.log(n)) / (Math.LN10);
}

function unlog10(n) {
	return pow(10,n);
}


function get_latlon_poly(gz, points) {
	var R = 6371; //Earth's mean radius in km
	var coords = [];
	for(var i=0;i<points.length;i++) {
		var lat = gz.lat()+rad2deg*(points[i][1]*mi2km/R);
		var lng = gz.lng()+rad2deg*(points[i][0]*mi2km/R/Math.cos(deg2rad*(gz.lat())));
		coords.push([lat,lng]);
	}
	return coords;
}


function dump_polygon(steps) {
	if(!steps) steps = 15;
	var f = fallout_current;
	var doses = (fo.SFSS_fallout(f.kt,f.rad_doses,f.fission_fraction,f.wind));
	var dt = dets[det_index];
	for(i in doses) {
		console.log(i+" r/hr:");
		var p = get_latlon_poly(dt.pos,fo.SFSS_fallout_points(doses[i],fallout_current.angle,steps));
		var o = "";
		for(z in p) {
			o+=p[z][0]+", "+p[z][1]+"\n";
		}
		console.log(o);
	}
}


if (typeof register == 'function') { register("fallout.js"); }