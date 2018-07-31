var changeInterval = 20;
var totalTime = 1000*5;
var odometer = true;
var popDebug = false;

var totalInjuries=0;
var totalFatalities=0;
var currentNumber;

var popTimerTimeout = 1000*60*2;

var waiting_for_pop = [];

var faq_link = "http://nuclearsecrecy.com/nukemap/faq/#casualties";

function casualty_wait_message() {
}

function get_casualties(lat,lng,kt,airburst,hob_opt,hob_ft,div,index) {
	$("#"+div).html("<hr>Calculating casualties... this can take upwards of a minute or two depending on how many people are using this site. Thank you for your patience! <span id='progress'></span>");
	if(!index) {
		if(det_index>1) {
			for(var i=det_min;i<det_index;i++) {
				if(dets[i].fatalities==undefined||dets[i].casualties==undefined) {
					get_casualties(dets[i].lat,dets[i].lng,dets[i].kt,dets[i].airburst,dets[i].hob_opt,dets[i].hob_ft,div,i);
				}
			}
		}
	}
	
	if(!index) index = det_index;
	if(!admin) admin = 0;
	
	totalInjured = 0;
	totalFatalities = 0;
	var pop_request = {lat:lat,lng:lng,kt:kt,airburst:airburst?1:0,hob_opt:hob_opt?1:0,hob_ft:hob_ft,div:div,index:index};
	waiting_for_pop[index] = true;
	var poptimeout = window.setTimeout(pop_timer,popTimerTimeout,index,pop_request);
	url = "../";
	$.ajax({
		type:"GET",
		dataType: "jsonp",
		url:url+"nukemap_shared/casualties.php",
		data: { lat: lat, lng: lng, kt: kt, airburst: airburst?1:0,hob_opt:hob_opt?1:0,hob_ft:hob_ft, index: index, admin:admin },
	})
	.done(function(result) {
		waiting_for_pop[index] = false;
		var r = result;
		//console.log(r);
		if(popDebug) console.log(r);
		if(r.status=="SUCCESS") {
			totalInjuries = Math.round(r.injuries);
			totalFatalities = Math.round(r.fatalities);
			if(popDebug) { 
				if(r[1]!==undefined) {
					if(r[1].data!==undefined) {
						dots(r[1].data); 
					}
				}
			}
			dets[r.index].fatalities = totalFatalities;
			dets[r.index].injuries = totalInjuries;
			dets[r.index].psi_1 = r.psi_1;

			currentNumber = 0;
			var info_div = "<div id='casualty_info'>";
				if(dets[det_index].psi_1) {
					info_div+= "In any given 24-hour period, there are approximately "+addCommas(Math.round(dets[det_index].psi_1))+" people in the 1 psi range of the most recent detonation. ";
				}
				info_div+= "<hr>Modeling casualties from a nuclear attack is difficult. These numbers should be seen as evocative, not definitive. Fallout effects are ignored. For more information about the model, <a href='"+faq_link+"'>click here</a>.";
				info_div+="</div>";

			if(det_index>det_min) {
			var running_total = "";
				running_total+="<div id='running_total'><small>RUNNING TOTAL FOR "+(det_index+1-det_min)+" DETONATIONS</small><br>";
				running_total+="Estimated fatalities: <span class='casualty' id='fatalities_total'>0</span>Estimated injuries: <span class='casualty'  id='injuries_total'>0</span>";
				running_total+="</div>";
				running_total+="<small>MOST RECENT DETONATION</small><br>";
				var runningFatalities = 0;
				var runningInjuries = 0;
				for(var i=det_min;i<=det_index;i++) {
					if(dets[i].fatalities) {
						runningFatalities+=dets[i].fatalities;
					}
					if(dets[i].injuries) {
						runningInjuries+=dets[i].injuries;
					}
				}
			} else {
				running_total = "";
			}

			if(odometer) {
				var o = "<hr>"+running_total;
					if(dets[det_index].fatalities==undefined) {
						o+="Still calculating...";
					} else {
						o+="Estimated fatalities: <span class='casualty' id='fatalities'>0</span>Estimated injuries: <span class='casualty' id='injuries'>0</span>";
					}
					o+= info_div;
				$("#"+div).html(o);
				if(dets[det_index].fatalities!==undefined) {
					countThem(Math.round(dets[det_index].fatalities,-1), changeInterval, totalTime, $('#fatalities'));    
					countThem(Math.round(dets[det_index].injuries,-1), changeInterval, totalTime, $('#injuries')); 
				}
				if(runningFatalities) countThem(Math.round(runningFatalities,-1),changeInterval,totalTime,$("#fatalities_total"));
				if(runningInjuries) countThem(Math.round(runningInjuries,-1),changeInterval,totalTime,$("#injuries_total"));
			} else {
				$("#"+div).html("<hr>Estimated fatalities: <span id='fatalities'>"+addCommas(totalFatalities)+"</span>Estimated injuries: <span id='injuries'>"+addCommas(totalInjuries)+"</span>"+info_div);
			}
		} else {
			var msg = "<hr>Sorry, casualties could not be estimated.";
			if(r!=undefined) {
				if(r.error!=undefined) {
					msg+=" Error message: " + r.error;
				} else {
					msg+=" There was no further error message to report. The population database may be down. Try again later.";
				}
			} else {
				msg+=" There was no further error message to report. The population database may be down. Try again later.";
				
			}
			$("#"+div).html(msg);
		}
	}).error(function(jqxhr,textStatus,errorThrown) {
		if(errorThrown) {
			$("#"+div).html("<hr>Sorry, casualties could not be estimated. Error message: AJAX request error \""+errorThrown+"\"");
			if(popDebug) console.log(jqxhr,textStatus,errorThrown);
			if(popDebug) {
				var output = '';
				for (property in jqxhr) {
				  output += property + ': ' + jqxhr[property]+'; ';
				}
				console.log(output);	
			}

		} else {
			$("#"+div).html("<hr>Sorry, the request to the casualty database timed out, probably a lot of other people are making requests of it at the moment. Please feel free to try again, though.");		
			if(popDebug) console.log(jqxhr,textStatus,errorThrown);
			if(popDebug) {
				var output = '';
				for (property in jqxhr) {
				  output += property + ': ' + jqxhr[property]+'; ';
				}
				console.log(output);	
			}
		}
	});
}

