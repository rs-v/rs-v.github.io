var dets = [];
var det_index = 0;
var legends = [];

var sample_marker;
var sample_drag_listener;

var marker_event_dragend;
var marker_event_zoomchanged;

var normal_style = [  {    "featureType": "poi.business",    "stylers": [      {        "visibility": "off"      }    ]  },  {    "featureType": "poi.park",    "elementType": "labels.text",    "stylers": [      {        "visibility": "off"      }    ]  }];

var cinematic = false;

var default_det = {
	airburst: true,
	hob: 200,
	hob_opt: 1,
	hob_opt_psi: 5,
	fireball: true,
	psi: ["20","5"],
	rem: ["500"],
	therm: ["_3rd-100"],
	crater: false,
	casualties: false,
	humanitarian: false,	
	fallout: false,
	fallout_wind: 15,
	ff: 100,
	fallout_angle: 225,
	fallout_rad_doses: ["1","10","100","1000"],
	erw: false,
	linked: false,
	cep: false,
	cep_ft: 0,
	cloud: false,
};

var det_min = 0;

var map; 
var marker;
var logo;
var circle_stroke = 0;

var service;
var geocoder;

var c_radii = [];
var highlightcircle; 
var local = false; if(window.location.toString().substring(0,("http://localhost").length)=="http://localhost") local=true;
var debug = false;
var user_country;
var user_location;
var basepath = window.location.protocol+"//"+location.hostname+window.location.pathname;
var grayscale = false;

var admin = 0;

var pi = Math.PI;
var background_color = "e0e0e0";

var waitingforlink = false;

//This is apparently needed to make the iPad click jQuery events work
var ua = navigator.userAgent, click_event = (ua.match(/iPad/i)) ? "touchstart" : "click";

var hide_legend_hr;

function start() {

	$('#version').delay(1000).fadeIn('slow'); 

	$("#advanced-options-header").html($("#advanced-options-header").html()+"<span class='hider-arrow' id='hider-arrow' expanded='0'> &#9654;</span>");

	//hider arrows for sections
	$(document).on(click_event,'.hider-arrow',function() { 
		if($(this).attr("expanded") == "1") {
			$(this).html(" &#9654;");
			$(this).attr("expanded","0");
			if($(this).parent().parent().children("#collapsed-content").attr("id")) {
				$(this).parent().parent().children("#collapsed-content").slideUp();
			} else if($(this).parent().children("#collapsed-content")) {
				$(this).parent().children("#collapsed-content").slideUp();
			}
		} else {
			$(this).html(" &#9660;");
			$(this).attr("expanded","1");
			if($(this).parent().parent().children("#collapsed-content").attr("id")) {
				$(this).parent().parent().children("#collapsed-content").slideDown();
			} else if($(this).parent().children("#collapsed-content")) {
				$(this).parent().children("#collapsed-content").slideDown();
			}
		}
	})
	
	$('#option_gray').bind(click_event, function () {
		toggle_grayscale($("#option_gray").prop("checked"));
	})
	
	//minimize interface
	$('#minimize_interface').bind(click_event, function () {
		$('#topFrame').hide();
		$('#bottomFrame').hide();
		$('#theSettings').addClass('settingsMin');
		$('#theMap').addClass('mapMax');
		$('#hiddenFrame').show();
		google.maps.event.trigger(map, "resize");
		map_logo(0);
	})

	$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
		var isFullScreen = document.fullScreen ||
			document.mozFullScreen ||
			document.webkitIsFullScreen;
		if (isFullScreen) {
			map_logo(false);
		} else {
			map_logo(true);
		}
	});


	
	$(document).on(click_event,"#logo",function () {
		$('#restore_interface').click();
	})
	
	//clickable abbreviations
	$(".def").on(click_event,function() {
		alert($(this).attr("title"));
	})
	
	//restore interface
	$('#restore_interface').bind(click_event, function () {
		$('#theMap').removeClass('mapMax');
		$('#theSettings').removeClass('settingsMin');
		$('#topFrame').show();
		$('#bottomFrame').show();
		$('#hiddenFrame').hide();
		google.maps.event.trigger(map, "resize");
		map_logo(1);
	})

	
	//make the fallout go away on unclick -- otherwise it can be annoying and persistent
	$('.fallout_check').bind(click_event, function () {
		if($(this).prop("checked")==false) {
			clear_fallout();
			stop_fallout();
			if(dets[det_index]) dets[det_index].fallout = false;
			update_permalink();
		}
	})
	
	$("#fallout_angle").on('change',function() {
		update_fallout();
	})
	$("#fallout_wind").on('change', function() {
		update_fallout();
	})
	$("#fallout_fission").on('change', function() {
		update_fallout();
	})
	
	$(document).on('mouseenter','.legendkey',function() { 
		if($(this).attr("radius")&&$(this).attr("index")) {
			if(highlightcircle) {
				highlightcircle.setMap(null);
			}
			highlightcircle= new google.maps.Circle({
			  map: map,
			  radius: parseFloat($(this).attr("radius")),
			  fillOpacity: 0,
			  strokeColor: '#ffffff',
			  strokeOpacity: 1,
			  strokeWeight: 4,
			  zIndex: (det_index+1)*100
			});
			highlightcircle.setCenter(new google.maps.LatLng(dets[parseInt($(this).attr("index"))].pos.lat(), dets[parseInt($(this).attr("index"))].pos.lng()));
		}
	 });

	$(document).on('mouseleave','.legendkey',function() { 
		if(highlightcircle) {
			highlightcircle.setMap(null);
		}
	 });
	
	var u = getUrlVars();
	if(u!=window.location.href) {
		loadingDiv(true);
		if(u["admin"]) {
			admin = u["admin"];
		}
		if(u["lite"]) {
			applyLite(u["lite"]);
		}
		if(u["load"]) {
			loadExternalDets(u["load"]);
			return;
		}
		if(u["t"]) {
			hash_request(u["t"]);
		} else {
			permalinks_to_det(u);
			if(dets.length) {
				init(dets[dets.length-1].pos,parseInt(u["zm"]));
				for(var i = 0; i<dets.length;i++) {
					launch(true,dets[i],i);
					if(i<dets.length-1) {
						detach(true);
					}
				}
				document.getElementById('theKt').value = dets[det_index].kt;
				loadingDiv(false);
			} else {
				init();
				loadingDiv(false);		
			}
		}
	} else {
		init();
	}
}

