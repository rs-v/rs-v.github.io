var    ip  ="192.168.0.1:80"
function
 FindProxyForURL(url, host)
 { if (isPlainHostName("weixin.com")) return "DIRECT"; 
else return "PROXY "+ip  ; }
