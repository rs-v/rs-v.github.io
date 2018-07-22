var token;
//全局默认参数，添加token验证
$.ajaxSetup({
	data:{
		   "token":taken_for_user
    },
	type:'POST',
	headers:{
		"token": taken_for_user
    }
});