//uses css filters to toggle grayscale background
function toggle_grayscale(toggle) {
	var gray = [{ "stylers": [ { "visibility": "off" } ] },{ "featureType": "administrative", "stylers": [ { "visibility": "on" } ] },{ "featureType": "landscape", "stylers": [ { "visibility": "on" } ] },{ "featureType": "poi", "stylers": [ { "visibility": "on" } ] },{ "featureType": "road", "stylers": [ { "visibility": "on" } ] },{ "featureType": "water", "stylers": [ { "visibility": "on" } ] },{ "featureType": "transit", "stylers": [ { "visibility": "on" } ] },{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":60}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":30},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":0}]},{"featureType": "transit", "elementType": "labels", "stylers": [ { "visibility": "off" }]}]
	if(toggle) {
		map.setOptions({styles:gray});
		/*
		var gs = "grayscale(100%)";
		var ffgs =  "filter: url(\"data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'matrix\' values=\'0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0\'/></filter></svg>#grayscale\");"; //firefox
		insertRule(['.gm-style img'], '-webkit-filter:'+gs+';-moz-filter:'+gs+';-ms-filter:'+gs+';-o-filter:'+gs+';filter:'+gs+';'+ffgs+'filter: gray;');
		*/
		//filter: url(grayscale.svg);
		grayscale = true;
	} else {
		map.setOptions({styles:normal_style});

		/*var gs = "none";
		insertRule(['.gm-style img'], '-webkit-filter:'+gs+';-moz-filter:'+gs+';-ms-filter:'+gs+';-o-filter:'+gs+';filter:'+gs+';');
		*/
		grayscale = false;
	}
	//fixmarkercolor();
}

function insertRule (selector,rules,contxt) {
            var context=contxt||document,stylesheet;

            if(typeof context.styleSheets=='object')
            {
              if(context.styleSheets.length)
              {
                stylesheet=context.styleSheets[context.styleSheets.length-1];
              }
              if(context.styleSheets.length)
              {
                if(context.createStyleSheet)
                {
                  stylesheet=context.createStyleSheet();
                }
                else
                {
                  context.getElementsByTagName('head')[0].appendChild(context.createElement('style'));
                  stylesheet=context.styleSheets[context.styleSheets.length-1];
                }
              }
              if(stylesheet.addRule)
              {
                for(var i=0;i<selector.length;++i)
                {
                  stylesheet.addRule(selector[i],rules);
                }
              }
              else
              {
                stylesheet.insertRule(selector.join(',') + '{' + rules + '}', stylesheet.cssRules.length);  
              }
            }
          }

function launch(override_autozoom,params,d_index) {
	var fireball = false;
	var crater = false;
	var casualties = false;
	var humanitarian = false;
	var humanitarian_show = false;
	var fallout = false;
	var collapser = false;
	var cep = false;
	var cep_ft = 0;
	var erw = false;
	var cloud = false;

	var c = [];
	var psi = [];
	var rem = [];
	var therm = [];

	var errs = [];

	if(!params) {

		ktInput = document.getElementById("theKt").value;

		if(ktInput=='') {
			if(document.getElementById("preset").value>0) {
				ktInput = document.getElementById("preset").value;
				document.getElementById("theKt").value = ktInput;
			}
		}

		if(ktInput=='') {
			$("#detonate_error").html("Please specify a <b>yield</b> above.")
			$("#detonate_error").slideDown(100).delay(2000).slideUp(100);
			$("#yield_div").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
			return false;
		} 
	
		kt = parseFloat(ktInput);

		if(kt<=0) {
			$("#detonate_error").html("Please specify a <b>yield</b> above.")
			$("#detonate_error").slideDown(100).delay(2000).slideUp(100);
			$("#yield_div").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
			return false;
		}
		$("#detonate_error").hide();
		
		pos = marker.getPosition();
	
		if(parseFloat(ktInput)>100000) {
			alert("The NUKEMAP effects models only scale up to 100,000 kt (100 megatons). Sorry!");
			return false;
		}

		var opt = document.forms["options"];

		var hob_ft = 0;
		if(opt["hob"][0].checked) {
			var airburst = true;
			if(opt["hob_option"][1].checked) {
				var hob_opt = 1;
				var hob_opt_psi = parseFloat(opt["hob_psi"].value);
				if(hob_opt_psi<1||hob_opt_psi>10000) {
					errs.push("Range of psi for choosing an optimum height is 1 to 10,000.");
					var hob_opt = 0;
				} else {
					hob_ft = Math.round(bc.opt_height_for_psi(kt,parseFloat(hob_opt_psi)));
				}
			} else if(opt["hob_option"][2].checked) {
				var hob_opt = 2;
				var hob_opt_psi = 5; //default
				switch(parseInt(opt["hob_h_u"].value)) {
					case 1: //m
						hob_ft = Math.round(parseFloat(opt["hob_h"].value)*m2ft);
					break;
					case 2: //mi
						hob_ft = Math.round(parseFloat(opt["hob_h"].value)*mi2ft);
					break;
					case 3: //km
						hob_ft = Math.round(parseFloat(opt["hob_h"].value)*km2ft);				
					break;
					default: //ft
						hob_ft = Math.round(parseFloat(opt["hob_h"].value));
					break;
				}
			} else {
				var hob_opt = 0;
			}
		} else {
			var airburst = false;
		}

		for(var i=0; i<opt["psi"].length;i++) {
			if(opt["psi"][i].checked) {
				if(opt["psi"][i].value>0) {
					psi.push(opt["psi"][i].value);
				} else if(opt["psi"][i].value<0) {
					var other = parseFloat(opt["psi_other_"+(parseInt(opt["psi"][i].value)*-1)].value);
					if((other>=1)&&(other<=10000)) {
						psi.push(parseFloat(other));
					} else {
						errs.push("Range for overpressure is 1-10,000 psi; entry of "+other+" skipped.");
					}
				}
			}
		}
		
		for(var i=0; i<opt["rem"].length;i++) {
			if(opt["rem"][i].checked) {
				if(opt["rem"][i].value>0) {
					rem.push(opt["rem"][i].value);
				} else if(opt["rem"][i].value < 0){
					var other = parseFloat(opt["rem_other_"+(parseInt(opt["rem"][i].value)*-1)].value);
					if(other>=1&&other<=Math.pow(10,8)) {
						rem.push(other);
					} else {
						errs.push("Range for initial nuclear radiation is 1-10^8 rem; entry of "+other+" skipped.");
					}
				}
			}
		}

		for(var i=0; i<opt["therm"].length;i++) {
			if(opt["therm"][i].checked) {
				if(opt["therm"][i].value>0||opt["therm"][i].value[0]=="_") {
					therm.push(opt["therm"][i].value);
				} else if (opt["therm"][i].value<0) {
					var other = parseFloat(opt["therm_other_"+(parseInt(opt["therm"][i].value)*-1)].value);
					if(other>0) {
						therm.push(other);
					}
				}
			}
		}
	
		if(opt["other"][0].checked) casualties = true;
		if(opt["other"][1].checked) fireball = true;
		if(opt["other"][2].checked) crater = true;
		if(opt["other"][3].checked) humanitarian = true;
		if(opt["other"][4].checked) humanitarian_show = true;
		if(opt["other"][5].checked) fallout = true;
		if(opt["other"][6].checked) cep = true;
		if(opt["other"][7].checked) cloud = true;	

		var fallout_wind = parseInt(document.getElementById("fallout_wind").value);
		if(fallout_wind<0) { //bind the wind speed to respectable options
			fallout_wind = 0;
			document.getElementById("fallout_wind").value = fallout_wind;
		} else if(fallout_wind>50) { 
			fallout_wind = 50;
			document.getElementById("fallout_wind").value = fallout_wind;
		}
	
		var ff = parseInt(document.getElementById("fallout_fission").value);
		if(ff<=0) {
			ff = 1;
			document.getElementById("fallout_fission").value = ff;
		} else if (ff>100) {
			ff = 100;
			document.getElementById("fallout_fission").value = ff;
		}

        if(document.getElementById("fallout_angle").value) {
            var fallout_angle = document.getElementById("fallout_angle").value;
        } else if(windsock_marker) {
			var fallout_angle = fallout_bearing(marker.getPosition(),windsock_marker.getPosition());
        } else {
            var fallout_angle = null;
        }

		if(opt["collapser"]!=undefined) {
			if(opt["collapser"].checked) collapser = true;
		}

		dets[det_index] = {
			kt: kt,
			pos: pos,
			airburst: airburst,
			hob_opt: hob_opt,
			hob_psi: hob_opt_psi,
			hob_ft: hob_ft,
			fireball: fireball,
			crater: crater,
			casualties: casualties,
			humanitarian: humanitarian,
			fallout: fallout,
			fallout_wind: fallout_wind,
			ff: ff,
			fallout_angle: fallout_angle,
			erw: erw,
			psi: psi,
			rem: rem,
			therm: therm,
			cep: cep,
			cep_ft: cep_ft,
			cloud: cloud
		};

	} else {
		var opt = document.forms["options"];
		if(!params.pos) return false;
		det_index = d_index;
		if(params.kt) {
			kt = params.kt; document.getElementById("theKt").value = kt;
		}
		if(params.pos) { 
			pos = params.pos; marker.setPosition(pos);
		}
		if(params.airburst!=undefined)	{
			airburst = params.airburst;
			if(airburst) { 
				opt["hob"][0].checked = true;
			} else {
				opt["hob"][1].checked = true;
			}
		}

		if(params.hob_opt!=undefined) {
			hob_opt = params.hob_opt;
			hob_opt_psi = params.hob_psi;
			hob_ft = params.hob_ft;
			opt["hob_option"][hob_opt].checked = true;
			if(hob_opt_psi) opt["hob_psi"].value = hob_opt_psi;
			if(hob_ft||params.hob_ft!=undefined) opt["hob_h"].value = hob_ft;
			if(!hob_ft&&hob_opt_psi&&hob_opt==1) {
				hob_ft = Math.round(bc.opt_height_for_psi(kt,parseFloat(hob_opt_psi)));
			}
		}

		if(params.fireball!=undefined) { 
			fireball = params.fireball;
			opt["other"][1].checked = fireball;
		}
		
		if(params.crater) { 
			crater = params.crater;
			opt["other"][2].checked = crater;
		}
		if(params.casualties) { 
			casualties = params.casualties;
			opt["other"][0].checked = casualties;
		}
		if(params.humanitarian) { 
			humanitarian = params.humanitarian;
			opt["other"][3].checked = humanitarian;
		}
		if(params.humanitarian_show) { 
			humanitarian = params.humanitarian_show;
			opt["other"][4].checked = humanitarian_show;
		}
		if(params.fallout) { 
			fallout = params.fallout;
			opt["other"][5].checked = fallout;
			document.getElementById("fallout_check_2").checked = opt["other"][5].checked;
		}
		if(params.cloud) {
			cloud = params.cloud;
			opt["other"][7].checked = cloud;
		}
		
		if(params.fallout_wind!=undefined) {
			fallout_wind = params.fallout_wind;
			document.getElementById("fallout_wind").value = fallout_wind;
		}

		if(params.ff) {
			ff = params.ff;
			document.getElementById("fallout_fission").value = ff;
		}	

		if(params.fallout_angle!==undefined) {
			fallout_angle = params.fallout_angle;
			document.getElementById("fallout_angle").value = fallout_angle;
		}
		
		if(params.fallout_rad_doses) {
			rad_doses = params.fallout_rad_doses;
		}
		
		if(params.cep) {
			cep = params.cep;
			opt["other"][6].checked = cep;
		}
		
		if(params.cep_ft) {
			cep_ft = params.cep_ft;
			opt["cep"].value = cep_ft;
		}
		
		if(params.erw) { 
			erw = params.erw;
			//opt["other"][7].checked = erw;
		}
		
		if(params.psi&&!isEmptyArray(params.psi)) { 
			psi = params.psi;
			document.getElementById("addrow_psi").innerHTML="";
			opt["psi_other_1"].value = "";
			document.getElementById("psi_other_check_1").checked = false;
			
			for(var i=0; i<opt["psi"].length;i++) {
				if(inArray(opt["psi"][i].value,psi)) {
					opt["psi"][i].checked = true;
				} else {
					opt["psi"][i].checked = false;
				}
			}
			for(var i=0;i<psi.length;i++) {
				switch(psi[i]){
					case "3000": case "200": case "20": case "5": case "1":
						//do nothing, these are already in the controls
					break;
					default:
						var p = 1;
						while(opt["psi_other_"+p].value) {
							addrow('psi');
							p++;
						}
						opt["psi_other_"+p].value = psi[i];
						document.getElementById("psi_other_check_"+p).checked = true;
					break;
				}
			}
		} else {
			for(var i=0; i<opt["psi"].length;i++) {
				opt["psi"][i].checked = false;
			}		
		}
		if(params.rem&&!isEmptyArray(params.rem)) { 

			rem = params.rem;
			document.getElementById("addrow_rem").innerHTML="";
			opt["rem_other_1"].value = "";
			document.getElementById("rem_other_check_1").checked = false;
			
			for(var i=0; i<opt["rem"].length;i++) {
				if(inArray(opt["rem"][i].value,rem)) {
					opt["rem"][i].checked = true;
				} else {
					opt["rem"][i].checked = false;
				}
			}
			for(var i=0;i<rem.length;i++) {
				switch(rem[i]){
					case "100": case "500": case "600": case "1000": case "5000":
						//do nothing, these are already in the controls
					break;
					default:
						var p = 1;
						while(opt["rem_other_"+p].value) {
							addrow('rem');
							p++;
						}
						opt["rem_other_"+p].value = rem[i];
						document.getElementById("rem_other_check_"+p).checked = true;
					break;
				}
			}
		} else {
			for(var i=0; i<opt["rem"].length;i++) {
				opt["rem"][i].checked = false;
			}		
		}
		if(params.therm&&!isEmptyArray(params.therm)) { 
			therm = params.therm;
			document.getElementById("addrow_therm").innerHTML="";
			opt["therm_other_1"].value = "";
			document.getElementById("therm_other_check_1").checked = false;
			
			for(var i=0; i<opt["therm"].length;i++) {
				if(inArray(opt["therm"][i].value,therm)) {
					opt["therm"][i].checked = true;
				} else {
					opt["therm"][i].checked = false;
				}
			}
			for(var i=0;i<therm.length;i++) {
				switch(therm[i]){
					case "_3rd-100": case "_3rd-50": case "_2nd-50": case "_1st-50": case "_noharm-100": case "35":
						//do nothing, these are already in the controls
					break;
					default:
						var p = 1;
						while(opt["therm_other_"+p].value) {
							addrow('therm');
							p++;
						}
						opt["therm_other_"+p].value = therm[i];
						document.getElementById("therm_other_check_"+p).checked = true;
					break;
				}
			}
		} else {
			for(var i=0; i<opt["therm"].length;i++) {
				opt["therm"][i].checked = false;
			}		
		}
	}
	if(typeof params !=="undefined") {
		if(params.nd==1) return;
	}
	
	if(humanitarian) {
		get_places(pos.lat(),pos.lng(), bc.distance_from_scaled_range(bc.maximum_overpressure_range(10,airburst),kt)*mi2m,humanitarian_show,"theLegendPlaces"); 
	}
	
	if(casualties) {
		get_casualties(pos.lat(),pos.lng(),kt,airburst,hob_opt,hob_ft,"theLegendCasualties");
	}
	
	if(fallout) {
		if(hob_ft&&airburst) {
			do_fallout(kt,fallout_wind,ff,fallout_angle,"theLegendFallout",airburst,hob_ft);
		} else {
			do_fallout(kt,fallout_wind,ff,fallout_angle,"theLegendFallout",airburst);		
		}
	}

	if(cep==true) {
		switch(parseInt(opt["cep_unit"].value)) {
			case 1: //m
				cep_ft = Math.round(parseFloat(opt["cep"].value)*m2ft);
			break;
			case 2: //mi
				cep_ft = Math.round(parseFloat(opt["cep"].value)*mi2ft);
			break;
			case 3: //km
				cep_ft = Math.round(parseFloat(opt["cep"].value)*km2ft);				
			break;
			default: //ft
				cep_ft = Math.round(parseFloat(opt["cep"].value));
			break;
		}
		if(cep_ft>0) {
			c.push([cep_ft*ft2mi,"cep",50]);
			c.push([cep_ft*2*ft2mi,"cep",43]);
			c.push([cep_ft*3*ft2mi,"cep",7]);			
		} else {
			errs.push("The Circular Error Probable given is an invalid value. CEP must be greater than zero to display.");	
		}
	}

	if(c_radii[det_index]) {
		for(var i=0;i<c_radii[det_index].length;i++) {
			c_radii[det_index][i].setMap(null);
		}
	}

	for(var i=0;i<psi.length;i++) {
		if(airburst==true) {
			if(!hob_opt) {
				var t = bc.psi_distance(kt,psi[i],airburst);
			} else {
				var t = bc.range_from_psi_hob(kt,psi[i],hob_ft)*ft2mi;
			}
		} else {
			var t = bc.range_from_psi_hob(kt,psi[i],0)*ft2mi;
			//var t = bc.psi_distance(kt,psi[i],airburst);
		}
		if(t>0) {
			c.push([t,"psi",psi[i]]);	
		} else {
			var err = "The blast pressure equation for "+psi[i]+" psi failed to give a result for the given yield and height settings.";
			if(hob_ft&&airburst&&hob_opt) {
				err+=" The maximum detonation height for this effect to be felt on the ground is "+distance(bc.max_height_for_psi(kt,psi[i])*ft2km)+".";
			}
			errs.push(err);
		}
	}

	for(var i=0;i<rem.length;i++) {
		if(erw) {
			var r_kt = kt*10;
		} else {
			var r_kt = kt;
		}
		var t = bc.initial_nuclear_radiation_distance(r_kt,rem[i]);
		var t1 = t;
		if(hob_ft&&airburst) {
			t = bc.ground_range_from_slant_range(t,hob_ft*ft2mi);
		}
		if(t>0) {
			c.push([t,"rem",rem[i]]);
		} else {
			var err = "The initial nuclear radiation equation for "+rem[i]+" rem failed to give a result for the given yield and height settings.";
			if(hob_ft&&airburst) {
				if(hob_ft*ft2mi > t1) {
					err+=" The maximum detonation height for this effect to be felt on the ground is "+distance(t1*mi2km)+".";
				}
			}
			errs.push(err);
		}
	}

	for(var i=0;i<therm.length;i++) {		
		var t = bc.thermal_distance(kt,therm[i],airburst);
		var t1 = t;
		if(hob_ft&&airburst) {
			t = bc.ground_range_from_slant_range(t,hob_ft*ft2mi);
		}
		if(t>0) {
			c.push([t,"therm",therm[i]]);
		} else {
			if(therm[i][0]=="_") {
				switch(therm[i]) {
				case "_3rd-100":
					var t_text = "3rd degree burns";
				break;
				case "_3rd-50":
					var t_text = "3rd degree burns (50%)";
				break;
				case "_2nd-50":
					var t_text = "2nd degree burns (50%)";
				break;
				case "_1st-50":
					var t_text = "1st degree burns (50%)";
				break;
				case "_noharm-100":
					var t_text = "no harm";
				break;	
				}
				var err = "Thermal radiation ("+t_text+") equation failed to give a result for the given yield and height."
				if(hob_ft&&airburst) {
					if(hob_ft*ft2mi > t1) {
						err+=" The maximum detonation height for this effect to be felt on the ground is "+distance(t1*mi2km)+".";
					}
				}
				errs.push(err);				
			} else {
				var err = "Thermal radiation ("+therm[i]+" cal/cm&sup2;) equation failed to give a result for the given yield and height.";
				if(hob_ft&&airburst) {
					if(hob_ft*ft2mi > t1) {
						err+=" The maximum detonation height for this effect to be felt on the ground is "+distance(t1*mi2km)+".";
					}
				}
				errs.push(err);							
			}
		}
	}
	
	if(fireball) {
		var t = bc.fireball_radius(kt,airburst);
		if(t>0) {
			c.push([t,"fireball",""]);
		} else {
			errs.push("The fireball size equation failed to give a result for the given yield.");				
		}
	}

	var cr = bc.crater(kt,true);
	if(crater) {
		if((cr[0]>0)&&(cr[1]>0)) {
			c.push([cr[0],"crater_lip",""]);
			c.push([cr[1],"crater_apparent",""]);
		} else {
			errs.push("The crater size equation failed to give a result for the given yield.");
		}
	}

	if(collapser) {
		if($('.hider-arrow').attr("expanded") == "1") {
			$('.hider-arrow').click();
		}
	}

	var legend ="";
	if(!hide_legend_hr) legend = "<hr>";
	legend+= "<b>Effects radii for "+ addCommas(ktOrMt(kt)) + " "+(airburst?"airburst*":"surface burst")+"</b> (smallest to largest):";
	legend+= "<span class='hider-arrow' expanded='1'> &#9660;</span>"
	legend+= "<div id='collapsed-content'>";

 	c.sort(function(a,b){return b[0]-a[0]});

	legend1 = ""; //this is a separate variable because we are going to be adding to it from the bottom up

	c_radii[det_index] = [];

	var circs=0;
	for(rec in c) {
		switch (c[rec][1]) {		
			case "therm":
			switch(c[rec][2]) {
				case "_3rd-100":
					var t_text = "3rd degree burns";
					var t_extra = "100% probability for 3rd degree burns at this yield is "+Math.round(bc.thermal_radiation_param_q(kt,c[rec][2]),1)+" cal/cm<sup>2</sup>.";
					var caption = "Third degree burns extend throughout the layers of skin, and are often painless because they destroy the pain nerves. They can cause severe scarring or disablement, and can require amputation.";
				break;
				case "_3rd-50":
					var t_text = "3rd degree burns (50%)";
					var t_extra = "50% probability for 3rd degree burns at this yield is "+Math.round(bc.thermal_radiation_param_q(kt,c[rec][2]),1)+" cal/cm<sup>2</sup>.";				
					var caption = "Third degree burns extend throughout the layers of skin, and are often painless because they destroy the pain nerves. They can cause severe scarring or disablement, and can require amputation.";

				break;
				case "_2nd-50":
					var t_text = "2nd degree burns (50%)";
					var t_extra = "50% probability for 2nd degree burns at this yield is "+Math.round(bc.thermal_radiation_param_q(kt,c[rec][2]),1)+" cal/cm<sup>2</sup>.";				
					var caption = "Second degree burns are deeper burns to several layers of the skin. They are very painful and require several weeks to heal. Extreme second degree burns can produce scarring or require grafting.";
				break;
				case "_1st-50":
					var t_text = "1st degree burns (50%)";
					var t_extra = "50% probability for 1st degree burns at this yield is "+Math.round(bc.thermal_radiation_param_q(kt,c[rec][2]),1)+" cal/cm<sup>2</sup>.";				
					var caption = "First degree burns are superficial burns to the outer layers of the skin. They are painful but heal in 5-10 days. They are more or less the same thing as a sunburn.";
				break;
				case "_noharm-100":
					var t_text = "no harm";
					var t_extra = "100% probability of no significant thermal damage at this yield is "+Math.round(bc.thermal_radiation_param_q(kt,c[rec][2]),1)+" cal/cm<sup>2</sup>.";				
					var caption = "The distance at which anybody beyond would definitely suffer no damage from thermal radiation (heat).";
				break;	
				default:
					var t_text = "";
					var t_extra = "";
					var caption = "";
				break;	
			}	
			c_radii[det_index][circs] = new google.maps.Circle({
			  map: map,
			  radius: c[rec][0]*mi2m,
			  fillColor: "#FFA500",
			  fillOpacity: .3,
			  strokeColor: "#FFA500",
			  strokeOpacity: 1,
			  strokeWeight: 1,
			  zIndex: (circs+1)+(det_index+1)*10,
			  title: (t_text?"Thermal radiation radius ("+t_text+")":"Thermal radiation radius ("+c[rec][2]+" cal/cm<sup>2</sup>)"),
			});
			if(t_text) {
				legend1 = "<p><div class='legendkey' index='"+det_index+"' radius='"+(c[rec][0]*mi2m)+"' style='background-color: #"+blend_colors("FFA500",background_color,.3)+"; border: 1px solid #FFA500;'></div> Thermal radiation radius ("+t_text+"): "+distance(c[rec][0]*mi2km,true)+"<br><small class='caption'>"+caption+" "+t_extra+"</small>"+legend1;
			} else {
				legend1 = "<p><div class='legendkey' index='"+det_index+"' radius='"+(c[rec][0]*mi2m)+"' style='background-color: #"+blend_colors("FFA500",background_color,.3)+"; border: 1px solid #FFA500;'></div> Thermal radiation radius ("+c[rec][2]+" cal/cm<sup>2</sup>): "+distance(c[rec][0]*mi2km,true)+(caption?"<br><small class='caption'>"+caption+"</small>":"")+legend1;
			}
			c_radii[det_index][circs].bindTo('center', marker, 'position');
			break;

			case "psi":
			var p = parseInt(c[rec][2]);
			c_radii[det_index][circs] = new google.maps.Circle({
			  map: map,
			  radius: c[rec][0]*mi2m,
			  fillColor: "#"+colorStep(p-5,20,"808080","FF0000","800000","800000"),
			  fillOpacity: p>=5?.3:lerp(.3,5,.2,1,p),
			  strokeColor: "#"+colorStep(p-5,20,"808080","FF0000","800000","800000"),
			  strokeOpacity: p>=5?1:lerp(1,5,.5,1,p),
			  strokeWeight: p<5?1:2,
			  zIndex: (circs+1)+(det_index+1)*10,
			  title: "Air blast radius ("+addCommas(p)+" psi)",
			});
			switch(true) {
				case (p == 10000):  
					var caption = "10,000 psi is approximately the pressure felt at 4 miles under the ocean. Not much can withstand this.";
				break;
				case (p == 7000):
					var caption = "7,000 psi is supposedly the maximum amount of pressure that super-hardened American missile silos can withstand.";
				break;
				case (p<10000&&p>1000):
					var caption = "Missile silos can be blast hardened to survive many thousand psi of pressure, but not much else can.";
				break;
				case (p == 200):
					var caption = "200 psi is approximately the pressure felt inside of a steam boiler on a locomotive. Extreme damage to all civilian structures, some damage to even &quot;hardened&quot; structures.";
				break;
				case (p == 20):
					var caption = "At 20 psi overpressure, heavily built concrete buildings are severely damaged or demolished; fatalities approach 100%. Often used as a standard benchmark for <b>heavy</b> damage in cities.";
				break;
				case (p < 20 && p > 5):
					var caption = "Between medium and heavy damage in cities.";
				break;
				case (p == 5):
					var caption = "At 5 psi overpressure, most residential buildings collapse, injuries are universal, fatalities are widespread. Often used as a standard benchmark for <b>medium</b> damage in cities.";
				break;
				case (p < 5 && p > 1):
					var caption = "Between light and medium damage in cities.";
				break;
				case (p == 1):
					var caption = "At a around 1 psi overpressure, glass windows can be expected to break. This can cause many injuries in a surrounding population who comes to a window after seeing the flash of a nuclear explosion (which travels faster than the pressure wave). Often used as a standard benchmark for <b>light</b> damage in cities.";
				break;
				default:
					var caption = "";
				break;				
			}
			if(airburst) {
				caption+=" Optimal height of burst to maximize this effect is "+distance(bc.opt_height_for_psi(kt,c[rec][2])*ft2km)+".";
			}
			legend1 = "<p><div class='legendkey' index='"+det_index+"' radius='"+(c[rec][0]*mi2m)+"' style='background-color: #"+blend_colors(colorStep(c[rec][2]-5,20,"808080","FF8080","800000","800000"),background_color,.3)+"; border: 1px solid #808080;'></div> Air blast radius ("+addCommas(c[rec][2])+" psi): "+distance(c[rec][0]*mi2km,true)+(caption?"<br><small class='caption'>"+caption+"</small>":"")+ legend1;
			c_radii[det_index][circs].bindTo('center', marker, 'position');
			break;
			
			case "rem":
			c_radii[det_index][circs] = new google.maps.Circle({
			  map: map,
			  radius: c[rec][0]*mi2m,
			  fillColor: "#00FF00",
			  fillOpacity: .3,
			  strokeColor: "#00FF00",
			  strokeOpacity: 1,
			  strokeWeight: 1,
			  zIndex: (circs+1)+(det_index+1)*10,
			  title: "Radiation radius ("+(c[rec][2])+" rem)",
			});
			switch(c[rec][2]) {
				case "100":
					var caption = "100 rem radiation dose; likely symptoms of radiation sickness, but unlikely to be fatal. Long term cancer risk increases by about 5%.";
				break;
				case "500":
					var caption = "500 rem radiation dose; without medical treatment, there can be expected between 50% and 90% mortality from acute effects alone. Dying takes between several hours and several weeks.";
				break;
				case "600":
					var caption = "600 rem radiation dose; with immediate medical treatment, 80% mortality can be expected. Dying takes between several hours and several weeks.";
				break;
				case "1000":
					var caption = "1000 rem radiation dose; with immediate medical treatment, 95% mortality can be expected. Dying takes between several hours and several weeks.";
				break;
				case "5000":
					var caption = "5000 rem radiation dose. 100% fatal exposure.";
				break;		
				default:
					var caption = "";
				break;
			}			
			legend1 = "<p><div class='legendkey' index='"+det_index+"' radius='"+(c[rec][0]*mi2m)+"' style='background-color: #"+blend_colors("00ff00",background_color,.3)+"; border: 1px solid #00FF00;'></div> Radiation radius ("+(c[rec][2])+" rem): "+distance(c[rec][0]*mi2km,true)+(caption?"<br><small class='caption'>"+caption+"</small>":"")+legend1;
			c_radii[det_index][circs].bindTo('center', marker, 'position');
			break;
			
			case "fireball":
			c_radii[det_index][circs] = new google.maps.Circle({
			  map: map,
			  radius: c[rec][0]*mi2m,
			  fillColor: "#FFA500",
			  fillOpacity: airburst?.3:.5,
			  strokeColor: "#FFFF00",
			  strokeOpacity: airburst?.8:1,
			  strokeWeight: airburst?1:2,
			  zIndex: (circs+1)+(det_index+1)*10,
			  title: "Fireball radius",
			});
			var caption = "Maximum size of the nuclear fireball; relevance to lived effects depends on height of detonation. If it touches the ground, the amount of radioactive fallout is significantly increased.";
			if(airburst) caption+=" Minimum burst height for negligible fallout: "+distance(bc.minimum_height_for_negligible_fallout(kt)*mi2km)+".";
		    legend1 = "<p><div class='legendkey' index='"+det_index+"' radius='"+(c[rec][0]*mi2m)+"' style='background-color: #"+blend_colors("FFA500",background_color,.3)+"; border: 1px solid #FFFF00;'></div> Fireball radius: "+distance(c[rec][0]*mi2km,true) + "<br><small class='caption'>"+caption+"</small>"+legend1;
			c_radii[det_index][circs].bindTo('center', marker, 'position');
			break;

			case "crater_lip":
			c_radii[det_index][circs] = new google.maps.Circle({
			  map: map,
			  radius: c[rec][0]*mi2m,
			  fillColor: "#2E2E2E",
			  fillOpacity: .5,
			  strokeColor: "#2E2E2E",
			  strokeOpacity: 1,
			  strokeWeight: 1,
			  zIndex: (circs+1)+(det_index+1)*10,
			  title: "Crater lip radius",
			});
		    legend1 = "<p><div class='legendkey' index='"+det_index+"' radius='"+(c[rec][0]*mi2m)+"' style='background-color: #"+blend_colors("2e2e2e",background_color,.8)+"; border: 1px solid #2E2E2E;'></div> Crater lip radius: "+distance(c[rec][0]*mi2km,true) + legend1;
			c_radii[det_index][circs].bindTo('center', marker, 'position');
			break;

			case "crater_apparent":
			c_radii[det_index][circs] = new google.maps.Circle({
			  map: map,
			  radius: c[rec][0]*mi2m,
			  fillColor: "#2E2E2E",
			  fillOpacity: .5,
			  strokeColor: "#2E2E2E",
			  strokeOpacity: 1,
			  strokeWeight: 1,
			  zIndex: (circs+1)+(det_index+1)*10,
			  title: "Crater inner radius",
			});
		    legend1 = "<p>"+"<a href='images/craterdiagram.png' title='Open the crater diagram image in a new window' target='_blank'><img src='images/craterdiagram.png' width='200' style='float:right;'></a>"+"<div class='legendkey' index='"+det_index+"' radius='"+(c[rec][0]*mi2m)+"' style='background-color: #"+blend_colors("2e2e2e",background_color,.5)+"; border: 1px solid #2E2E2E;'></div> Crater inside radius: "+distance(c[rec][0]*mi2km,true) +"<p><div class='legendkey' style='padding-left: 1px; padding-right: 1px;text-align: center; display: inline-block;'>&darr;</div> Crater depth: "+  distance(cr[2]*5280*ft2km,false) + legend1;
			c_radii[det_index][circs].bindTo('center', marker, 'position');
			break;
			
			case "cep":
			c_radii[det_index][circs] = new google.maps.Circle({
			  map: map,
			  radius: c[rec][0]*mi2m,
			  fillColor: "#0000FF",
			  fillOpacity: 0,
			  strokeColor: "#"+colorStep(c[rec][0],50,"8080FF","0000FF"),
			  strokeOpacity: .8,
			  strokeWeight: 1,
			  zIndex: (circs+1)+(det_index+1)*10,
			  title: "Circular Error Probable ("+c[rec][2]+"%)",
			});
			var caption ="The radius (based on the user-defined CEP of "+distance(cep_ft*ft2km,false)+") where the bomb or warhead has a "+c[rec][2]+"% chance of landing.";
		    legend1 = "<p><div class='legendkey' index='"+det_index+"' radius='"+(c[rec][0]*mi2m)+"' style='background-color: #"+background_color+"; border: 1px solid #"+colorStep(c[rec][0],50,"8080FF","0000FF")+";'></div> Circular Error Probable ("+c[rec][2]+"%): "+distance(c[rec][0]*mi2km,true) + "<br><small class='caption'>"+caption+"</small>"+legend1;
			c_radii[det_index][circs].bindTo('center', marker, 'position');
			
			break;
			
		};
		circs++;
	};
		
	var big_bounds = new google.maps.LatLngBounds();
	
	if(c_radii[det_index].length) {	
		big_bounds = c_radii[det_index][0].getBounds();	
		if((document.getElementById("option_autozoom").checked == true) && (override_autozoom != true)) map.fitBounds(big_bounds);
	}

	if(cinematic) {
		run_cinematic();
	}

	if(cloud) {
		//all of these are in FEET
		var cloud_final_horizontal_semiaxis   = bc.cloud_final_horizontal_semiaxis(kt); 
		var cloud_final_height = bc.cloud_top(kt);
		var cloud_final_vertical_semiaxis = (cloud_final_height-bc.cloud_bottom(kt))/2;

		top_altitude = cloud_final_height;
		head_diameter = cloud_final_horizontal_semiaxis*2;
		head_height = cloud_final_vertical_semiaxis*2;
		var legend2="";
		legend2+= "<p>"+"<a href='images/clouddiagram.png' title='Open the cloud diagram image in a new window' target='_blank'><img src='images/clouddiagram.png' width='200' style='float:right;'></a>";
		legend2+= "<div class='legendkey' style='padding-left: 1px; padding-right: 1px;text-align: center; display: inline-block;'>&uarr;</div> ";
		legend2+= "Mushroom cloud altitude: "+distance(top_altitude*ft2km,false);
		legend2+= "<p><div class='legendkey' style='padding-left: 1px; padding-right: 1px;text-align: center; display: inline-block;'>&harr;</div> ";
		legend2+= "Mushroom cloud head diameter: "+  distance(head_diameter*ft2km,false);
		legend2+= "<p><div class='legendkey' style='padding-left: 1px; padding-right: 1px;text-align: center; display: inline-block;'>&varr;</div> ";
		legend2+= "Mushroom cloud head height: "+  distance(head_height*ft2km,false);
		legend2+= "<br clear='both'>";
		legend1=legend1+legend2;
	}

	if(airburst) {
		legend1+="<p><small>";
		if(hob_ft||hob_ft===0) {
			legend1+= "*Detonation altitude: "+distance(hob_ft*ft2km,false,false,true)+".";
			if(hob_opt==1) {
				legend1+=" (Chosen to maximize the "+addCommas(hob_opt_psi)+" psi range.)";
			}
		} else {
			legend1+= "*Effects shown for multiple, different detonation altitudes.";
		}
		legend1+="</small></p>";
	}


	legend = legend + legend1;
	
	//legend = legend + specials(pos,kt);
	
	if(errs.length) {
		legend+="<hr>The following errors were encountered trying to implement these settings:";
		legend+="<ul>";
		for(var i=0;i<errs.length;i++) {
			legend+="<li>"+errs[i]+"</li>";		
		}
		legend+="</ul>";
	}

	legend = legend + "<hr><small>Note: Rounding accounts for any inconsistencies in the above numbers."
	if(kt>20000) legend = legend + " Also, yields above 20 Mt are derived from a scaling of 20 Mt yields, and are not as validated as those under 20 Mt."
	if(kt<1) legend = legend + " Also, yields under 1 kt are derived from a scaling of 1 kt yields, and are not as validated as those over 1 kt."
	legend = legend + "</small>";

	legend = "<div id='legend-text'>"+legend+"</div>";
	legend+= "</div>"; //collapsable content div

	legends[det_index] = legend;


	if(det_index>0) {
		legend+="<hr><small>This map has multiple detonations. The above information is for detonation #<span id='current_legend_det'>"+(det_index+1)+"</span> only.";
		legend+=" View other detonation information: "
		legend+="<select id='legend_changer' onchange='change_legend(this.value);'>";
		for(var i=0;i<=det_index;i++) {
			if(i==det_index) {
				var chk = " selected";
			} else {
				var chk = "";
			}
			legend+="<option value='"+(i)+"'"+chk+">"+(i+1)+"</option>";
		}
		legend+="</select>";
		legend+=" <a href='#' onclick='edit_dets(); return false;'>Click here</a> to edit the detonation order.";
		legend+="</small><span id='det_editor'></span>";
	}

	document.getElementById("theLegend").innerHTML = legend;

	document.getElementById("thePermalink").innerHTML = "<hr><big>&nbsp;&raquo; <span id='permalink'>"+permalink()+"</span> &laquo;</big></small>";

	if(document.getElementById("option_logdata").checked != true) {
		var log_obj = {
			ver: 2,
			target_lat: dets[det_index].pos.lat(),
			target_lng: dets[det_index].pos.lng(),
			kt: dets[det_index].kt,
			airburst: dets[det_index].airburst==true?1:0,
			casualties: dets[det_index].casualties==true?1:0,
			fallout: dets[det_index].fallout==true?1:0,
			linked: dets[det_index].linked==true?1:0,
			active_dets: (det_index+1),			
		};
		if(google.loader.ClientLocation) {
			log_obj.user_country = user_country;
			log_obj.user_lat = google.loader.ClientLocation.latitude;
			log_obj.user_lng = google.loader.ClientLocation.longitude;
		}
		log_det(log_obj);
	}
	
	if(collapser) {
		$("#bottomFrame").scrollTop(1000);
	}
	
}

function change_legend(index) {
	document.getElementById("legend-text").innerHTML = legends[index];
	document.getElementById("current_legend_det").innerHTML = (parseInt(index)+1);
}

function edit_dets() {
	var o = '';
	o+="<br>";
	o+="<b>Current detonations in the stack	:</b><br>";
	o+="<select id='det_list' size='"+((det_index+1)>8?8:(det_index+1))+"'>";
	for(var i=0;i<=det_index;i++) {
		o+='<option value="'+i+'">';
		o+="#"+(i+1)+". "+ addCommas(dets[i].kt) +" kt ("+Math.round(dets[i].pos.lat(),6)+", "+Math.round(dets[i].pos.lng(),6)+")";
		o+='</option>';
	}	
	o+='</select>';
	o+='<div style="float:right;">';
	o+='<button onclick="change_det_list(0);">Move up</button>';
	o+='<button onclick="change_det_list(1);">Move down</button><br>';
	o+='<button onclick="change_det_list(2);">Remove detonation</button><br>';
	o+='<button onclick="change_det_list(3);"><b>Apply</b></button>';
	o+='<button onclick="change_det_list(4);">Cancel</button><br>';
	o+="</div>";
	o+='<br clear="both">';
	o+="The last (bottom-most) detonation is always the &quot;active&quot; detonation with the movable marker and changable settings.";
	document.getElementById('det_editor').innerHTML = o;
}

function change_det_list(action) {
	var det_list = document.getElementById('det_list');
	var sel = det_list.selectedIndex;
	switch(action) {
		case 0: //move up
		if(sel>0&&det_list.length>1) {
			var item1 = det_list.item(sel);
			var item2 = det_list.item(sel-1);
			var temp_text = item1.text;
			var temp_value = item1.value;
			item1.text = item2.text;
			item1.value = item2.value;
			item2.text = temp_text;
			item2.value = temp_value;
			item2.selected = true;
		}
		break;
		case 1: //move down
		if(sel>-1&&sel<det_list.length-1&&det_list.length>1) {
			var item1 = det_list.item(sel);
			var item2 = det_list.item(sel+1);
			var temp_text = item1.text;
			var temp_value = item1.value;
			item1.text = item2.text;
			item1.value = item2.value;
			item2.text = temp_text;
			item2.value = temp_value;
			item2.selected = true;
		}
		break;
		case 2: //remove
		if(sel>-1) {
			det_list.remove(sel);
		}
		break;
		case 3: //apply 
		var det_clone = clone(dets);
		clearmap();
		for(var i=0;i<det_list.length;i++) {
			dets[i] = det_clone[det_list.item(i).value];
		}
		for(var i = 0; i<dets.length;i++) {
			launch(true,dets[i],i);
			if(i<dets.length-1) {
				detach(true);
			}
		}
		det_index = dets.length-1;
		document.getElementById('theKt').value = dets[det_index].kt;
		break;
		case 4: //cancel
		document.getElementById('det_editor').innerHTML = "";
		break;
	}
	
}

//adds a row to the input fields
function addrow(what,label) {
	var mcounter = 0;
	var opt = document.forms["options"];
	for(var i=0; i<opt[what].length;i++) {
		if(opt[what][i].value<0) {
			mcounter++;
		}
	}
	var min = (mcounter+1)*-1;
	var ar = document.getElementById("addrow_"+what);
	ar.appendChild(document.createElement('BR'));
	var inp = document.createElement('INPUT');
	inp.type = "checkbox";
	inp.name = what;
	inp.value = min;
	inp.id = what+"_other_check_"+(min*-1);
	ar.appendChild(inp);
	ar.appendChild(document.createTextNode(' Other: '));
	var inp = document.createElement('INPUT');
	inp.type = "text";
	inp.className = "option_input";
	inp.name = what+"_other_"+(min*-1);
	inp.id = what+"_other_"+(min*-1);
	inp.value = "";
	ar.appendChild(inp);
	ar.appendChild(document.createTextNode(' '+(label==undefined?what:label)+' '));
}

function permalink() {
	waitingforlink = false;
	if((dets[0]!=undefined)&&(det_index>0)&&(dets[0].kt!=undefined)) {
		//MULTI PERMALINK
		return "<a href='#' onclick='fetchHash();'>Generate permanent link to these settings</a>";
	} else {
		//SINGLE PERMALINK
		return "<a href='" + window.location.pathname +"?"+object_to_urlstring(dets[0])+"&zm=" + map.getZoom() + "'>Permanent link to these settings</a>";
	}
}

function object_to_urlstring(obj,index) {
	var str = '';
	var ind = '';
	if(index!=undefined) ind='['+index+']';
	for(var key in obj) {
		if(key == "pos") {
			str+="&lat"+ind+"="+Math.round(obj.pos.lat(),7);
			str+="&lng"+ind+"="+Math.round(obj.pos.lng(),7);
		} else {
			if(default_det[key]!=undefined) {
				if(isArray(obj[key])) {
					if(arraysEqual(obj[key],default_det[key])==false) {
						str+="&"+key+ind+"="+(obj[key]===true?1:(obj[key]===false?0:obj[key]));		
					}
				} else if((obj[key]!=default_det[key])&&(obj[key]!=null)) {
					str+="&"+key+ind+"="+(obj[key]===true?1:(obj[key]===false?0:obj[key]));
				}
			} else {
				if(obj[key]!=null) {
					str+="&"+key+ind+"="+(obj[key]===true?1:(obj[key]===false?0:obj[key]));			
				}
			}
		}
	}
	return str;
}

function generatelink(linkdata) {
	waitingforlink = true;
	document.getElementById("wait").innerHTML = "<img src='progress.gif'>";
	var generator_window = window.open("","NUKEMAP linker","width=100,height=100,location=0,menubar=0,status=0",false);
	if(!generator_window.opener) generator_window.opener = this.window;
	generator_window.document.write("<html><head><title>NUKEMAP linker</title></head>");
	generator_window.document.write("<body onload=\"document.getElementById('myform').submit();\"><form method=\"POST\" id=\"myform\" action=\"http://nuclearsecrecy.com/nukemap/makelink.php\">");
	generator_window.document.write("<input name=\"link\" type=\"hidden\" value=\""+linkdata+"\"/>");
	generator_window.document.write("</form></body></html>");
	generator_window.document.close();
}

function givelink(hash) {
	waitingforlink = false;
	document.getElementById("genlink").innerHTML = "<a href='" + window.location.pathname +"?t="+hash+"'>Permanent link to these settings</a>";
	document.getElementById("wait").innerHTML = "";
}

function centercursor() {
	marker.setPosition(map.getCenter());
}

function dropmarker(pos) {
	if(marker) {
		if(marker_event_zoom_changed) google.maps.event.removeListener(marker_event_zoom_changed);
		if(marker_event_dragend) google.maps.event.removeListener(marker_event_dragend);
		marker.setMap(null);
		marker = null;
	}
	
	marker = new google.maps.Marker({
	  map: map,
	  position: pos,
	  draggable: true,
	  icon: {
	    url: "images/nuke-marker.png",
        scaledSize: new google.maps.Size(24, 38),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(12,36),
	  },
	  title: 'Drag me to target\n('+Math.round(pos.lat(),3)+", "+Math.round(pos.lng(),3)+")",
      animation: google.maps.Animation.DROP,
	});	

	marker_event_zoom_changed = google.maps.event.addListener(map, 'zoom_changed', function() {
			if(document.getElementById("permalink")) {
				document.getElementById("permalink").innerHTML = permalink();
			}
	});	

	marker_event_dragend = google.maps.event.addListener(marker, 'dragend', function() {
			var pos = marker.getPosition();
			if(det_index) dets[det_index].pos = marker.getPosition();
			marker.setTitle('Drag me to target\n('+Math.round(pos.lat(),3)+", "+Math.round(pos.lng(),3)+")");
			
			update_permalink();
			if(sample_marker) update_sample();
	});

	
	
}

//updates the permalink
function update_permalink() {
	if(document.getElementById("permalink")) {
		document.getElementById("permalink").innerHTML = permalink();
	}
}

//in grayscale mode, makes sure that the interface icons don't go grayscale as well (they default to it, because of how google maps deals with grayscale)
function fixmarkercolor() {
	if(grayscale) {
		$("img").each(function() {
			if(this.src.substr(0,basepath.length+7)==basepath+"images/") $(this).addClass("ungrayscale");
		});
	}
}

//"detaches" the current marker from the rings, allows for a new detonation to be attached to a new marker
function detach(preserve_det) {
	pos = marker.getPosition();
	stop_fallout();
	if(preserve_det!==true) {
		if(dets[det_index]!=undefined){ //avoids "phantom" dets with no data in them
			det_index++;
			dets[det_index] = {};
		}
	}
	dropmarker(pos);
}


//goes to a lat/lng (based on string: lat,lng)
function jumpcity(where) {
	lat = where.substr(0,where.indexOf(","));
	lng = where.substr(where.indexOf(",")+1,where.length);
	if(lat&&lng) {
		map.setZoom(12);
		marker.setPosition(new google.maps.LatLng(lat, lng));
		map.setCenter(marker.getPosition());
		move_windsock();
		draw_fallout();
	}
}

//changes the various weapons fields based on the preset dropdown
function updatefrompreset(data) {
	var d = data.split(",");
	var yield = d[0];
	var airburst = d[1];
	var fission = d[2];
	if(d[3]!=undefined) {
		var hob = d[3];
	}
	document.getElementById("theKt").value = yield;	
	if(airburst=="1") {
		document.forms.options.hob[0].checked = true;
		if(hob) {
			document.getElementById("hob_option_height").checked = true;
			document.getElementById("hob_h").value = hob;
			document.getElementById("hob_h_u").value = 0;
		} else {
			document.getElementById("hob_option_opt").checked = true;
		}
	} else {
		document.forms.options.hob[1].checked = true;
	}
	document.getElementById("fallout_fission").value = fission;	
}


function clearmap() {
	kt = false;
	for(var i=0;i<=det_index;i++) {
		if(c_radii[i]!==undefined) {
			if(c_radii[i].length) {
				for(var c=0;c<c_radii[i].length;c++) {
					c_radii[i][c].setMap(null);
				}
			}
		}
	}
	det_index = 0;
	dets = [];

	/*for(var i=1;i<=9;i++) {
		if(special_loaded[i]) { if(special[i].getVisible()) special[i].setVisible(false); };
	}*/
	
	if(placeMarkers!==undefined) {
		if(placeMarkers.length) {
			for(var i=0; i<placeMarkers.length;i++) {
				placeMarkers[i].setMap(null);
			}
			placeMarkers=[];
		}
	}
	if(fallout_contours.length) {
		for(var i=0;i<fallout_contours.length;i++) {
			if(fallout_contours[i]) {
				if(fallout_contours[i].length) {
					for(var x=0;x<fallout_contours[i].length;x++) {	
						fallout_contours[i][x].setMap(null);
					}
				}
			}
		}
		fallout_contours = [];
		stop_fallout();
	}
}

function init(mapCenter, mapZoom) {
    geocoder = new google.maps.Geocoder();
	if(!mapCenter) {
		if(google.loader.ClientLocation) {
			//searches for closest major city, based on population currently (future: include country capitals, US state capitals)
			var closest = find_closest(google.loader.ClientLocation.latitude,google.loader.ClientLocation.longitude);
			if(closest) {
				mapCenter = new google.maps.LatLng(closest[0],closest[1]);
				if(debug) console.log("Client location chosen from city list");	
			} else {
	      		mapCenter = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
				if(debug) console.log("Client location from ClientLocation");
			}
		} else { //try http://freegeoip.net/json/{IP} ?
			mapCenter = new google.maps.LatLng(40.72422, -73.99611);
			if(debug) console.log("Could not geolocate user");
		}
	}


	if(google.loader.ClientLocation) {
		user_country = google.loader.ClientLocation.address.country_code;
		user_location = google.loader.ClientLocation.latitude+","+google.loader.ClientLocation.longitude;
	}
	if(user_country=="US") current_unit = "mi";
		
	if(!mapZoom) {
		mapZoom = 12;
	}
	
	map = new google.maps.Map(document.getElementById('theMap'), {
	  'zoom': mapZoom,
	  'center': mapCenter,
	  //'mapTypeId': google.maps.MapTypeId.HYBRID,
	  'mapTypeId': google.maps.MapTypeId.TERRAIN,
	  'styles': normal_style,
	  'scaleControl': true,
	  'streetViewControl': false
	});

	//map.setOptions({styles: [{ "stylers": [ { "saturation": -100 } ] },{ "featureType": "water", "stylers": [ { "lightness": -30 } ] } ]});

	service = new google.maps.places.PlacesService(map);

	dropmarker(mapCenter);
}

function add_sample_marker(button_id) {
	if(sample_marker) {
		sample_marker.setMap(null);
		if(sample_drag_listener) google.maps.event.removeListener(sample_drag_listener);
		if(button_id) document.getElementById(button_id).innerHTML = "Probe location";
		sample_marker = null;
	} else {

		var pos = marker.getPosition();
	
		var angle = 45; //default angle
		var R = 6371; // km

		var d = (16-map.getZoom())*2-1; //km

		var lat1 = pos.lat()*deg2rad;
		var lon1 = pos.lng()*deg2rad;
		var brng = (angle)*deg2rad;
		var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + 
					  Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
		var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), 
							 Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));	

		sample_marker = new google.maps.Marker({
		  map: map,
		  draggable: true,
		  icon: 'images/pegman.png',
		  shadow: { url: 'images/pegman-shadow.png',
					size: new google.maps.Size(18,32),
					origin: new google.maps.Point(0,0),
					anchor: new google.maps.Point(9,31)
				},	
		  title: 'Drag me to sample conditions at a given position',
		  animation: google.maps.Animation.DROP,
		  position: new google.maps.LatLng(lat2*rad2deg, lon2*rad2deg),
		});

		

		sample_drag_listener = google.maps.event.addListener(sample_marker, 'dragend', function () {
			update_sample();
		});
		
		if(button_id) document.getElementById(button_id).innerHTML = "Remove info marker";
		
		update_sample();
	}
}

