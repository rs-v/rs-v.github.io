window.onload = function(){
	if($("#kong_wzmc").val()!=""){
		$("#a_wzmc").show();
	}else{
		$("#a_wzmc").hide();
	}
	if($("#kong_wzym").val()!=""){
		$("#a_wzym").show();
	}else{
		$("#a_wzym").hide();
	}
	if($("#kong_wzbah").val()!=""){
		$("#a_wzbah").show();
	}else{
		$("#a_wzbah").hide();
	}
}
function wzmc(){
	var websites = $("#websites").val();
	if(websites==""){//判断是否为空
		$("#websitesinfo").show();
	}else{
		$("#websitesinfo").hide();
	}
}
function wzym(){
	var domain = $("#domain").val();
	if(domain==""){//判断是否为空
		$("#domaininfo").show();
	}else{
		$("#domaininfo").hide();
	}
}
function gajgbah(){
	var recordcode = $("#record").val();
	if(recordcode==""){//判断是否为空
		$("#recordcodeinfo").show();
	}else{
		$("#recordcodeinfo").hide();
	}
}

/* 网站名 */
function websitesform(){
	var websites = $("#websites").val();
	if(websites==""){//判断是否为空
		$("#websitesinfo").show();
	}else{
		$("#websitesinfo").hide();
	}
	var websitesFlag = $("#websitesFlag").val();
	if(websites&&websitesFlag){
		$("#websitesform").submit();
	}
}
/* 域名 */
function domainform(){
	var domain = $("#domain").val();
	if(domain==""){//判断是否为空
		$("#domaininfo").show();
	}else{
		$("#domaininfo").hide();
	}
	var domainFlag = $("#domainFlag").val();
	if(domain&&domainFlag){
		$("#domainform").submit();
	}
}
/* 备案号 */
function recordform(){
	var recordcode = $("#record").val();
	if(recordcode==""){//判断是否为空
		$("#recordcodeinfo").show();
	}else{
		$("#recordcodeinfo").hide();
	}
	var recordFlag = $("#recordFlag").val();
	if(recordcode&&recordFlag){
		$("#recordform").submit();
	}
}

/* 互联网备案网站备案信息 */
function recordsform(){

	$("#recordform").submit();
}

/* 备案号验证码 */
function verCode(){	
	$("#error").hide();
	$("#right").hide();
	$("#recordFlag").val('');
	if($("#ver1").val().length == 4){
		$.post("../portal/verCode?t=3&code="+$("#ver1").val(),function(data){
			if(data == 1)
			{		
				$("#recordFlag").val(1);
				$("#right").show();	
				$("#error").hide();
			}
			if(data == 0)
			{	
				$("#recordFlag").val('');
				$("#right").hide();
				$("#error").show();				
			}
		});
	}else{
		$("#error").show();
	}
}

/* 域名验证码 */
function domainCode(){
	$("#domainerror").hide();
	$("#domainright").hide();
	$("#domainFlag").val('');
	if($("#ver2").val().length == 4){
		$.post("../portal/verCode?t=2&code="+$("#ver2").val(),function(data){
			if(data == 1)
			{		
				$("#domainFlag").val(1);
				$("#domainright").show();
				$("#domainerror").hide();
			}
			if(data == 0)
			{	
				$("#domainFlag").val('');
				$("#domainright").hide();
				$("#domainerror").show();				
			}
		});
	}else{
		$("#domainerror").show();
	}
}

/* 网站名称验证码  */
function websitesCode(){
	$("#websiteserror").hide();
	$("#websitesright").hide();
	$("#websitesFlag").val('');
	if($("#ver3").val().length == 4){
		$.post("../portal/verCode?t=1&code="+$("#ver3").val(),function(data){
			if(data == 1)
			{		
				$("#websitesFlag").val(1);
				$("#websiteserror").hide();
				$("#websitesright").show();				
			}
			if(data == 0)
			{	
				$("#websitesFlag").val('');
				$("#websitesright").hide();
				$("#websiteserror").show();				
			}
		});
	}else{
		$("#websiteserror").show();
	}
}