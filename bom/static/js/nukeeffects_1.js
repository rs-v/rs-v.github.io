/* NukeEffects class by Alex Wellerstein */
/* Last updated: 8/2015      */
/* 

		Many of the effects equations come from:

							  E. Royce Fletcher, Ray W. Albright, Robert F.D. Perret, 
							  Mary E. Franklin, I. Gerald Bowen, and Clayton S. White, 
							  "NUCLEAR BOMB EFFECTS COMPUTER (Including Slide-rule Design
							  and Curve Fits for Weapons Effects)," (CEX-62.2) U.S. Atomic Energy Commission
							  Civil Effects Test Operations, February 1953.

		The cloud effects equations mostly come from:
		
							  Carl F. Miller, "Fallout and Radiological Countermeasures, Volume 1,"
							  SRI Project No. IM-4021, January 1963.				
		
		Some of the thermal radiation, cloud effects, and airburst blast pressures come from fitting curves on figures in:
							  
							  Samuel Glasstone and Philip J. Dolan, THE EFFECTS OF NUCLEAR WEAPONS, 1977 edn.

	 	No warranties or guarantees offered! 
	
*/							  

var bc = new NukeEffects();

function NukeEffects () {
	this.ambient_pressure = 14.7; //psi

	this.error = undefined;
	var debug = false;	
	var eq = [];
	this.debug = function(status) { debug = status; console.log("DEBUG = "+status);} 
	
	/* BLAST CHARACTERISTICS */
	
	//Eq. 2.4 - maximum overpressure at 0 feet; input is scaled range; output in psi
	eq['2-4'] = [];
	eq['2-4']['xmin'] = 0.0472;
	eq['2-4']['xmax'] = 4.82;
	eq['2-4']['args'] = [-0.1877932,-1.3986162,0.3255743,-0.0267036];
	eq['2-4']['desc'] = "Max overpressure (surface): psi from scaled range";

	//Eq. 2.5 - maximum overpressure at 0 feet; input is psi; output in scaled range
	eq['2-5'] = [];
	eq['2-5']['xmin'] = 0.1;
	eq['2-5']['xmax'] = 200;
	eq['2-5']['args'] = [-0.1307982,-0.6836211,0.1091296,-0.0167348];
	eq['2-5']['desc'] = "Max overpressure (surface): scaled range from psi";

	//Eq. 2.19 - maximum overpressure at 100 feet; input is psi; output in scaled range
	eq['2-19'] = [];
	eq['2-19']['xmin'] = 1;
	eq['2-19']['xmax'] = 200;
	eq['2-19']['args'] = [-0.0985896,-.6788230,0.0846268,-.0089153];
	eq['2-19']['desc'] = "Max overpressure (100 ft): scaled range from psi";

	//Eq. 2.25 - maximum overpressure at 200 feet; input is psi; output in scaled range
	eq['2-25'] = [];
	eq['2-25']['xmin'] = 1;
	eq['2-25']['xmax'] = 200;
	eq['2-25']['args'] = [-0.0564384,-0.7063068,0.0838300,-0.0057337];
	eq['2-25']['desc'] = "Max overpressure (200 ft): scaled range from psi";

	//Eq. 2.31 - maximum overpressure at 300 feet; input is psi; output in scaled range
	eq['2-31'] = [];
	eq['2-31']['xmin'] = 1;
	eq['2-31']['xmax'] = 100;
	eq['2-31']['args'] = [-0.0324052,-0.6430061,-.0307184,0.0375190];
	eq['2-31']['desc'] = "Max overpressure (300 ft): scaled range from psi";

	//Eq. 2.37 - maximum overpressure at 400 feet; input is psi; output in scaled range
	eq['2-37'] = [];
	eq['2-37']['xmin'] = 1;
	eq['2-37']['xmax'] = 50;
	eq['2-37']['args'] = [-0.0083104,-0.6809590,0.0443969,0.0032291];
	eq['2-37']['desc'] = "Max overpressure (400 ft): scaled range from psi";

	//Eq. 2.43 - maximum overpressure at 500 feet; input is psi; output in scaled range
	eq['2-43'] = [];
	eq['2-43']['xmin'] = 1;
	eq['2-43']['xmax'] = 50;
	eq['2-43']['args'] = [0.0158545,-0.7504681,0.1812493,-0.0573264];
	eq['2-43']['desc'] = "Max overpressure (500 ft): scaled range from psi";

	//Eq. 2.49 - maximum overpressure at 600 feet; input is psi; output in scaled range
	eq['2-49'] = [];
	eq['2-49']['xmin'] = 1;
	eq['2-49']['xmax'] = 30;
	eq['2-49']['args'] = [0.0382755,-0.8763984,-0.4701227,-0.02046373];
	eq['2-49']['desc'] = "Max overpressure (600 ft): scaled range from psi";

	//Eq. 2.55 - maximum overpressure at 700 feet; input is psi; output in scaled range
	eq['2-55'] = [];
	eq['2-55']['xmin'] = 1;
	eq['2-55']['xmax'] = 20;
	eq['2-55']['args'] = [0.0468997,-0.7764501,0.3312436,-.1647522];
	eq['2-55']['desc'] = "Max overpressure (700 ft): scaled range from psi";
	
	//Eq. 2.61 - maximum overpressure at optimum blast height; input is psi; output in scaled range
	eq['2-61'] = [];
	eq['2-61']['xmin'] = 1;
	eq['2-61']['xmax'] = 200;
	eq['2-61']['args'] = [0.1292768,-0.7227471,0.0147366,0.0135239];
	eq['2-61']['desc'] = "Max overpressure (OBH): scaled range from psi";

	//Eq. 2.60 - maximum overpressure at optimum height of burst; input is scaled range; output in psi
	eq['2-60'] = [];
	eq['2-60']['xmin'] = 0.0508;
	eq['2-60']['xmax'] = 1.35;
	eq['2-60']['args'] = [0.1829156,-1.4114030,-0.0373825,-0.1635453];
	eq['2-60']['desc'] = "Max overpressure (OBH): psi from scaled range";

	//Eq. 2.6 - maximum dynamic pressure at 0 feet; input is scaled range; output in psi
	eq['2-6'] = [];
	eq['2-6']['xmin'] = 0.0615;
	eq['2-6']['xmax'] = 4.73;
	eq['2-6']['args'] = [-1.9790344,-2.7267144,0.5250615,-0.1160756];
	eq['2-6']['desc'] = "Max dynamic pressure (surface): psi from scaled range";
	
	//Eq. 2.62 - maximum dynamic pressure at optimum height of burst; input is scaled range; output in psi
	eq['2-62'] = [];
	eq['2-62']['xmin'] = 0.154;
	eq['2-62']['xmax'] = 1.37;
	eq['2-62']['args'] = [1.2488468,-2.7368746];
	eq['2-62']['desc'] = "Max dynamic pressure (OBH): psi from scaled range";
	
	//Eq. 2.64 - maximum dynamic pressure at optimum height of burst; input is scaled range; output in psi
	eq['2-64'] = [];
	eq['2-64']['xmin'] = 0.0932;
	eq['2-64']['xmax'] = 0.154;
	eq['2-64']['args'] = [-3.8996912,-6.0108828];
	eq['2-64']['desc'] = "Max dynamic pressure (OBH): psi from scaled range";
	
	//Eq. 2.8 - duration of positive overpressure at 0 feet; input is scaled range; output in sec
	eq['2-8'] = [];
	eq['2-8']['xmin'] = 0.0677;
	eq['2-8']['xmax'] = 0.740;
	eq['2-8']['args'] = [-0.1739890,0.5265382,-.0772505,0.0654855];
	eq['2-8']['desc'] = "Duration of positive overpressure (surface): sec from scaled range";

	//Eq. 2.12 - blast wave arrival time at 0 feet; input is scaled range; output in sec
	eq['2-12'] = [];
	eq['2-12']['xmin'] = 0.0570;
	eq['2-12']['xmax'] = 1.10;
	eq['2-12']['args'] = [0.6078753,1.1039021,-0.2836934,0.1006855];
	
	//Eq. 2.16 - maximum wind velocity at 0 feet; input is scaled range; output in mph
	eq['2-16'] = [];
	eq['2-16']['xmin'] = 0.0589;
	eq['2-16']['xmax'] = 4.73;
	eq['2-16']['args'] = [1.3827823,-1.3518147,0.1841482,0.0361427];
		
	//Eq. 2.74 - maximum wind velocity at optimum burst height; input is scaled range; output in mph
	eq['2-74'] = [];
	eq['2-74']['xmin'] = 0.2568;
	eq['2-74']['xmax'] = 1.4;
	eq['2-74']['args'] = [1.7110032,-1.2000278,0.8182584,1.0652528];

	//Eq. 2.76 - maximum wind velocity at optimum burst height; input is scaled range; output in mph
	eq['2-76'] = [];
	eq['2-76']['xmin'] = 0.0762;
	eq['2-76']['xmax'] = 0.2568;
	eq['2-76']['args'] = [3.8320701,5.6357427,6.6091754,1.5690375];

	/* OPTIMUM HEIGHT OF BURST */

	//Eq. 2.78 - optimum height of burst for given overpressure; input is maximum overpressure; output is scaled height
	eq['2-78'] = [];
	eq['2-78']['xmin'] = 1;
	eq['2-78']['xmax'] = 200;
	eq['2-78']['args'] = [3.2015016,-0.3263444];
	
	//Eq. 2.79 - optimum height of burst to maximize overpressure; input is scaled range; output is scaled height
	eq['2-79'] = [];
	eq['2-79']['xmin'] = 0.0512;
	eq['2-79']['xmax'] = 1.35;
	eq['2-79']['args'] = [3.1356018,0.3833517,-0.1159125];
		
	 /* THERMAL RADIATION */
	 
	//Eq. 2.106 - thermal radiation, input is slant range, for airburst, output is Q(1/W); for surface, input is range, output is Q(1/.7W)
	eq['2-106'] = [];
	eq['2-106']['xmin'] = 0.05;
	eq['2-106']['xmax'] = 50;
	eq['2-106']['args'] = [-0.0401874,-2.0823477,-0.0511744,-0.0074958];

	//Eq. 2.108 - thermal radiation, input for airburst is Q(1/W); for surface, is Q(1/.7W); output is distance/slant distance
	eq['2-108'] = [];
	eq['2-108']['xmin'] = 0.0001;
	eq['2-108']['xmax'] = 100;
	eq['2-108']['args'] = [-0.0193419,-0.4804553,-0.0055685,0.0002013];

	//Eq. 2.110 - thermal radiation for 1st degree burns; input is yield, output is Q (cal/cm^2)
	eq['2-110'] = [];
	eq['2-110']['xmin'] = 1;
	eq['2-110']['xmax'] = 100000;
	eq['2-110']['args'] = [0.3141555,0.059904,0.0007636,-0.0002015];

	//Eq. 2.111 - thermal radiation for 2nd degree burns; input is yield, output is Q (cal/cm^2)
	eq['2-111'] = [];
	eq['2-111']['xmin'] = 1;
	eq['2-111']['xmax'] = 100000;
	eq['2-111']['args'] = [0.6025982,0.0201394,0.0139640,0.0008559];
	
	/* Following 5 equations derived from figure 12.65 of Glasstone and Dolan 1977 */

	// These are technically only bound between 1kt and 20 MT but the scaling looks fine enough 
	//Eq. 77-12.65-1st-50 - thermal radiation for 50% probability of an unshielded population for 1st degree burns
	//input is yield, output is Q (cal/cm^2)
	eq['77-12.65-1st-50'] = [];
	eq['77-12.65-1st-50']['xmin'] = 1;
	eq['77-12.65-1st-50']['xmax'] = 20000;
	eq['77-12.65-1st-50']['args'] = [1.93566176470914,0.325315457507999,-0.113516274769641,0.0300971575115961,-0.00330445814836616,0.000129665656335876];

	//Eq. 77-12.65-2nd-50 - thermal radiation for 50% probability of an unshielded population for 2nd degree burns
	//input is yield, output is Q (cal/cm^2)
	eq['77-12.65-2nd-50'] = [];
	eq['77-12.65-2nd-50']['xmin'] = 1;
	eq['77-12.65-2nd-50']['xmax'] = 20000;
	eq['77-12.65-2nd-50']['args'] = [4.0147058823566697E+00,3.7180525416799937E-01,-4.5026131075683193E-02,1.3549565337157871E-02,-1.6559848551158524E-03,7.0380159845451207E-05];

	//Eq. 77-12.65-3rd-50 - thermal radiation for 50% probability of an unshielded population for 3rd degree burns
	//input is yield, output is Q (cal/cm^2)
	eq['77-12.65-3rd-50'] = [];
	eq['77-12.65-3rd-50']['xmin'] = 1;
	eq['77-12.65-3rd-50']['xmax'] = 20000;
	eq['77-12.65-3rd-50']['args'] = [5.9981617647112317E+00,5.3350791551060528E-01,-2.3435878115600033E-02,1.0395274013807305E-02,-1.4366360115630195E-03,6.3930657856814399E-05];
	
	//Eq. 77-12.65-noharm-100 - thermal radiation for 100% probability of an unshielded population for no burns
	//input is yield, output is Q (cal/cm^2)
	eq['77-12.65-noharm-100'] = [];
	eq['77-12.65-noharm-100']['xmin'] = 1;
	eq['77-12.65-noharm-100']['xmax'] = 20000;
	eq['77-12.65-noharm-100']['args'] = [1.14705882353066,0.124659908645308,-0.0160088216223604,0.00359441786929512,-0.000263841056172493,0.0000053050769836388];

	//Eq. 77-12.65-3rd-100 - thermal radiation for 100% probability of an unshielded population for 3rd degree burns
	//input is yield, output is Q (cal/cm^2)
	eq['77-12.65-3rd-100'] = [];
	eq['77-12.65-3rd-100']['xmin'] = 1;
	eq['77-12.65-3rd-100']['xmax'] = 20000;
	eq['77-12.65-3rd-100']['args'] = [7.0018382352996857,.55437306382914320,.056501270479506649,-.015219252753643841,.0017062986685328282,-.000067950215125955893];
	
	
	/* INITIAL NUCLEAR RADIATION */
		
	//Eq. 2.115 - ratio of scaling factor to yield, used for 2.114; input is yield, output is scaling factor
	eq['2-115'] = [];
	eq['2-115']['xmin'] = 10;
	eq['2-115']['xmax'] = 20000;
	eq['2-115']['args'] = [-2.1343121,5.6948378,-5.7707609,2.7712520,-0.6206012,0.0526380];
	
	
	//turns distance (miles) and yield into scaled range
	this.scaled_range = function(distance,yield) {
		return distance*Math.pow(1/yield,1/3)*Math.pow(this.ambient_pressure/14.7,1/3);
	}
	
	//gets distance from scaled range if yield is known
	//returns in miles
	this.distance_from_scaled_range = function(scaled_range,yield) {	
		return scaled_range/Math.pow(1/yield,1/3)*Math.pow(this.ambient_pressure/14.7,1/3);
	}

	//gets yield from scaled range if distance is known
	this.yield_from_scaled_range = function(scaled_range,distance) {
		return 1/Math.pow(scaled_range/distance/Math.pow(this.ambient_pressure/14.7,1/3),3);
	}
	
	//scales from one yield effect to another according to the cube root law
	this.scaled_yield = function(yield,ref_distance,ref_yield) {
		return ref_distance/(Math.pow(ref_yield/yield,1/3));
	}

	//initial nuclear radiation (rem)
	//input is distance (slant range), yield, airburst (bool); output is rem
	this.initial_nuclear_radiation = function(distance,yield,airburst) {	
		var yieldscale = 1;
		if(yield<1) {
			yieldscale = 100;
			yield=yield*yieldscale;
		}
		if(yield<10) {
			var scaling_factor = 1;
		} else {
			var scaling_factor = eq_result('2-115',yield);
		}	
		if(airburst==true) { //scales for surface vs. airbursts
			var surface = 1;
			var density_ratio = .9;
		} else {
			var surface = 2/3;
			var density_ratio = 1;
		}

		//eq. 2-116
		var r = (yield/pow(distance,2))*(4997.41*Math.exp(-9.263158*(density_ratio)*distance)+(surface*1033)*(scaling_factor)*Math.exp(-5.415384 * (density_ratio) * distance));
	
		return r/yieldscale;
	}
	//initial nuclear radiation (distance)
	//input is yield and rem; output is slant range
	//only officially valid range is yield is between 1 and 20 MT, but I have removed the checks on this since the extrapolations don't look completely insane and are better than nothing
	this.initial_nuclear_radiation_distance = function(yield,rem,airburst) {	
		//if(yield>=1&&yield<=20000) {
			if(rem>=1&&rem<=Math.pow(10,8)) {
			
				var a = +0.1237561; var a_ = +0.0143624;
				var b = +0.0994027; var b_ = -0.0000816;
				var c = +0.0011878; var c_ = -0.0000014;
				var d = -0.0002481; var d_ = +0.0054734;
				var e = +0.0000096; var e_ = -0.0003272;
				var f = -0.1308215; var f_ = +0.0000106;
				var g = +0.0009881; var g_ = -0.0001220;
				var h = -0.0032363; var h_ = +0.0000217; //note! h is positive in the original, but this gives nonsense answers
				var i = +0.0000111; var i_ = -0.0000006; //I suspect it is a typo. what annoyance it caused me!
			
				var logI = log10(rem);
				var logI2 = pow(logI,2);
				var logI3 = pow(logI,3);
				var logW = log10(yield);
				
				//eq. 2.116	
				var distance =  a + (b + a_ * logI + d_ * logI2 + g_ * logI3) * logW;
					distance+=	(c + b_ * logI + e_ * logI2 + h_ * logI3) * pow(logW,3);
					distance+=  (d + (c_ * logI) + (f_ * logI2) + (i_ * logI3)) * pow(logW,5);
					distance+=  (e * pow(logW,7)) + (f * logI) + (g * logI2) + (h * logI3);
					distance+=  (i * pow(logI,5));	

				return pow(10,distance);
			} else {
				this.error = "REM OUTSIDE RANGE [rem: "+rem+", min: "+1+", max: "+Math.pow(10,8)+"]";
				if(debug) console.log(this.error); 
				return false;
			}
		/*} else {
			this.error = "YIELD OUTSIDE RANGE [yield: "+yield+", min: 1, max: 20000]";
			if(debug) console.log(this.error); 
			return false;		
		}*/
	}
		
	//maximum fireball radius, input yield and whether airburst, output miles
	this.fireball_radius = function(yield,airburst) {
		if(yield==undefined) {
			this.error = "MISSING INPUT PARAMETER"; if(debug) console.log(this.error); return undefined;
		}
		switch(airburst) {
			case(false): return .04924*pow(yield,.4); break; //surface
			case(true): return .03788*pow(yield,.4); break; //airburst
			default: return .04356*pow(yield,.4); break; //average
		}	
	}
	
	
	//minimum height for negligible fallout as function of yield, returns miles
	this.minimum_height_for_negligible_fallout = function(yield) {
		if(yield==undefined) {
			this.error = "MISSING INPUT PARAMETER"; if(debug) console.log(this.error); return undefined;
		}
		return .03409*pow(yield,.4); 
	}

	//crater functions -- input yield and flag for soil (true) or rock (false)
	//output is an array of lip radius (mi), apparent radius (mi), and depth (mi)
	this.crater = function(yield,soil) {
		if(yield==undefined) {
			this.error = "MISSING INPUT PARAMETER"; if(debug) console.log(this.error); return undefined;
		}
		var c = [];
		if(soil) { //soil
			c[0] = .02398*pow(yield,1/3); //lip
			c[1] = .01199*pow(yield,1/3); //apparent
			c[2] = .005739*pow(yield,1/3); //depth
		} else { //rock
			c[0] = .01918*pow(yield,1/3); //lip
			c[1] = .009591*pow(yield,1/3); //apparent
			c[2] = .004591*pow(yield,1/3); //depth
		}
		return c; 
	}

	//input is distance (mi), yield, airburst flag; output is cal/cm^2
	this.thermal_radiation_q = function(distance,yield,airburst) {
		var y = eq_result('2-106',distance);
		if(yield<1) {
			var kt = yield*1000;  //this doesn't work well
			var scale = .001;
		
		} else if(yield>20000) {
			var kt = yield/10; //this kinda works?
			var scale=10;

		} else {
			//default range
			var kt = yield;
			var scale = 1;
		}
		switch(airburst) { 
			case(true): return (y/(1/kt))*scale; break; //airburst
			case(false): return (y/(1/(.7*kt)))*scale; break; //surface
		}
	}

	//input is thermal radiation (cal/cm^2), yield, airburst flag; output is distance or slant distance (mi)
	this.thermal_radiation_distance = function(radiation,yield,airburst) {
		switch(airburst) {
			case(true): return eq_result('2-108',radiation*(1/yield)); break; //airburst
			case(false): return eq_result('2-108',radiation*(1/(.7*yield))); break; //surface
		}
	}

	/* input is yield and one of the following strings:
		_1st-50: 50% chance of 1st degree burn
		_2nd-50: 50% chance of 2nd degree burn
		_3rd-50: 50% chance of 3rd degree burn
		_3rd-100: 100% chance of 3rd degree burn
		noharm-100: 100% chance of no thermal damage (min radius)
	output is in q (cal/cm^2), based on Glasstone and Dolan 1977 	
	*/
	this.thermal_radiation_param_q = function(yield,param) {
		switch(param) {
			case('_1st-50'): return Math.log(eq_result('77-12.65-1st-50',yield,Math.E,true)); break;
			case('_2nd-50'): return Math.log(eq_result('77-12.65-2nd-50',yield,Math.E,true)); break;
			case('_3rd-50'): return Math.log(eq_result('77-12.65-3rd-50',yield,Math.E,true)); break;
			case('_3rd-100'): return Math.log(eq_result('77-12.65-3rd-100',yield,Math.E,true)); break;
			case('_noharm-100'): return Math.log(eq_result('77-12.65-noharm-100',yield,Math.E,true)); break;
			default: this.error = "MISSING PARAM"; if(debug) console.log(this.error); return undefined;; break;
		}
	
	}

	//input is yield (kt), output is q (cal/cm^2) for 1st degree burns 
	this.thermal_radiation_1st_q = function(yield) {
		return eq_result('2-110',yield);
	}

	//input is yield (kt), output is q (cal/cm^2) for 2nd degree burns 
	this.thermal_radiation_2nd_q = function(yield) {
		return eq_result('2-111',yield);
	}



	//gives you the height of burst in order to maximum the range of a given overpressure at a given yield
	//input is yield and overpressure, output is feet
	this.optimum_height_of_burst_from_overpressure = function(yield,maximum_overpressure) {
		return eq_result('2-78',maximum_overpressure)/Math.pow(this.ambient_pressure/14.7,1/3)/Math.pow(1/yield,1/3);	
	}

	//calculates HOB from distance and a yield, output is feet
	//maximizes overpressure at a given distance
	this.optimum_height_of_burst = function(distance,yield) {
		return eq_result('2-79',distance*Math.pow(1/yield,1/3)*Math.pow(this.ambient_pressure/14.7,1/13))/Math.pow(this.ambient_pressure/14.7,1/3)/Math.pow(1/yield,1/3);
	}

	
	//input is psi, output is scaled range
	this.maximum_overpressure_range = function(x,airburst) {
		if(x==undefined) {
			this.error = "MISSING X PARAMETER"; if(debug) console.log(this.error); return undefined;
		}
		if(airburst==undefined) { 
			this.error = "NO HEIGHT OF BURST DEFINED"; if(debug) console.log(this.error); return undefined;
		}
		switch(airburst) {
			case(false): return eq_result('2-5',x); break;
			case(true): return eq_result('2-61',x); break;
		}
	}	
		
	//input is scaled range, output in psi
	this.maximum_overpressure_psi = function(x,airburst) {
		if(x==undefined) {
			this.error = "MISSING X PARAMETER"; if(debug) console.log(this.error); return undefined;
		}
		if(airburst==undefined) { 
			this.error = "NO HEIGHT OF BURST DEFINED"; if(debug) console.log(this.error); return undefined;
		}
		switch(airburst) {
			case(false): return eq_result('2-4',x); break;
			case(true): return eq_result('2-60',x); break;
		}
	}
		
	//input is scaled range, output in psi
	this.maximum_dynamic_pressure_psi = function(x,airburst) {
		if(x==undefined) {
			this.error = "MISSING X PARAMETER"; if(debug) console.log(this.error); return undefined;
		}
		if(airburst==undefined) {
			this.error = "NO HEIGHT OF BURST DEFINED"; if(debug) console.log(this.error); return undefined;
		} 
		switch(airburst) {
			case(false): return eq_result('2-6',x); break;
			case(true): if(x<.154) {
						return eq_result('2-64',x); 
					} else {
						return eq_result('2-62',x);
					}; break;
		}
	}
	
	//input is scaled range, output is seconds
	this.duration_positive_overpressure = function(x,airburst) {
		if(x==undefined) {
			this.error = "MISSING X PARAMETER"; if(debug) console.log(this.error); return undefined;
		}
		if(airburst==undefined) {
			this.error = "NO HEIGHT OF BURST DEFINED"; if(debug) console.log(this.error); return undefined;
		}
		switch(airburst) {
			case(false): return eq_result('2-8',x); break;
		}
	}

	//input in scaled range, output in seconds
	this.blast_wave_arrival = function(x,airburst) {
		if(x==undefined) {
			this.error = "MISSING X PARAMETER"; if(debug) console.log(this.error); return undefined;
		}
		if(airburst==undefined) {
			this.error = "NO HEIGHT OF BURST DEFINED"; if(debug) console.log(this.error); return undefined;
		}
		switch(airburst) {
			case(false): return eq_result('2-12',x); break;
		}
	}

	//input in scaled range, output in mph
	this.maximum_wind_velocity_mph = function(x,airburst) {
		if(x==undefined) {
			this.error = "MISSING X PARAMETER"; if(debug) console.log(this.error); return undefined;
		}
		if(airburst==undefined) {
			this.error = "NO HEIGHT OF BURST DEFINED"; if(debug) console.log(this.error); return undefined;
		} 
		switch(airburst) {
			case(false): return eq_result('2-16',x); break;
			case(true): if(x>0.2568) {
						return eq_result('2-74',x);
					  } else {
						return eq_result('2-76',x);
					  }; break;
		}
	}	
	
	//note this function is MOSTLY DEPRECATED in favor of range_from_psi_hob
	//this is a wrapper for all of the psi functions, and automatically scales for yields >20Mt or <1Kt
	//input is kt, psi, and the airburst flag; output is in miles
	this.psi_distance = function(kt,psi,airburst) {
		if(kt>20000) {
			//this is based on scaling equation 4.2
			var d = this.distance_from_scaled_range(this.maximum_overpressure_range(psi,airburst),kt/1000);
			return d*10;
		} else if (kt<1) {
			//this is based on scaling equation 4.1
			var d = this.distance_from_scaled_range(this.maximum_overpressure_range(psi,airburst),kt*1000);
			return d/10;
		} else {
			var d = this.distance_from_scaled_range(this.maximum_overpressure_range(psi,airburst),kt);		
			return d;
		}
	}
	
	//simple function that returns ground range from slant range and a height -- note there is a need for the units to be the same for both
	//this ONLY works for effects that are straightforwardly spherical in nature (thermal, radiation, but NOT pressure, because pressure reflects off of the ground)
	this.ground_range_from_slant_range = function(slant_range, height) {
		if(slant_range<height) {
			return 0; 
		} else {
			return Math.sqrt(Math.pow(slant_range,2)-Math.pow(height,2));
		}
	}
	
	//wrapper for all fo the thermal radiation functions, including automatic scaling for yields >20Mt or <1Kt
	//input is kt, thermal radiation (cal/cm^2), and airburst flag
	//note can also take the thermal_radiation_params as well if preceded by underscores
	this.thermal_distance = function(kt,therm,airburst) {
			switch(therm) {
			case "_3rd-50": case "_3rd-100": case "_2nd-50": case "_1st-50": case "_noharm-100":
				if(kt<1) {
					//low yield scaling					
					var d1 = this.thermal_radiation_distance(this.thermal_radiation_param_q(1,therm),1,airburst);
					var d = this.scaled_yield(kt,d1,1);
				} else if(kt>20000) { 
					//high yield scaling					
					var d1 = this.thermal_radiation_distance(this.thermal_radiation_param_q(kt,therm),20000,airburst);
					var d = this.scaled_yield(kt,d1,20000);
				} else {
					//default range
					var d = this.thermal_radiation_distance(this.thermal_radiation_param_q(kt,therm),kt,airburst);
				}
			break;
			default:
				var d = this.thermal_radiation_distance(therm,kt,airburst);
			break;
			}
		return d;
	}
	
	//input is kt, psi, and height of burst (feet)
	//output is a ground range distance (feet) at which that psi would be felt
	this.range_from_psi_hob = function(kt,psi,hob) {
		scaled_hob = hob/Math.pow(kt,1/3);
		range_at_1kt = this.range_from_psi_hob_1kt(psi,scaled_hob);
		return range_at_1kt*Math.pow(kt,1/3);
	}

	//these heights-of-bursts and ranges for various psi are pixel matches to the knee curve graphs in Glasstone and Dolan 1977
	var hobs = []; //heights
	var rngs = []; //corresponding ranges
	hobs[10000] = new Array(0,10,22,33,44,54,65,73,79,88,94,99,104,108,111,114,116,117,117,117);
	rngs[10000] = new Array(69,70,70,71,71,71,70,68,66,63,58,53,47,40,33,26,18,11,3,0);
	hobs[5000] = new Array(0,10,22,35,46,57,68,78,90,99,106,113,119,125,131,135,138,141,143,144,145,146);
	rngs[5000] = new Array(88,88,89,90,90,90,89,88,85,81,78,74,69,63,55,48,41,34,26,17,9,0);
	hobs[2000] = new Array(0,7,16,26,36,45,55,67,77,86,96,104,113,121,130,138,144,151,156,161,167,172,177,180,183,186,188,190,191,192);
	rngs[2000] = new Array(119,119,120,121,122,122,122,122,122,121,120,119,117,115,112,108,105,100,94,88,81,73,64,56,48,40,30,21,11,0);
	hobs[1000] = new Array(0,7,17,27,37,47,58,71,82,94,104,115,126,135,144,153,161,170,178,184,191,196,202,206,210,214,218,222,225,228,230,232,234,236,237,238,239);
	rngs[1000] = new Array(154,154,154,155,155,156,156,157,157,158,157,156,154,152,149,146,142,137,131,127,121,115,108,102,96,91,83,75,67,59,52,43,33,24,15,8,0);	
	hobs[500] = new Array(0,9,19,29,39,50,61,76,89,103,118,130,142,153,166,179,191,199,209,221,229,236,244,250,256,261,266,271,277,281,284,286,289,290,291);
	rngs[500] = new Array(193,194,195,196,198,199,200,202,203,203,204,203,202,200,198,194,189,184,179,170,163,154,144,134,125,117,107,96,84,73,60,48,33,18,0);
	hobs[200] = new Array(0,13,26,39,54,69,86,103,119,136,156,177,195,209,227,240,249,258,266,274,283,290,302,310,317,324,331,338,343,349,356,362,367,372,376,380,382,386,387,390);	
	rngs[200] = new Array(264,264,265,265,266,266,267,268,269,269,270,270,269,268,265,261,257,253,249,243,238,231,221,213,204,195,186,175,166,155,142,131,121,107,94,78,64,44,32,0);
	hobs[100] = new Array(0,10,25,42,60,78,96,113,131,152,175,194,212,230,249,269,286,299,313,326,338,349,360,368,377,386,394,400,407,415,422,429,438,447,455,462,468,474,478,485,489,493,496,498,500,501);
	rngs[100] = new Array(342,342,343,345,345,346,347,348,350,351,353,354,355,355,355,354,353,351,349,344,339,332,324,317,307,297,287,279,270,258,247,237,223,206,191,176,163,149,135,117,100,81,58,39,17,0);
	hobs[50] = new Array(0,19,50,90,136,174,209,244,279,319,346,371,391,406,427,447,459,472,481,490,504,516,527,537,548,558,568,579,588,598,606,613,620,625,630,633,635,637,638);
	rngs[50] = new Array(459,459,461,463,465,469,473,478,483,489,492,493,492,490,484,474,463,442,427,406,386,365,347,329,310,290,270,250,227,202,181,159,138,115,90,68,46,20,0);
	hobs[30] = new Array(0,24,54,84,114,143,179,215,250,292,328,365,403,441,476,502,527,552,574,587,589,591,596,612,628,647,665,685,703,721,736,747,758,766,773,779,782,784);
	rngs[30] = new Array(592,593,593,594,594,596,597,600,604,609,612,618,624,631,638,642,642,640,628,609,585,557,524,486,453,421,392,353,319,280,244,214,180,141,107,65,21,0);
	hobs[20] = new Array(0,34,84,130,176,223,274,319,358,399,427,458,485,512,537,566,597,627,651,673,687,694,692,683,674,672,672,677,685,697,713,730,748,764,781,801,814,827,844,858,870,881,892,898,906,912,919,922,924);
	rngs[20] = new Array(714,719,727,737,747,757,771,782,795,812,826,843,860,879,898,914,922,919,907,887,860,826,788,757,729,704,686,662,639,612,586,559,533,508,478,446,419,394,358,327,297,269,232,205,165,124,68,26,0);
	hobs[15] = new Array(0,27,67,114,160,209,250,294,319,359,398,434,459,488,515,538,565,594,624,650,676,692,711,726,739,750,761,771,776,779,778,773,764,751,738,731,733,740,750,765,780,798,815,831,845,861,874,889,907,921,935,948,958,968,980,1000,1004,1017,1033,1041);
	rngs[15] = new Array(818,827,840,858,873,893,912,933,946,974,1002,1033,1057,1083,1111,1133,1158,1178,1193,1196,1191,1183,1173,1161,1146,1129,1109,1082,1058,1028,990,956,923,892,865,838,811,784,757,727,698,668,640,615,589,563,539,512,481,452,425,397,377,352,331,277,215,153,74,0);
	hobs[10] = new Array(0,30,73,115,151,191,235,269,312,345,380,412,442,471,500,528,558,592,627,658,692,724,749,767,785,805,820,835,851,862,872,881,888,893,896,894,888,881,872,859,850,846,848,852,858,867,880,891,904,916,926,941,953,965,980,989,1000,1017,1045,1074,1103,1136,1169,1190,1215,1236,1244,1252,1260);
	rngs[10] = new Array(1024,1037,1056,1074,1092,1112,1133,1151,1173,1193,1214,1238,1261,1285,1312,1336,1360,1387,1412,1430,1447,1455,1455,1450,1443,1433,1422,1407,1388,1370,1348,1320,1291,1265,1246,1227,1196,1173,1148,1119,1097,1065,1047,1026,1007,983,957,934,911,890,874,852,833,814,795,778,765,740,690,636,583,512,450,380,293,211,128,58,0);
	hobs[8] = new Array(0,83,161,256,364,459,587,661,744,847,930,975,996,1004,983,950,934,942,967,1029,1095,1145,1198,1244,1289,1314,1351,1384,1401,1417);
	rngs[8] = new Array(1124,1169,1223,1277,1347,1409,1492,1558,1636,1694,1694,1645,1591,1550,1483,1376,1289,1194,1103,1012,909,831,740,649,550,496,393,248,145,0);
	hobs[6] = new Array(0,62,120,202,273,364,434,500,595,686,777,888,979,1041,1083,1095,1079,1054,1025,1025,1033,1074,1145,1227,1310,1368,1421,1488,1537,1570,1570,1603,1628,1645,1653,1653);
	rngs[6] = new Array(1339,1393,1438,1500,1554,1624,1682,1740,1822,1893,1959,2012,2017,1988,1926,1843,1756,1669,1570,1508,1450,1360,1240,1132,1008,926,847,723,603,512,492,384,256,124,37,0);
	hobs[4] = new Array(0,37,87,153,244,331,421,529,661,777,905,988,1070,1132,1186,1231,1240,1223,1198,1182,1174,1194,1260,1326,1413,1521,1612,1694,1781,1860,1913,1971,2017,2050,2074,2087,2087);
	rngs[4] = new Array(1665,1702,1764,1847,1946,2045,2136,2244,2364,2459,2554,2599,2624,2620,2591,2512,2438,2331,2227,2153,2050,1942,1798,1686,1570,1426,1310,1182,1058,926,810,657,496,343,182,62,0);
	hobs[2] = new Array(0,25,58,136,186,227,293,368,434,479,529,591,632,686,740,798,851,921,1017,1099,1198,1264,1318,1372,1413,1430,1429,1421,1422,1438,1508,1587,1702,1818,1988,2190,2302,2426,2492,2517,2612,2698,2793,2893,2971,3041,3079,3103,3136,3157,3178,3190,3202,3211);
	rngs[2] = new Array(2558,2616,2682,2847,2942,3033,3136,3281,3380,3467,3545,3632,3702,3781,3868,3942,4021,4099,4182,4207,4182,4136,4079,3992,3901,3777,3649,3525,3401,3264,3116,3000,2876,2752,2579,2364,2236,2091,2000,1971,1839,1707,1537,1351,1161,950,793,682,545,442,302,182,70,0);
	hobs[1] = new Array(0,58,140,219,322,405,496,579,678,810,888,971,1083,1165,1260,1388,1533,1665,1727,1802,1864,1888,1913,1921,1922,1938,2004,2140,2355,2512,2785,3012,3211,3335,3525,3702,3764,3909,4017,4157,4236,4318,4409,4463,4521,4632,4702,4781,4860,4897,4934,4963,4992,5012,5008,5070);
	rngs[1] = new Array(3860,3996,4248,4475,4744,4996,5236,5471,5719,6037,6219,6397,6583,6715,6835,6946,7021,7021,6979,6872,6698,6512,6256,6021,5781,5558,5364,5149,4913,4756,4508,4293,4107,3975,3785,3591,3508,3343,3207,3008,2884,2756,2612,2500,2405,2157,2008,1764,1504,1335,1149,942,760,612,599,0);

	//quickly make a list of all the psi indices and sort it
	var psi_index = new Array();
	for(var p in hobs) { psi_index.push(+p); }
	psi_index.sort(function (a,b) { return a-b; } );
	
	var hobs_sm = new Array(); //smoothed arrays -- we remove the "dips." Used for some calculations, not others.
	var rngs_sm = new Array();
	make_smooth_hob_array();
	
	
	this.max_height_for_psi = function(kt,psi) {
		//scaled_hob = hob/Math.pow(kt,1/3); -- need to scale for kt
		if(psi in hobs) {
			return hobs[psi][hobs[psi].length-1];
		} else {
			var psi_ = psi_find(psi);
			return lerp(this.max_height_for_psi(kt,psi_[0]),psi_[0],this.max_height_for_psi(kt,psi_[1]),psi_[1],psi);

		}
	}
	
	//input is psi and height of burst (feet)
	//returns ground range for a 1 kiloton shot for a given psi and hob
	this.range_from_psi_hob_1kt = function(psi,hob) {

		//if out of range, return false
		if(hob<0) return false; //min hob
		if(psi>10000) return false; //max psi
		if(psi<1) return false; //min psi

		if(psi in hobs) { //if the psi is one that we have direct data for
			if(hob>hobs[psi][hobs[psi].length-1]) {
				return 0; //too high
			}

			//check the closest heights in our data
			var near_hobs = array_closest(hobs_sm[psi],hob);
			if(near_hobs.length==1) {
				return rngs_sm[psi][near_hobs[0]];
			} else {
				min_hob_k = near_hobs[0];
				max_hob_k = near_hobs[1];
			}
			
			//interpolate the desired result from the known results using smooth array
			return lerp(rngs_sm[psi][min_hob_k],hobs_sm[psi][min_hob_k],rngs_sm[psi][max_hob_k],hobs_sm[psi][max_hob_k],hob);
		} else { //if we don't have that psi
			//have to do some rather complicated interpolation!
			return range_from_psi_hob_1kt_interpolated(psi,hob);
		}
	}

	//interpolates for a given unknown psi from known psi ranges.
	//hob in feet. returns ground range in feet. for a 1 kt burst.
	function range_from_psi_hob_1kt_interpolated(psi,hob) {

		var h = hob;

		var psi_ = psi_find(psi);
		var p1 = psi_[0]; //OUTER
		var p2 = psi_[1]; //INNER
	
		if(h<=0) {
			//easy case
			var result = lerp(rngs[p1][0],p1,rngs[p2][0],p2,psi);
			return result;
		}
		
		//first check if it is out of bounds
		var max_hob_outer = hobs[p1][hobs[p1].length-1];
		var max_hob_inner = hobs[p2][hobs[p2].length-1];
		var max_hob_lerp = lerp(max_hob_outer,p1,max_hob_inner,p2,psi);

		if(h>max_hob_lerp) {
			return 0;
		}

		//start on the hard case...

		//the proportion between the two PSIs
		var proportion = lerp(0,p2,1,p1,psi);

		var near_hobs = array_closest(hobs[p1],h);

		//search start index
		var outer_index = near_hobs[0];
		var search_direction = 1;
	
		var intercept = getInterpolatedPosition(p2,p1,outer_index);
		if(!intercept) {
			return false;
		}
		
		var h_low_index; var h_low_prop; var r_low_prop;
		var h_high_index; var h_high_prop; var r_high_prop;
		
		while(intercept[1]<h) {
			var rng_at_prop = lerp(rngs[p1][outer_index],1,intercept[0],0,proportion);
			var hob_at_prop = lerp(hobs[p1][outer_index],1,intercept[1],0,proportion);
			if(hob_at_prop<h) {
				if(outer_index>h_low_index||h_low_index==undefined) {
					h_low_index = outer_index;
					h_low_prop = hob_at_prop;
					r_low_prop = rng_at_prop;
				}
			}
			if(hob_at_prop>h) {
				if(h_low_index) {
					h_high_prop = hob_at_prop;
					r_high_prop = rng_at_prop;
					result = lerp(r_low_prop,h_low_prop,r_high_prop,h_high_prop,h);
					return result;
					break;
				}
			}
		
			outer_index+=search_direction;
		
			if((outer_index>=hobs[p1].length)||(outer_index<0)) {
				return false;
				break;
			} else {
				intercept = getInterpolatedPosition(p2,p1,outer_index);
				if(!intercept) return false;
			}
		}
		if(!result && h_low_index) {
					rng_at_prop = lerp(rngs[p1][outer_index],1,intercept[0],0,proportion);
					hob_at_prop = lerp(hobs[p1][outer_index],1,intercept[1],0,proportion);
					h_high_prop = hob_at_prop;
					r_high_prop = rng_at_prop;
					result = lerp(r_low_prop,h_low_prop,r_high_prop,h_high_prop,h);

					return result;
		} else {
			//so low that it fails -- just take the last two measurements and use those
			rng_at_prop = lerp(rngs[p1][outer_index],1,intercept[0],0,proportion);
			hob_at_prop = lerp(hobs[p1][outer_index],1,intercept[1],0,proportion);
			h_high_prop = hob_at_prop;
			r_high_prop = rng_at_prop;
			intercept = getInterpolatedPosition(p2,p1,outer_index-1);
			if(!intercept) return false;
			rng_at_prop = lerp(rngs[p1][outer_index-1],1,intercept[0],0,proportion);
			hob_at_prop = lerp(hobs[p1][outer_index-1],1,intercept[1],0,proportion);
			h_low_prop = hob_at_prop;
			r_low_prop = rng_at_prop;
			result = lerp(r_low_prop,h_low_prop,r_high_prop,h_high_prop,h);
			return result;
		}
	return false; //failed for some reason;
	}
	
	//a helper function to the interpolation function
	//idea is this: you have two PSI hob/ranges sets. one is lower than the other and is thus "outer" when graphed. the other is higher.
	//outer_index is the index of a given point on "outer" PSI range. we imagine a line from that point to 0,0. 
	//now we want to find which two points of the "inner" range correspond to a line which that original line crosses through.
	//to find it, we move through the inner indices until we find it.
	//then we return the intersection of those two lines, thus allowing the creation of a line segment.
	function getInterpolatedPosition(inner_psi,outer_psi,outer_index) {
	
		var inner_index = 0; //we start from index zero (HOB = 0) and move "up." the choice of a starting index and the method of traversig the index could be optimized. 
		
		while(linesIntersect(
					0,									0,  
					rngs[outer_psi][outer_index],	hobs[outer_psi][outer_index],
				
					rngs[inner_psi][inner_index],	hobs[inner_psi][inner_index],  
					rngs[inner_psi][inner_index+1],	hobs[inner_psi][inner_index+1]
		)==false) {
			inner_index++;
			if(inner_index>rngs[inner_psi].length||inner_index-1<0) {
				return false;		
			}
		}
		return getLineLineIntersection(0,0,  rngs[outer_psi][outer_index],hobs[outer_psi][outer_index],
								 rngs[inner_psi][inner_index+1],hobs[inner_psi][inner_index+1],  rngs[inner_psi][inner_index],hobs[inner_psi][inner_index]);

	}

	//get line segment intersection point
	function getLineLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
		  var det1And2 = getLineLineIntersection_det(x1, y1, x2, y2);
		  var det3And4 = getLineLineIntersection_det(x3, y3, x4, y4);
		  var x1LessX2 = x1 - x2;
		  var y1LessY2 = y1 - y2;
		  var x3LessX4 = x3 - x4;
		  var y3LessY4 = y3 - y4;
		  var det1Less2And3Less4 = getLineLineIntersection_det(x1LessX2, y1LessY2, x3LessX4, y3LessY4);
		  if (det1Less2And3Less4 == 0){
			 // the denominator is zero so the lines are parallel and there's either no solution (or multiple solutions if the lines overlap) so return null.
			 return false;
		  }
		  var x = (getLineLineIntersection_det(det1And2, x1LessX2,
				det3And4, x3LessX4) /
				det1Less2And3Less4);
		  var y = (getLineLineIntersection_det(det1And2, y1LessY2,
				det3And4, y3LessY4) /
				det1Less2And3Less4);
		  return Array(x, y);
	   }

	function getLineLineIntersection_det(a, b, c, d) {
		return a * d - b * c;
	}


	//determines whether two line segments intersect
	function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4){
		  // Return false if either of the lines have zero length
		  if (x1 == x2 && y1 == y2 ||
				x3 == x4 && y3 == y4){
			 return false;
		  }
		  // Fastest method, based on Franklin Antonio's "Faster Line Segment Intersection" topic "in Graphics Gems III" book (http://www.graphicsgems.org/)
		  var ax = x2-x1;
		  var ay = y2-y1;
		  var bx = x3-x4;
		  var by = y3-y4;
		  var cx = x1-x3;
		  var cy = y1-y3;

		  var alphaNumerator = by*cx - bx*cy;
		  var commonDenominator = ay*bx - ax*by;
		  if (commonDenominator > 0){
			 if (alphaNumerator < 0 || alphaNumerator > commonDenominator){
				return false;
			 }
		  } else if (commonDenominator < 0){
			 if (alphaNumerator > 0 || alphaNumerator < commonDenominator){
				return false;
			 }
		  }
		  betaNumerator = ax*cy - ay*cx;
		  if (commonDenominator > 0){
			 if (betaNumerator < 0 || betaNumerator > commonDenominator){
				return false;
			 }
		  }else if (commonDenominator < 0){
			 if (betaNumerator > 0 || betaNumerator < commonDenominator){
				return false;
			 }
		  }
		  if (commonDenominator == 0){
			 // This code wasn't in Franklin Antonio's method. It was added by Keith Woodward.
			 // The lines are parallel.
			 // Check if they're collinear.
			 var y3LessY1 = y3-y1;
			 var collinearityTestForP3 = x1*(y2-y3) + x2*(y3LessY1) + x3*(y1-y2);   // see http://mathworld.wolfram.com/Collinear.html
			 // If p3 is collinear with p1 and p2 then p4 will also be collinear, since p1-p2 is parallel with p3-p4
			 if (collinearityTestForP3 == 0){
				// The lines are collinear. Now check if they overlap.
				if (x1 >= x3 && x1 <= x4 || x1 <= x3 && x1 >= x4 ||
					  x2 >= x3 && x2 <= x4 || x2 <= x3 && x2 >= x4 ||
					  x3 >= x1 && x3 <= x2 || x3 <= x1 && x3 >= x2){
				   if (y1 >= y3 && y1 <= y4 || y1 <= y3 && y1 >= y4 ||
						 y2 >= y3 && y2 <= y4 || y2 <= y3 && y2 >= y4 ||
						 y3 >= y1 && y3 <= y2 || y3 <= y1 && y3 >= y2){
					  return true;
				   }
				}
			 }
			 return false;
		  }
		  return true;
	   }


	//a few little functions that make the psi functions easier to code
	//max value of an array
	function array_max_value(array) {
		return Math.max.apply(Math, array);
	}
	//equivalent to PHP's array_keys
	function array_keys(myObject,searchVal) {
		output = [];
		for(var key in myObject) {
			if(searchVal!=undefined) {
				if(myObject[key]==searchVal) {
					output.push(key);
				}
			} else {
				output.push(key);
			}
		}
		return output;
	}
	//function that searches an array for the closest values -- returns two indices
	function array_closest(arr,val) {
		/*
		var min_val=-1; var max_val; var min_key; var max_key;
		for(var k in arr) {
			if(val==arr[k]) {
				return [k];
			} else if(arr[k]<val) {
				if(arr[k]>min_val) {
					min_val = arr[k];
					min_key = k;
				}
			} else if(arr[k]>val) {
				if(!max_val||arr[k]<max_val) {
					max_val = arr[k];
					max_key = k;
				}
			}
		}
		return [min_key, max_key];
*/
		var lo = null;
		var hi = null;
	    for(var i in arr) {
	    	if(arr[i]==val) {
	    		return Array(i);
	    	}
	        if (arr[i] <= val && (lo === null || lo < arr[i])) {
	        	lo = arr[i];
	        	lo_k = i;
	        }
        	if (arr[i] >= val && (hi === null || hi > arr[i])) {
        		hi = arr[i];
        		hi_k = i;
        	}
    	};
    	if(hi_k!=lo_k+1) {
    		lo_k = hi_k-1;
    		//echo "hmm... ";
    	}
	    return new Array(lo_k, hi_k);
	}

	//streamlines arrays 
	function make_smooth_hob_array() {
		var rv;
		for(psi in hobs) {
			rv = -1;		
			hobs_sm[psi] = new Array();
			rngs_sm[psi] = new Array();
			for(k in hobs[psi]) {
				if(hobs[psi][k]>rv) {
					hobs_sm[psi].push(hobs[psi][k]);
					rngs_sm[psi].push(rngs[psi][k]);
					rv = hobs[psi][k];
				}
			}
		}
	}

	
	//figures out the nearest psi values to extrapolate from
	function psi_find(psi) {
		var min_psi; var max_psi;
		for(var p in psi_index) {
			if(parseInt(psi_index[p])<psi) {
				min_psi = psi_index[p];
			}
			if(parseInt(psi_index[p])>psi) {
				if(!max_psi) max_psi = psi_index[p];
			}
		}
		return [min_psi,max_psi];
	}	
	
	//maximum height (ft) for a given psi and kt -- calculated from table. at this height and higher the effects do not reach the ground.
	this.max_height_for_psi = function(kt,psi) {
		if(psi in hobs) { //perfect match
			max_hob = array_max_value(hobs[psi]);
			return max_hob*Math.pow(kt,1/3); //scaled to kt
		} else {
			//interpolated solution
			var psi_ = psi_find(psi);
			var max_hob_outer = hobs[psi_[0]][hobs[psi_[0]].length-1];
			var max_hob_inner = hobs[psi_[1]][hobs[psi_[1]].length-1];
			return lerp(max_hob_outer,psi_[0],max_hob_inner,psi_[1],psi)*Math.pow(kt,1/3);
		}	
	}
	
	//optimal blast height (ft) for a giving psi and kt -- calculated from tables. maximizes the range for a given psi.
	this.opt_height_for_psi = function(kt,psi) {
		if(psi in hobs) { //perfect match
			var maxs = array_keys(rngs[psi],array_max_value(rngs[psi])); //get the key(s) of the max range
			return hobs[psi][maxs[0]]*Math.pow(kt,1/3); //scaled to kt
		} else {
			psi_ = psi_find(psi);
			return lerp(this.opt_height_for_psi(kt,psi_[0]),psi_[0],this.opt_height_for_psi(kt,psi_[1]),psi_[1],psi);
		}
	}
	
	//gives the psi experienced at a given location on the ground from a given psi, kt, and hob (ft)
	this.psi_at_distance_hob = function (dist_ft,kt,hob) {
		var min_psi; var max_psi; 
	
		//scale down the hob and dist to 1kt
		var scaled_hob = hob/Math.pow(kt,1/3);
		var scaled_dist = dist_ft/Math.pow(kt,1/3);

		var dist_1psi = this.range_from_psi_hob(kt,1,hob);
		var dist_10000psi = this.range_from_psi_hob(kt,10000,hob);
		if(dist_1psi<dist_ft) {
			return 0; //I have no data for under 1 psi
		}
		if(dist_ft<dist_10000psi) {
			return "+10,000";
		}

		var max_dist = dist_1psi;
		var min_dist = 0;

		//finds the pressures and distances that are nearest to our desired distance
		//this traverses the charts horizontally
		for(psi in hobs) {
			var psi_dist = this.range_from_psi_hob_1kt(psi,scaled_hob);
			if((psi_dist==scaled_dist)&&(psi_dist>0)) { //lucky match, unlikely!
				return psi;
			} else if(psi_dist<scaled_dist) {
				if(psi_dist>min_dist) {
					min_dist = psi_dist;
					min_psi = psi;
				}
			} else if(psi_dist>scaled_dist) {
				if(psi_dist<max_dist) {
					max_dist = psi_dist;
					max_psi = psi;	
				}	
			}
		}
		if(min_psi && max_psi) {
			//now interpolates between those to get the pressure
			return lerp(max_psi,max_dist,min_psi,min_dist,scaled_dist);
		} else if(!min_psi && max_psi) {

			psi_ = psi_find(max_psi,max_psi+1);
			min_psi = psi_[1];
			near_rngs = array_closest(rngs[min_psi],scaled_dist);
			min_dist = hobs[min_psi][near_rngs[0]];
			near_rngs = array_closest(rngs[max_psi],scaled_dist);						
			max_dist = hobs[max_psi][near_rngs[0]];
			
			if(!min_psi) {
				return "10000";
			}	
			return lerp(max_psi,max_dist,min_psi,min_dist,scaled_hob);
		}
	}

	//From Wolczek, 1988 -- not especially accurate
	/*
	this.psi_range_at_height = function (kt, psi, height_ft) {

		var P = psi/1000; //peak overpressure in kilopounds per square inch
		var Y = pow((height_ft/1000)/kt,1/3); //scaled burst height in kilofeet
	
	
		var scaled_ground_range = 0.20154762 - 0.0621137*P + 0.26548571*Y + 0.01362242*pow(P,2) 
								- 7.29235*pow(Y,2) + 0.07036665*pow(P,2)*pow(Y,2) - 0.00141394*pow(P,3) + 39.26591463*pow(Y,3)
								+ 47.69269458*pow(Y,3)*P + 1.41551464*pow(P,3)*pow(Y,3) + 0.00005402714*pow(P,4)
								- 0.0671128*pow(P,4)*pow(Y,3) - 314.529*pow(Y,4)*P - 12.1885*pow(Y,3)*pow(P,2) + 64.01100943*pow(Y,4)*pow(P,2)
								- 8.28738*pow(Y,4)*pow(P,3) + 0.42330598*pow(P,4)*pow(Y,4);
		return this.distance_from_scaled_range(scaled_ground_range,kt)*1000;
	}*/

	
	//approximate dose rates from early fallout -- gives accumulated dose received over a given period of time
	//this is a calculated version of the nomograph from Glasstone and Dolan 1977 edn., figure 9.25
	//input is rads per hour and time (hours), output is unit-time reference dose rates (rads/hr)
	this.accumulated_dose_rate = function(rads,hours) {
		
		//these are pixel tracings from a scan of the nomograph -- they have no physical significance
		var dose_rate_x = 150;
		var hour_x = 2188;
		var accumulated_x = 1260;

		//these functions translate the dose rates into pixels on the above-mentioned scan -- they are just curve fits
		var dose_rate_y = 	-8.5763502429382902E+02+3.6396739040111243E+02*Math.log(1.0721058158242694E+02*rads ) + -2.5144779874708423E-01*Math.pow(Math.log(1.0721058158242694E+02*rads ),2);
		var hour_y = 		-8.5763502429382902E+02+3.6396739040111243E+02*Math.log(1.0721058158242694E+02*hours) + -2.5144779874708423E-01*Math.pow(Math.log(1.0721058158242694E+02*hours),2);
				
		//linear interpolation
		var accumulated_y = dose_rate_y+(accumulated_x-dose_rate_x)*((hour_y-dose_rate_y)/(hour_x-dose_rate_x));


		console.log(dose_rate_y,hour_y,accumulated_y);
		//lastly, use another curve fit function to find the accumulated dose from the pixel value

		var accumulated = Math.abs(Math.round((-6.5590188579167236E-02*( accumulated_y ) + 5.4538196288120129E-05*(Math.pow(accumulated_y,2) ) ) / (1.0 + -4.9969343147258514E+03*(Math.pow(accumulated_y,-1) ) +  6.3089179198324122E+06*(Math.pow(accumulated_y,-2) ) ),2));

	
		return accumulated;

	}

	//MUSHROOM CLOUD FUNCTIONS
	//First ones are from Miller, slightly dodgy results

	//returns feet, cloud top initial radius (R_s) 
	this.cloud_initial_radius = function(yield) {
		if(yield>0&&yield<=100000) {
			return 2.09*pow(10,2)*pow(yield,.333);
		} else {
			this.error = "YIELD OUTSIDE OF BOUNDS"; if(debug) console.log(this.error); return undefined;
		}
	}

	//returns feet, cloud top (a)
	this.cloud_final_horizontal_semiaxis = function(yield) {
		if(yield>0&&yield<=100000) {
			return 2.34*pow(10,3)*pow(yield,.431);
		} else {
			this.error = "YIELD OUTSIDE OF BOUNDS"; if(debug) console.log(this.error); return undefined;
		}
	}

	//returns feet, cloud top (b)
	this.cloud_final_vertical_semiaxis = function(yield) {
		if(yield>0&&yield<=100000) {
			return 1.40*pow(10,3)*pow(yield,.431);
		} else {
			this.error = "YIELD OUTSIDE OF BOUNDS"; if(debug) console.log(this.error); return undefined;
		}
	}

	//returns feet -- height of the center of the cloud top (h)
	this.cloud_final_height = function(yield) {
		if(yield>0&&yield<=100000) { //technically not valid if less than 1kt but numbers look ok
			if(yield<=28) {
				return 0.66*pow(10,4)*pow(yield,.445);
			} else {
				return 1.68*pow(10,4)*pow(yield,.164);
			}
		} else {
			this.error = "YIELD OUTSIDE OF BOUNDS"; if(debug) console.log(this.error); return undefined;
		}
	}

	this.cloud_horizonal_semiaxis_at_altitude = function(altitude,cloud_final_height,cloud_initial_radius,cloud_final_horizontal_semiaxis) {
		var h   = cloud_final_height;
		var R_s = cloud_initial_radius;
		var a   = cloud_final_horizontal_semiaxis;
		var a_o = pow(10,log10(a)-(h*log10(a/R_s))/(h-R_s)); 
		var k_a = 2.303*(log10(a/R_s)/(h-R_s));
		return a_o*pow(Math.E,(k_a*altitude));
	}

	//altitude in feet, yield in kt; returns vertical semiaxis of cloud in feet (b_z)
	this.cloud_vertical_semiaxis_at_altitude = function(altitude,cloud_final_height,cloud_final_vertical_semiaxis,cloud_initial_radius) {
		var h   = cloud_final_height;
		var b   = cloud_final_vertical_semiaxis; 
		var R_s = cloud_initial_radius;
		var b_o = pow(10,log10(b)-(h*log10(b/R_s))/(h-R_s));
		var k_b = 2.303*(log10(b/R_s)/(h-R_s));
		return b_o*pow(Math.E,(k_b*altitude));
	}

	//height and thickness is at 8 to 10 minutes after detonation, e.g. max
	//time is in seconds
	//rate of rise is for first 10 to 250 seconds
	//eq 4.33
	this.cloud_rate_of_rise_bottom = function(height_of_center, vertical_semiaxis, time_after_detonation) {
		return (height_of_cloud-vertical_semiaxis)*(1 - pow(Math.E,-.0123*time_after_detonation));
	}

	//eq. 4.34 and 4.35
	//limit on time is 20 to 200 sec
	this.cloud_rate_of_rise_top = function(height_of_center, vertical_semiaxis, time_after_detonation) {
		if(time_after_detonation<20) {
			return .331*(height_of_center-vertical_semiaxis)*(1 - pow(Math.E,-.0626*time_after_detonation));
		} else {
			return .893*(height_of_center-vertical_semiaxis)*(1.120 - pow(Math.E,-.00784*time_after_detonation));
		}
	}

	//eq. 4.36
	//limit on time is 20 to 200 sec
	this.cloud_rate_of_rise_center = function(height_of_center, time_after_detonation) {
		return .915*height_of_center * (1.093 - pow(Math.E,-.00905*time_after_detonation));
	}
	

	//this is a curve fit of figure 2.12 in Glasstone & Dolan 1977. Returns a percentage of maximum cloud top height for the given input.
	//note that it tops out at 270 seconds (4.5 minutes).
	//note that this is here yield independent, though in real life, who knows. 
	this.cloud_top_height_percent_at_time = function(seconds) {
		if(seconds>=270) {
			return 1;
		} else {
			return 9.7225115080563657E-03 + 7.9925510016408026E-03*seconds + -1.8866872395194888E-05*Math.pow(seconds,2) + 1.0765594837466863E-08*Math.pow(seconds,3);		
		}
	}
	
	//this is a curve fit of various nuclear cloud data ranging from 18kt and 15 Mt, taken from DNA 1252-2-EX, "Compilation of local fallout data from test detonations 1945-1962," volume II
	//it tells you the time until the cloud is at maximum height, based on yield. 
	//can be used with cloud_top_height_percent_at_time
	this.cloud_time_until_maximum_height = function (yield) {
	
	
	}	
	
	//these two equations are curve fits of Glasstone and Dolan 1977, fig. 9.96. Anything over 30 Mt is an extrapolation. 
	//returns in feet
	this.cloud_bottom = function(yield) {
	  return 1000*(1.7154976807456771E+02*Math.pow(yield/5.2402966478808509E+05,2.5445292192920910E-01)*Math.exp(yield/5.2402966478808509E+05) + -3.2665357749287349E-01)
	}
	
	//returns feet -- funkier curve than the bottom
	this.cloud_top = function(yield) {
		if(yield<=100) {
		    return 1000*(9.0355598798544854E+00*Math.pow(yield,3.2095070520890268E-01+-4.7081309288753766E-05*yield)+8.1777330384279173E-02)
		} else if(yield<=4000) {
    		return 1000*(2.3037246630847605E+01*Math.pow(yield,1.5119655810555122E-01+-4.6347426409373220E+00/yield)+1.4709881303279233E+00)
		} else {
			return 1000*(6.5357594810058774E+00*Math.pow(1.0817408033549503E+288,1.0/yield)*Math.pow(yield,2.8416073403767877E-01));
		}
	}



	/* Functions for implementing the equations */


	//retrieves the equation specified
	function eq_result(eq_id,x,logbase,ignore_range) {
		if(eq[eq_id]!==undefined) {
			if(x==undefined) {
				this.error = "X UNDEFINED FOR EQ."+eq_id;
				if(debug) console.log(this.error); 
				return undefined;
			} else if((x<eq[eq_id]['xmin']||x>eq[eq_id]['xmax'])&&(ignore_range!=true)) {
				this.error = "X OUTSIDE RANGE FOR EQ."+eq_id+" [x: "+x+", xmin: "+eq[eq_id]['xmin']+", xmax: "+eq[eq_id]['xmax']+"]";
				if(debug) console.log(this.error); 
				return false;
			} else {
				return loggo(x,eq[eq_id]['args'],logbase);
			}
		} else {
			this.error = "EQUATION NOT FOUND [eq_id: "+eq_id+"]";
			if(debug) console.log(this.error); 
			return undefined;
		}
	}
	
	

	//runs the polynomial
	function loggo(x, args, logbase) {
		var l = 0;
		if(!logbase) logbase = 10;
		var logbx = logb(x,logbase);
		for(var i=0;i<args.length;i++) {
			l+=args[i] * Math.pow(logbx,i);
		}
		return Math.pow(logbase,l);
	}
	
	//non-log polynomial
	function poly(x,args) {
		var l =0;
		for(var i=0;i<args.length;i++) {
			l+=args[i] * Math.pow(x,i);
		}	
		return l;
	}
	
	//log10
	function log10(n) {
		return (Math.log(n)) / (Math.LN10);
	}
	
	//replacement logarithm function, arbitrary base
	function logb(n,base) {
		if(base==Math.E) {
			return Math.log(n);
		} else if(base==10) {
			return (Math.log(n)) / (Math.LN10);
		} else if(base==2) {
			return (Math.log(n)) / (Math.LN2);
		} else {
			return (Math.log(n)) / (Math.log(base));
		}
	};

	//10-base logarithm
	function log10(n) {
		return (Math.log(n)) / (Math.LN10);
	}

	//same as Math.pow, just cleans up the function a bit
	function pow(n,x) {
		return Math.pow(n,x);
	}

	//simple linear interpolation -- returns x3 for a given y3
	function lerp(x1,y1,x2,y2,y3) {
		if(y2==y1) {
			return false; //division by zero avoidance
		} else {
			return ((y2-y3) * x1 + (y3-y1) * x2)/(y2-y1);
		}
	}
	
	//simple way to check if a value is in an array
	function inArray(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle) return true;
		}
		return false;
	}

}

if (typeof register == 'function') { register("nukeeffects.js"); }