function update_sample() {
	var sample_info = document.getElementById("sample_info");
	var o='';
	if(dets[0]&&sample_marker&&dets[0].kt) {	
		o+= "<hr><b>Information at sample point:</b><br>";
		var sample_pos = sample_marker.getPosition();
		o+= "<ul>";	
		if(det_index>5) {
			var only_nonzero = true;
		} else {
			var only_nonzero = false;
		}
		for(var i=0;i<=det_index;i++) {
			oo='';
			var non_zero = false;
			var dets_to_display = 0;
			if(dets[i].kt) {
				var dist_km = distance_between(dets[i].pos.lat(), dets[i].pos.lng(), sample_pos.lat(),sample_pos.lng());
				var dist_mi = dist_km*km2mi;
				if(dets[i].airburst&&dets[i].hob_opt>0&&dets[i].hob_ft) {
					var slant_dist_mi = Math.sqrt(Math.pow(dets[i].hob_ft*ft2mi,2)+Math.pow(dist_mi,2));
				}
				if(det_index>0) {
					oo+="<li>Sample point is "+distance(dist_km)+ " from ground zero #"+(i+1)+" ("+ktOrMt(dets[i].kt)+"s)";
					if(dets[i].airburst&&dets[i].hob_opt>0&&dets[i].hob_ft) {
						oo+=" (slant range "+distance(slant_dist_mi*mi2km)+")";
					}
					oo+=".";		
					if(dets[i].kt>20000) {
						oo+=" (unreliable for yields >20 Mt!)";
					} else if(dets[i].kt<1) {
						oo+=" (unreliable for yields <1 kt!)";
					}
					oo+="</li>";
				} else {
					oo+="<li>Sample point is "+distance(dist_km)+" from "+(det_index>0?"current":"")+" ground zero"
					if(dets[i].airburst&&dets[i].hob_opt>0&&dets[i].hob_ft) {
						oo+=" (slant range "+distance(slant_dist_mi*mi2km)+")";
					}
					oo+=".";
					if(dets[i].kt>20000) {
						oo+=" (unreliable for yields >20 Mt!)";
					} else if(dets[i].kt<1) {
						oo+=" (unreliable for yields <1 kt!)";
					}
					oo+="</li>";
				}
				oo+="<ul>";
				
				oo+="<li>Overpressure: ";
				if(dets[i].airburst) {
					if(dets[i].hob_ft&&dets[i].hob_opt>0) {
						var psi = bc.psi_at_distance_hob(dist_km*km2ft,dets[i].kt,dets[i].hob_ft);
					} else {
						var psi = bc.maximum_overpressure_psi(bc.scaled_range(dist_mi,dets[i].kt),dets[i].airburst);
					}		
				} else {
					var psi = bc.psi_at_distance_hob(dist_km*km2ft,dets[i].kt,0);
				}
				if(!Math.round(psi)) {
					if(psi[0]=="+") {
						oo+=psi+" psi";
						non_zero = true;
					} else if(dets[i].hob_ft||!dets[i].airburst) {
						oo+="0 psi";
					} else {
						if(dist_mi > bc.psi_distance(dets[i].kt,1,dets[i].airburst)) {
							oo+="0 psi";
						} else { 
							oo+="+200 psi";
							non_zero = true;
						}						
					}
				} else {
					oo+=addCommas(Math.round(psi))+" psi";
					non_zero = true;
				}
				oo+="</li>";
				if(!dets[i].airburst||dets[i].hob_ft===0) { //I have no idea how to translate wind velocity to arbitrary airbursts, so let's just stick to surface
					oo+="<li>Maximum wind velocity: ";
					var mph = bc.maximum_wind_velocity_mph(bc.scaled_range(dist_mi,dets[i].kt),false);
					if(!Math.round(mph)) {
						if(dist_mi > bc.psi_distance(dets[i].kt,1,dets[i].airburst)) {
							oo+="0 mph";
						} else {
							oo+="+3,000 mph";
							non_zero = true;
						}
					} else {
						oo+=Math.round(mph)+" mph";
						non_zero = true;
					}
					oo+="</li>";
				}	
				oo+="<li>Initial radiation dose: ";
				if(dets[i].airburst&&dets[i].hob_ft&&dets[i].hob_opt>0) { //get slant distance
					checkdist = slant_dist_mi;
				} else {
					checkdist = dist_mi;
				}
				if(dets[i].kt>20000) {
					oo+=" <small>cannot calculate for yields greater than 20 Mt</small>"
				} else {
					var rem = bc.initial_nuclear_radiation(checkdist,dets[i].kt,dets[i].airburst);
					if(!Math.round(rem)) {
						if(checkdist > bc.initial_nuclear_radiation_distance(dets[i].kt,1,dets[i].airburst)) {
							oo+="0 rem";
						} else { 
							oo+="<small>too close to ground zero (potentially +20,000 rem)</small>";
							non_zero = true;						
						}
					} else if (rem>20000){ 
						oo+="<small>too close to ground zero (potentially +20,000 rem)</small>";
						non_zero = true;
					} else {
						oo+=addCommas(Math.round(rem))+" rem";
						non_zero = true;
					}
				}
				oo+="</li>";

				oo+="<li>Thermal radiation: ";
				if(dets[i].airburst&&dets[i].hob_ft&&dets[i].hob_opt>0) { //get slant distance
					checkdist = slant_dist_mi;
				} else {
					checkdist = dist_mi;
				}	
				var therm = bc.thermal_radiation_q(checkdist,dets[i].kt,dets[i].airburst);
				if(!Math.round(therm,1)) {
					if(dist_mi > bc.thermal_distance(dets[i].kt,"_1st-50",dets[i].airburst)) {
						oo+="0 cal/cm&sup2;";
					} else { 
					console.log(dist_mi,bc.thermal_distance(dets[i].kt,"_noharm-100",dets[i].airburst),bc.thermal_radiation_q(dist_mi,dets[i].kt,dets[i].airburst));
						oo+="<small>too close to ground zero (potentially +350,000 cal/cm&sup2;)</small>";
						non_zero = true;
					}
				} else {
					oo+=addCommas(Math.round(therm,1))+" cal/cm&sup2;";
					non_zero = true;
				}
				oo+="</li>";

				oo+="</ul>";
			}
			if(!only_nonzero) {
				o+=oo;		
				dets_to_display++;	
			} else if (non_zero==true) {
				o+=oo;
				dets_to_display++;	
			} else {
				oo='';
			}
		}
		if(dets_to_display==0) o+="<li>None of your detonations have measurable immediate effects at the selected point.</li>";
		o+="</ul>";
	}
	if(det_index>0) {
		o+="<small>Note: The effects are kept separate here for multiple detonations, because they don't necessarily add up in a linear fashion.";
		if(only_nonzero) o+=" Also, because there are so many detonations in your current simulation, information is only shown when it has non-zero values.";
		o+="</small>";
	}
	sample_info.innerHTML = o;

}