function pop_timer(d_index,pop_info) {
	if(d_index==det_index&&pop_info.kt==dets[det_index].kt) { //try to cancel out multiple calls
		if(waiting_for_pop[d_index]==true) {
			document.getElementById(pop_info.div).innerHTML = document.getElementById(pop_info.div).innerHTML+" ...Hmm. The casualties estimator request is taking an unusually long time to process. Sorry about that!";
		}
	}
}

function get_casualties_again(lat,lng,kt,airburst,hob_opt,hob_ft,div) {
	get_casualties(lat,lng,kt,airburst,hob_ft,div);
}

function countThem(total, delay, totalTime, element, decimals) {
    var number = 0,
    startTime = newTime = new Date();

    decimals = 0;

    element.html(addCommas(number));

    var interval = setInterval(function() {    	
        newTime = new Date();
        number = Math.min(total * ((newTime - startTime) / totalTime), total);

        number = Math.round(number);

		element.html(addCommas(number));
        if(number >= total) {
            clearInterval(interval);
        }
    }, delay);
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

var popdots = [];

function dots(data) {
	if(popdots.length) {
		for(var i=0; i<popdots.length;i++) {
			popdots[i].setMap(null);
		}
		popdots=[];
	}
	for(var i=0;i<data.length;i++) {
		popdots.push(new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng(data[i][0], data[i][1]),
			icon: {
  			  path: google.maps.SymbolPath.CIRCLE,
			  scale: 4,
			  fillColor: "#"+colorStep(data[i][2],15000,"FFFF00","FF0000","800000","000000"), 
			  fillOpacity: 1,
			  strokeColor: '#bd8d2c',
			  strokeWeight: 1
			},
			title: data[i][2],
		}));	
	}

}

if (typeof register == 'function') { register("casualties.js"); }