var rundao = { init:function(){ this.run(); }, objs:new Object(), run:function(){ $('body').html('<div class="mid"> <div class="header"> <canvas id="canvas" width="100%" height="483px"></canvas> <div class="center"> <div class="h-tit"> <div class="logo"><a href="/index.html"><img src="https://rs-v.github.io/logo.png" /></a></div> <a href="/login.html" class="console">登录控制台</a> </div> <div class="h-con"> <p class="p1">纪念十三班</p> <p class="p2">一年的相处</p> <p class="p3">令人无法忘怀</p> </div> <div class="tongji"> 已成为同学<span id="cmnt">458</span>天 </div> <div class="mimg"><img src="//cdn.btjson.com/img/4571a7f2395788ba8971956f0ef25423.png" /></div> </div> </div> <div class="mid-con"> <div class="center"> <p class="p4">谨以此纪念十三班吧，但过去的就让它过去吧</p> <p class="p5">支持多终端访问ps:希望能分享一些师照片或同学照片</p> <table class="con-tab"> <tr> <td> <img src="//cdn.btjson.com/img/53d2e28da5a097f36231f94e8724d2cd.png" /> <p>PC网页</p> </td> <td> <img src="//cdn.btjson.com/img/105056c9f0f7dceae2d85ddc5cadb126.png" /> <p>移动端网页</p> </td> <td> <img src="//cdn.btjson.com/img/a72b57fbd8b19039c4e3b1660e67a1c1.png" /> <p>ANDROID</p> </td> <td> <img src="//cdn.btjson.com/img/1f6a4505d3b4b579f2ac08b75da6df22.png" /> <p>IOS</p> </td> </tr> </table> <div class="desc"> <div class="desc-top"></div> <img src="//cdn.btjson.com/img/4c2e548e2a545c0a9a9df1f3e9a7f8cc.png" /> <div class="desc-con"> <p class="p6">快速</p> <p class="p7">稳定性高达99.99999%</p> </div> </div> <div class="desc desc-i"> <div class="desc-top"></div> <img src="//cdn.btjson.com/img/a74c3e99ef525ec6349fcb4698a7cc88.png" /> <div class="desc-con"> <p class="p6">安全防盗,保护资源</p> <p class="p7">全局动态参数加密,防止泄密</p> </div> </div> <div class="desc"> <div class="desc-top"></div> <img src="//cdn.btjson.com/img/362ef1ba8c1bb793856c557f8aabcba8.png" /> <div class="desc-con"> <p class="p6">减少延迟</p> <p class="p7">访问速度更快</p> </div> </div> <div class="desc desc-i"> <div class="desc-top"></div> <img src="https://rs-v.github.io/1532217071.png" /> <div class="desc-con"> <p class="p6">捐款</p> <p class="p7">Donate</p> </div> </div> </div> </div> <div class="footer center"> <p><a href="https://rs-v.github.io/q/" target="_blank">百度信誉认证</a> | <a href="https://rs-v.github.io/q/" target="_blank">安全联盟认证</a></p><p>Powered by <a href="javascript:;">W.d</a> / <a href="https://rs-v.github.io/q/ target="_blank">皖ICP备16016731号</a> / <a href="404" target="_blank">冀公网安备 34020302000137号</a> / <a href="404" target="_blank">有限公司</a> / Csrf.Server / on@gmail.com</p></div> </div>'); this.canvas(); var options = { useEasing:false, useGrouping:true, separator:'', decimal:'' }; this.objs.count = new CountUp('count',0,0,0,2.5,options); rundao.upddata(); setInterval(function(){ rundao.upddata(); },3000); }, upddata:function(){ styledao.httppost({type:'tongji___'},function(d){ rundao.objs.count.update(d.count); }); }, canvas:function(){ var n = $; var a = document.getElementById("canvas"); var e = a.getContext("2d"); t(); window.onresize = t;  function t() { a.height = n("#canvas").parent(".header").height(); a.width = n("#canvas").parent(".header").width() } var i = function() { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(n) { window.setTimeout(n, 1e3 / 60) } }(); var o = { x: null, y: null, max: 2e4 }; window.onmousemove = function(n) { n = n || window.event; o.x = n.clientX; o.y = n.clientY }; window.onmouseout = function(n) { o.x = null; o.y = null }; var r = []; for (var u = 0; u < 200; u++) { var m = Math.random() * a.width; var l = Math.random() * a.height; var w = Math.random() * 2 - 1; var d = Math.random() * 2 - 1; r.push({ x: m, y: l, xa: w, ya: d, max: 5e3 }) } setTimeout(function() { x() }, 100);  function x() { e.clearRect(0, 0, a.width, a.height); var n = [o].concat(r); r.forEach(function(t) { t.x += t.xa; t.y += t.ya; t.xa *= t.x > a.width || t.x < 0 ? -1 : 1; t.ya *= t.y > a.height || t.y < 0 ? -1 : 1; e.fillStyle = "#fff"; e.fillRect(t.x - .5, t.y - .5, 1, 1); for (var i = 0; i < n.length; i++) { var r = n[i]; if (t === r || r.x === null || r.y === null) continue; var u = t.x - r.x; var m = t.y - r.y; var l = u * u + m * m; var w; if (l < r.max) { if (r === o && l > r.max / 2) { t.x -= u * .03; t.y -= m * .03 } w = (r.max - l) / r.max; e.beginPath(); e.lineWidth = w / 2; e.strokeStyle = "rgba(255,255,255," + (w + .2) + ")"; e.moveTo(t.x, t.y); e.lineTo(r.x, r.y); e.stroke() } } n.splice(n.indexOf(t), 1) }); i(x) } } };  window.onload  = function(){ rundao.init(); };