function jumptocitytext() {
    var address = document.getElementById("jumptocity").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
		map.setZoom(12);
		marker.setPosition(results[0].geometry.location);
		map.setCenter(marker.getPosition());
		move_windsock();
		draw_fallout();
      };
    });
}

//single or multiple
function permalinks_to_det(permalink_array) {
	var p = permalink_array;
	if(p["kt"]==undefined) return false;
	if(isArray(p["kt"])) {
		var pp = [];
		for(var i=0;i<p["kt"].length;i++) {
			for(var key in p) {
				if((p[key][i]!==undefined)&&(key!="zm")) {
					pp[key] = p[key][i];
				}
			}
			permalinks_to_det(pp);
		}
	} else {
		//one
		if(dets[det_index]!=undefined) det_index++;
		var det_obj = clone(default_det);
		for(var i in p) {
			switch(i) {
				case "zm":
					//ignore
				break;
				case "lat": case "lng":
					det_obj["pos"] = new google.maps.LatLng(parseFloat(p["lat"]), parseFloat(p["lng"]));
				break;
				case "psi":case "rem": case "therm": case "fallout_rad_doses":
					det_obj[i] = p[i].split(",");
				break;
				default:
					if((default_det[i]===true)||(default_det[i]===false)) {
						det_obj[i] = p[i]=="1"?true:false;
					} else {
						det_obj[i] = parseFloat(p[i]);
					}
				break;
			}
		}
		dets[det_index] = clone(det_obj);
		dets[det_index].linked = true;
	}
}

function loadingDiv(toggle) {
	if(toggle) {
		var d = document.createElement('DIV');
		d.id = "loadingDiv";
		d.innerHTML = "<h2>Loading permalink settings... <img src='images/progress.gif'/></h2><small><a href='http://nuclearsecrecy.com/nukemap/'>Click here to cancel.</a>";
		document.getElementById("bottomFrame").appendChild(d);
	} else {
		var d =	document.getElementById("loadingDiv");
		d.parentNode.removeChild(d);
	}
}

function hash_request(hash) {
	$.ajax({
	  type: "POST",
	  dataType: "json",
	  url: "permalink.php",
	  data: { t: hash },
	  success: function(data) {
		if(data.status=="SUCCESS") {
			var u = getUrlVars(data.link);
			permalinks_to_det(u);
			if(dets.length) {
				init(dets[dets.length-1].pos,parseInt(u["zm"]));
				for(var i = 0; i<dets.length;i++) {
					launch(true,dets[i],i);
					if(i<dets.length-1) {
						detach(true);
					}
				}
				document.getElementById('theKt').value = dets[det_index].kt;
				loadingDiv(false);
			} else {
				console.log(data);
				loadingDiv(false);		
				alert("There was an unspecified error loading the link you followed. Sorry.");
				init();
			}
		} else {
			loadingDiv(false);
			alert("There was an error loading the link you followed. Error message: "+data.error);
			init();
		}	  
	  }
	});
}

//generates a permalink hash
function fetchHash() {
	document.getElementById("permalink").innerHTML = "Generating permalink... <img src='images/progress.gif'/>";

	var perms = '';
	for(var i=0;i<=det_index;i++) {
		perms+=object_to_urlstring(dets[i],i);
	}
	perms+="&zm=" + map.getZoom();

	$.ajax({
	  type: "POST",
	  dataType: "json",
	  url: "permalink.php",
	  data: { link: perms },
	  success: function(data) {
		if(data.status=="SUCCESS") {
			document.getElementById("permalink").innerHTML = "<a href='"+window.location.pathname+"?t="+data.hash+"'>Permanent link to these settings</a>";
		} else {	
			document.getElementById("permalink").innerHTML = "<a href='#' onclick='fetchHash();'>Generate permanent link to these settings</a>"
			alert("There was an error creating the link. Please try again. Error message: "+data.error);
		}
	  }
	});	

}

//converts an airburst to a surface burst
function switch_to_surface() {
	dets[det_index].airburst = false;
	launch(true,dets[det_index],det_index);
}


//toggles a map overlay
function map_logo(remove) {
	if(!remove) {

		/*
		logo = document.createElement('div');
		logo.id = "logo";
		logo.innerHTML = "<big>NUKEMAP</big><sub>"+ver+"</sub>";	
		$("#theMap").appendChild(logo);
		*/

		logoDiv = document.createElement('div');
		var LogoControl = new logoControl(logoDiv, map);
		logoDiv.index = 1;
		map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(logoDiv);

	} else {
		map.controls[google.maps.ControlPosition.BOTTOM_LEFT].clear();
	
/*		logo.style.display = "none";
		logo.innerHTML = "";
		logo = "";*/
	}
}

function logoControl(controlDiv, map) {
  // Set CSS for the control interior
  var logoText = document.createElement('div');
  logoText.id = 'logo';
  logoText.innerHTML = "<big>NUKEMAP</big><sub>"+ver+"</sub>";
  controlDiv.appendChild(logoText);
}


//allows you to disable some aspects of interface so you can embed it
function applyLite(settings) {
	var oSettings = settings.split(",");
	if(oSettings.length>0) {
		$("#endnote").html("<hr><small>You are viewing an embedded version of the NUKEMAP with some of its options or interface limited. For the full NUKEMAP, please <a href='http://nuclearsecrecy.com/nukemap/'>visit the NUKEMAP homepage</a>.</small>");
	}
	for(i in oSettings) {
		switch(oSettings[i]) {
			case "city":
				$("#city").hide();
				$("#city_hr").hide();
				$("#numbered_2").html(parseInt($("#numbered_2").html())-1);
				$("#numbered_3").html(parseInt($("#numbered_3").html())-1);
				$("#numbered_4").html(parseInt($("#numbered_4").html())-1);
			break;
			case "city_preset":
				$("#city_preset").hide();
			break;
			case "city_input":
				$("#city_input").hide();
			break;
			case "yield":
				$("#yield_div").hide();
				$("#yield_hr").hide();
				$("#numbered_3").html(parseInt($("#numbered_3").html())-1);
				$("#numbered_4").html(parseInt($("#numbered_4").html())-1);
			break;
			case "yield_preset":
				$("#preset").hide();
				$("#preset_br").hide();
			break;
			case "faq":
				$("#faq_line").hide();
			break;
			case "nm3d":
				$("#nukemap3d").hide();
			break;
			case "options":
				$("#basic_options_hr").hide();
				$("#basic_options").hide();
				$("#numbered_4").html(parseInt($("#numbered_4").html())-1);
			break;
			case "advoptions":
				$("#adv_options_hr").hide();
				$("#adv_options").hide();
			break;
			case "social":
				$("#shares_hr").hide();
				$("#shares").hide();
			break;
			case "otheroptions":
				$("#other_options_hr").hide();
				$("#other_options").hide();
			break;
			case "footer":
				$("#footer_hr").hide();
				$("#footer").hide();
			break;
			case "b_clear":
				$("#button_clear").hide();
			break;
			case "b_probe":
				$("#button_probe").hide();
			break;
			case "b_center":
				$("#button_center").hide();
			break;
			case "b_detach":
				$("#button_detach").hide();
			break;
			case "b_other":
				$("#buttons_other").hide();
			break;
			case "b_note":
				$("#button_note").hide();
			break;
			case "detonate":
				$("#detonate_div").hide();
			break;
			case "permalink":
				$("#thePermalink").hide();
			break;
			case "legend_hr":
				hide_legend_hr = true;
			break;
			case "legend":
				$("#theLegend").hide();
			break;
			case "fallout":
				$("#theLegendFallout").css("display","none");
			break;
			case "places":
				$("#theLegendPlaces").hide();
			break;
			case "small":
				var newWidth = 250;
				$("#topFrame").css("width",newWidth-10);
				$("#theLegend").css("font-size","9pt");
				$("#createdby").css("font-size","10pt");
				$("#theMap").css("right",newWidth+20);
				$("#topFrame").css("width",newWidth-10);
				$("#bottomFrame").css("width",newWidth-10);
				$("#theSettings").css("width",newWidth);
				$("#theSettings").css("width",newWidth);
			break;						
			case "classic":
				$("#classic_link").hide();
				$("#classic_link_hr").hide();
			break;
			case "minify":
				$('#topFrame').hide();
				$('#bottomFrame').hide();
				$('#theSettings').addClass('settingsMin');
				$('#theMap').addClass('mapMax');
				$('#hiddenFrame').show();
				map_logo(0);
			break;
		}
	}
}

//tries to load detonations in an external file
function loadExternalDets(det_file) {
	$.ajax({
	  type: "GET",
	  dataType: "jsonp",
	  url: "../nukemap_shared/loadtxt.php",
	  data: { file: det_file },
	  success: function(data) {
		if(data.status=="SUCCESS") {
			var pt = data.txt;
		} else {
			console.log("Could not load external file -- error: "+data.status);
			var pt = "";
		}
		var u = getUrlVars(pt);
		permalinks_to_det(u);
		if(dets.length) {
			init(dets[dets.length-1].pos,parseInt(u["zm"]));
			for(var i = 0; i<dets.length;i++) {
				launch(true,dets[i],i);
				if(i<dets.length-1) {
					detach(true);
				}
			}
			document.getElementById('theKt').value = dets[det_index].kt;
			loadingDiv(false);
		} else {
			init();
			loadingDiv(false);		
		}
	}
  })
}

function getlocalwind() {
    var loc = marker.getPosition();
	var url = "//api.openweathermap.org/data/2.5/weather?lat="+loc.lat()+"&lon="+loc.lng()+"&units=imperial&appid=8a6e14520bf547360b7885f3d7d3df66";

	$.ajax({
	  url: url
	  })
	  .done(function( data ) {
	  	if(data) {
	  		console.log("OpenWeatherMap",data);
	  		if(data.wind) {
                if(!data.wind.deg) {
                    alert("Could not determine the local wind direction for that position -- sorry. Try again nearby.")
                } else {
    	  			$("#fallout_angle").val(Math.round(data.wind.deg));
    	  		}
    	  		if(!data.wind.speed) {
                    alert("Could not determine the local wind speed -- sorry.")
                } else {
    	  			$("#fallout_wind").val(Math.round(data.wind.speed));
                }
				update_fallout();
	  		} else {
                alert("Sorry, for some reason, the application could not retrieve local wind conditions.");	  		
	  		}
            $("#wind_prog").html("");
            $("#get_local_wind").show();
	  	} else {
	  	    alert("Sorry, for some reason, the application could not retrieve local wind conditions.");
            $("#wind_prog").html("");
            $("#get_local_wind").show();
	  	}
	  });
}

function update_fallout() {
	if(dets[det_index]) {
		dets[det_index].fallout_wind = $("#fallout_wind").val();
		dets[det_index].fallout_angle = $("#fallout_angle").val();
		dets[det_index].ff = $("#fallout_fission").val();
		if(dets[det_index].fallout) {
			if(dets[det_index].hob_ft&&dets[det_index].airburst) {
				do_fallout(dets[det_index].kt,dets[det_index].fallout_wind,dets[det_index].ff,dets[det_index].fallout_angle,"theLegendFallout",dets[det_index].airburst,dets[det_index].hob_ft);
			} else {
				do_fallout(dets[det_index].kt,dets[det_index].fallout_wind,dets[det_index].ff,dets[det_index].fallout_angle,"theLegendFallout",dets[det_index].airburst);
			}
		}
		update_permalink();
	}
}

//simple linear interpolation -- returns x3 for a given y3
function lerp(x1,y1,x2,y2,y3) {
	if(y2==y1) {
		return false; //division by zero avoidance
	} else {
		return ((y2-y3) * x1 + (y3-y1) * x2)/(y2-y1);
	}
}
var cine_canvas;
function run_cinematic() {
	if(!cine_canvas) {
		$("#theMap").prepend("<canvas id='cine_canvas' style='position:absolute; z-index:10000000; pointer-events:none;'></canvas>");
		cine_canvas = document.getElementById("cine_canvas");
	}
	mapX = $("#theMap").width();
	mapY = $("#theMap").height();
	$("cine_canvas").width(mapX);
	$("cine_canvas").height(mapY);

	var ctx = cine_canvas.getContext("2d");
	ctx.beginPath();
	ctx.rect(0, 0, mapX, mapY);
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	ctx.fill();


}

if (typeof register == 'function') { register("nukemap2.js"); }