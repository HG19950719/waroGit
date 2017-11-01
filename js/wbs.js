/*
 * Warolink服务框架调用包装
 * 使用前请先引用jquery.js文件,使用了jquery的$.ajax
 * @author  svnhg@qq.com
 * @version 3.0.0.1
 * @history 
 *	2017-08-25 2.0.0.1  采用模块化思想重构
 *  2017-09-12 3.0.0.1 wbs包装[tools/工具,app/应用,pay/支付,msg/消息回调]四个对象 
 * 
 * */

// 框架模块封装
var wbs = ((function (window){
	// 常量
	var gFRSPLIT_FLD  ='#_F$';
	var gFRSPLIT_ROW  ='#_R$';
	var fr_ret_errmsg = "{\"out_flg\":\"F\",\"out_msg\":\"terminal error,please check network.\"}";
	var fr_ret_obj    = null;
	var fr_ret_body   = null;
	// 客户端存储对象
	var fr_session    = sessionStorage;
	var fr_storage	  = ((function(){
		if(typeof localStorage == "object"){ return localStorage;}
		else if(typeof globalStorage == "object"){ return globalStorage[location.host];}
		else { return undefined;}
	}))();

	// 工具api封装,其他对像有可能依赖tools因此放在最前
	var tools = ((function(window){
		// 1.Input控件录入校验
		// inputID       input 录入框id
		// valueType
		//     CODE      代码
		//     NAME      名称
		//     DATE      日期		 
		//     EMAIL     邮箱
		//     URL       网页地址
		//     MOBILE    手机号
		//     HK_MOBILE 香港手机号
		//     TEL       固定电话
		//     IDCARD    身份证号
		//     HK_IDCARD 香港身份证号
		//     CASH      金额
		//     NUM       数量
		//     WEIGHT    重量
		//     MEMO      备注
		// isRequired    是否必录字段
		// minLen        最小长度
		// maxLen        最大长度
		var validate = function(inputID,valueType,isRequired,alertMsg,minLen,maxLen){
			inputObj = window.document.getElementById(inputID);
			if(inputObj == null){
				alert(inputID+"不是有效的录入对象!");
				return false;
			}
			var str = inputObj.value.trim();    
		    if(str.length==0){    
		        if(isRequired == true){alert(alertMsg+':录入不能为空或者为空格!');return false;}
		        else{return true;}
		    }
		    if(!isNaN(minLen) && !isNaN(maxLen) && (maxLen>=minLen)){
		    	if(str.length < minLen || minLen > maxLen){
		    		alert(alertMsg+",长度("+minLen +"~"+maxLen +")");
		    		return false;
		    	}
		    }
			switch (valueType){
				case "CODE":      //代码
				var reg = /^[a-zA-Z0-9_]{1}[0-9a-zA-Z_]{2,15}$/;
				break;
				case "NAME":      //名称
				var reg = /^[a-zA-Z0-9_\u4E00-\uFA29]{2,64}$/; ///(^[a-zA-Z0-9_]{1}([a-zA-Z0-9_]){2,64}|(^[\u4E00-\uFA29]{1}[a-zA-Z0-9\u4E00-\uFA29]{1,7}))$/;
				break;
				case "DATE":      //日期
				var reg = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
				break;
				case "EMAIL":     //邮箱
				var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
				break;
				case "URL":       //网页地址
				var reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/i;
				break;
				case "MOBILE":    //手机号
				var reg = /^1[34578]\d{9}$/;
				break;
				case "HK_MOBILE": //香港手机号
				var reg = /^([6|9])\d{7}$/;
				break;
				case "TEL":       //固定电话
				var reg = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
				break;
				case "IDCARD":    //身份证号
				var reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
				break;
				case "HK_IDCARD": //香港身份证号
				var reg = /^[A-Z]?[A-Z]{1}\d{6}\([0-9A]{1}\)$/;
				break;
				case "CASH":      //金额
				var reg = /^[0-9]+(.[0-9]{1,3})?$/;
				break;
				case "NUM":       //数量
				var reg = /^\d{1,16}$/;
				break;
				case "WEIGHT":    //重量
				var reg = /^[0-9]+(.[0-9]{1,3})?$/;
				break;
				case "MEMO":      //备注
					return true;
				break;
				default:
				{
					alert("valueType值传入错误!");
					return false;
				}
			}
			if(!reg.test(str)){alert(alertMsg);if(inputObj.type=="text"){inputObj.focus();}return false;}
			return true;
		};
		
		// 2.检查biz执行返回对象
		// retObj       返回对象
		// if_ds        是否存在数据集
		// if_ds_record 是否存在记录
		var chkRet = function chkRet(retObj,if_ds,if_ds_record){
			if(retObj == undefined ||
			   retObj == null ||
			   retObj.out_flg == undefined ||
			   retObj.out_flg == null ||
			   retObj.out_msg == undefined ||
			   retObj.out_msg == null
			){
				alert("非法的业务返回对象!");
				return false;
			}
			
			if(retObj.out_flg != "T"){
				alert("返回失败:"+retObj.out_msg);
				return false;
			}
			
			if(if_ds && (retObj.out_ds == undefined || retObj.out_ds == null || retObj.out_ds.RECORDS == undefined || retObj.out_ds.RECORDS == null)){
				alert("返回数据集解析失败!"); 
				return false;
			}
			
			if(if_ds_record && (retObj.out_ds == undefined || retObj.out_ds == null || retObj.out_ds.RECORDS == undefined || retObj.out_ds.RECORDS == null ||
			   retObj.out_ds.RECORDS[0] == undefined ||
			   retObj.out_ds.RECORDS[0] == null))
			{
				
				alert("返回数据集为空!"); 
				return false;
			}
			
			return true;
		};
		
		//3. 对象类型测试
		var is ={types : ["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", "Window", "HTMLDocument"]};
		for(var i = 0;i<is.types.length;i++) 
		{
			is[is.types[i]] = (function(type) 
			{
				return function(obj)
				{
					return Object.prototype.toString.call(obj) == "[object " + type + "]";
				}
			}
			)(is.types[i]);
		}
		
		// 其他扩展API,全局
		// 1.日期格式化
		Date.prototype.format = function(format){ 
			var o = { 
			"M+" : this.getMonth()+1, //month 
			"d+" : this.getDate(), //day 
			"h+" : this.getHours(), //hour 
			"m+" : this.getMinutes(), //minute 
			"s+" : this.getSeconds(), //second 
			"q+" : Math.floor((this.getMonth()+3)/3), //quarter 
			"S" : this.getMilliseconds() //millisecond 
			};
		
			if(/(y+)/.test(format)) { 
				format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
			} 
		
			for(var k in o) { 
				if(new RegExp("("+ k +")").test(format)) { 
					format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
				} 
			}
			return format; 
		};
		// 2.求字串长度,双字节字符长度计算为2
		String.prototype.len = function(){return this.replace(/[^x00-xff]/g,"aa").length;};
		// 3.删除两端空白字符
		String.prototype.trim = function(){return this.replace(/(^\s*)|(\s*$)/g, "");};		
		

		return {
			validate : validate,
			chkRet   : chkRet,
			is       : is
		}
	}
	)(window));

	// application业务封装
	var app  = ((function (window){
//		var fr_app_host = "http://www.touch-apos.com/wbsjxc";
		var fr_app_host = "http://yuntest.warolink.com:8100/wbsjxc";

		var fr_login_info = null;

		// application调用
		var biz = function(biz,cmd,mitems,ditems)
		{
			var htmlobj=$.ajax({url:fr_app_host+"/WFrGatewayTrans",type: 'POST',xhrFields:{withCredentials: true},crossDomain: true,data: {biz:biz, cmd:cmd,mitems:mitems,ditems:ditems},async:false});
			fr_ret_body = htmlobj.responseText;
			fr_ret_obj = eval('(' + htmlobj.responseText + ')');
			console.log("app_biz [" +fr_app_host+"/WFrGatewayTrans?biz="+biz+"&cmd="+cmd+"&mitems="+encodeURIComponent(mitems)+"&ditems="+encodeURIComponent(ditems) + "] return:"+htmlobj.responseText);
			if(typeof(fr_ret_obj) != "object" || typeof(fr_ret_obj.out_flg) == "undefined") fr_ret_obj = eval('(' + fr_ret_errmsg + ')');
			return fr_ret_obj;
		};

		var login_trader = function(trader,password){
			biz("BIZ_BASE","TRADER_LOGIN",trader + gFRSPLIT_FLD + password,"");
			if(fr_ret_obj.out_flg != "T" || 
			   typeof(fr_ret_obj.out_ds) == "undefined" ||
			   typeof(fr_ret_obj.out_ds.RECORDS) == "undefined" ||
			   typeof(fr_ret_obj.out_ds.RECORDS[0]) =="undefined"){
				fr_storage.setItem("wbs_app_login_info","{}");	
			}
			else{
				biz("BIZ_BASE","GET_LOGIN","GET_LOGIN","");
				if(fr_ret_obj.out_flg != "T" ){
					fr_storage.setItem("wbs_app_login_info","{}");
				}
				else{
					fr_storage.setItem("wbs_app_login_info",JSON.stringify(fr_ret_obj));
				}
			}
			return fr_ret_obj;
		};

		var login_trader_user = function(user,password,trader){
			biz("BIZ_BASE","TRADER_USER_LOGIN",user + gFRSPLIT_FLD + password + gFRSPLIT_FLD +trader,"");
			if(fr_ret_obj.out_flg != "T" || 
			   typeof(fr_ret_obj.out_ds) == "undefined" ||
			   typeof(fr_ret_obj.out_ds.RECORDS) == "undefined" ||
			   typeof(fr_ret_obj.out_ds.RECORDS[0]) =="undefined"){
				fr_storage.setItem("wbs_app_login_info","{}");	
			}
			else{
				biz("BIZ_BASE","GET_LOGIN","GET_LOGIN","");
				if(fr_ret_obj.out_flg != "T" ){
					fr_storage.setItem("wbs_app_login_info","{}");
				}
				else{
					fr_storage.setItem("wbs_app_login_info",JSON.stringify(fr_ret_obj));
				}
			}
			return fr_ret_obj;
		};

		// application检查登录
		var chk_login =function ()
		{
			fr_login_info = eval('(' + fr_storage.getItem("wbs_app_login_info") + ')');
			if(fr_login_info == null || typeof(fr_login_info) != "object" || typeof(fr_login_info.out_flg) == "undefined" || fr_login_info.out_flg != "T" ) return false;
			return true;
		};

		// application登出
		var login_out =function ()
		{
			var ret = biz("BIZ_BASE","LOGOUT","LOGOUT","");
			if(ret.out_flg != "T" ) return false;
			
			fr_login_info = fr_storage.setItem("wbs_app_login_info","{}");
			return true;
		};

		// 构建返回对象
		var get_login = function(){return fr_login_info;};
		var set_url   = function(url){fr_app_host = url;};
		var get_url   = function(){return fr_app_host};
		return {
			biz					:biz,
			set_url 			:set_url,
			get_url				:get_url,
			login_trader		:login_trader,
			login_trader_user	:login_trader_user,
			get_login			:get_login,
			chk_login			:chk_login,
			login_out			:login_out
		};
	})(window));	

	// PAY业务封装
	var pay  = ((function (window){
		// 支付服务器
		var fr_tpay_host = fr_storage.getItem("wbs_pay_host");
		if(fr_tpay_host == null || fr_tpay_host =="null" || fr_tpay_host.length < 10){
			fr_tpay_host = "http://www.touch-apos.com/wbs";
			fr_storage.setItem("wbs_pay_host",fr_tpay_host);
		}
		// 在线支付连接
		var fr_online_pay_url = fr_storage.getItem("wbs_pay_onlinepay_url");
		if(fr_online_pay_url == null || fr_online_pay_url =="null" || fr_online_pay_url.length < 10){
			fr_online_pay_url = "http://www.touch-apos.com/wbs/WOnlinePay?";
			fr_storage.setItem("wbs_pay_onlinepay_url",fr_online_pay_url);
		}
		var fr_login_info = null;
		
		// pay调用
		var biz = function(biz,cmd,mitems,ditems)
		{
			var htmlobj=$.ajax({url:fr_tpay_host+"/WFrGatewayTrans",type: 'POST',xhrFields:{withCredentials: true},crossDomain: true,data: {biz:biz, cmd:cmd,mitems:mitems,ditems:ditems},async:false});
			fr_ret_body = htmlobj.responseText;
			fr_ret_obj = eval('(' + htmlobj.responseText + ')');
			console.log("pay_biz [" +fr_tpay_host+"/WFrGatewayTrans?biz="+biz+"&cmd="+cmd+"&mitems="+encodeURIComponent(mitems)+"&ditems="+encodeURIComponent(ditems) + "] return:"+htmlobj.responseText);
			if(typeof(fr_ret_obj) != "object" || typeof(fr_ret_obj.out_flg) == "undefined") fr_ret_obj = eval('(' + fr_ret_errmsg + ')');
			return fr_ret_obj;
		};
		
		// pay_call调用
		var pay_call = function (ptraderID,pshop,psalesman,pcall,ppayMethod,pcode,ptraderCash,pproduct,porderno)
		{
			var htmlobj=$.ajax({url:fr_tpay_host+"/WFrTradeWebpaySvc",type: 'POST',xhrFields:{withCredentials: true},crossDomain: true,data: {traderID:ptraderID,shop:pshop,salesman:psalesman,call:pcall,payMethod:ppayMethod,auth_code:pcode,traderCash:ptraderCash,product:pproduct,orderno:porderno},async:false});
			fr_ret_body = htmlobj.responseText;
			fr_ret_obj = eval('(' + htmlobj.responseText + ')');
			console.log("pay_call [" +fr_tpay_host+"/WFrTradeWebpaySvc"+ "] return:"+htmlobj.responseText);
			if(typeof(fr_ret_obj) != "object" || typeof(fr_ret_obj.out_flg) == "undefined") fr_ret_obj = eval('(' + fr_ret_errmsg + ')');
			return fr_ret_obj;
		};
		
		// 商户登录
		var login_trader = function(trader,password){
			biz("BIZ_BASE","TRADER_LOGIN",trader + gFRSPLIT_FLD + password,"");
			if(fr_ret_obj.out_flg != "T" || 
			   typeof(fr_ret_obj.out_ds) == "undefined" ||
			   typeof(fr_ret_obj.out_ds.RECORDS) == "undefined" ||
			   typeof(fr_ret_obj.out_ds.RECORDS[0]) =="undefined"){
				fr_storage.setItem("wbs_pay_login_info","{}");	
			}
			else{
				biz("BIZ_BASE","GET_LOGIN","GET_LOGIN","");
				if(fr_ret_obj.out_flg != "T" ){
					fr_storage.setItem("wbs_pay_login_info","{}");
				}
				else{
					fr_storage.setItem("wbs_pay_login_info",JSON.stringify(fr_ret_obj));
				}
			}
			return fr_ret_obj;
		};
		
		// 商户员工登录
		var login_trader_user = function(user,password,trader){
			biz("BIZ_BASE","TRADER_USER_LOGIN",user + gFRSPLIT_FLD + password + gFRSPLIT_FLD +trader,"");
			if(fr_ret_obj.out_flg != "T" || 
			   typeof(fr_ret_obj.out_ds) == "undefined" ||
			   typeof(fr_ret_obj.out_ds.RECORDS) == "undefined" ||
			   typeof(fr_ret_obj.out_ds.RECORDS[0]) =="undefined"){
				fr_storage.setItem("wbs_pay_login_info","{}");	
			}
			else{
				biz("BIZ_BASE","GET_LOGIN","GET_LOGIN","");
				if(fr_ret_obj.out_flg != "T" ){
					fr_storage.setItem("wbs_pay_login_info","{}");
				}
				else{
					fr_storage.setItem("wbs_pay_login_info",JSON.stringify(fr_ret_obj));
				}
			}
			return fr_ret_obj;
		};

		// pay检查登录
		var chk_login =function ()
		{
			fr_login_info = eval('(' + fr_storage.getItem("wbs_pay_login_info") + ')');
			if(fr_login_info == null || typeof(fr_login_info) != "object" || typeof(fr_login_info.out_flg) == "undefined" || fr_login_info.out_flg != "T" ) return false;
			return true;
		};
		
		// pay登出
		var login_out =function ()
		{
			var ret = biz("BIZ_BASE","LOGOUT","LOGOUT","");
			if(ret.out_flg != "T" ) return false;
			
			fr_login_info = fr_storage.setItem("wbs_pay_login_info","{}");
			return true;
		};
		
		// 构建返回对象
		var get_login = function(){return fr_login_info;};
		var set_url   = function(url){fr_tpay_host = url;};
		var get_onlinepay_url = function(){return fr_online_pay_url;};
		return {
			biz					:biz,
			pay_call			:pay_call,
			set_url 			:set_url,
			get_online_pay_url	:get_onlinepay_url,
			login_trader		:login_trader,
			login_trader_user	:login_trader_user,
			get_login			:get_login,
			chk_login			:chk_login,
			login_out			:login_out
		};
	})(window));		
	
	// nav封装,本地HTML跳转功能,参数通过url进行传递
	var nav = ((function(window){
		// 解析url参数到json对象
		var parseUrl =  function(url)
		{
			var obj={};
			var keyvalue=[];
			var key="",value=""; 
			var paraString=url.substring(url.indexOf("?")+1,url.length).split("&");
			for(var i in paraString)
			{
				keyvalue = paraString[i].split("=");
				key = keyvalue[0];
				value = keyvalue[1];
				obj[key] = value; 
			} 
			return obj;
		}
		
		// 浏览
		var nav = function(url){
			// 解析参数
			fr_session.setItem("wbs_current_page_parameters",JSON.stringify(parseUrl(url)));
			
			// 缓存浏览记录
			var pages = new Array();
			var spgs = fr_session.getItem("wbs_session_pages");
			if(spgs!=null && spgs != ""){pages = JSON.parse(spgs);}
			pages[pages.length] = url;
			fr_session.setItem("wbs_session_pages",JSON.stringify(pages));
			fr_session.setItem("wbs_session_page_no",pages.length);

			window.location.href = url;
		};
		
		// 新窗浏览
		var open = function(url){
			// 解析参数
			fr_session.setItem("wbs_current_page_parameters",JSON.stringify(parseUrl(url)));
			
			// 缓存浏览记录
			var pages = new Array();
			var spgs = fr_session.getItem("wbs_session_pages");
			if(spgs!=null && spgs != ""){pages = JSON.parse(spgs);}
			pages[pages.length] = url;
			fr_session.setItem("wbs_session_pages",JSON.stringify(pages));
			fr_session.setItem("wbs_session_page_no",pages.length);
			window.open(url);
		};
		
		// 跳转
		var go = function(step){
			var pageno = parseInt(fr_session.getItem("wbs_session_page_no"));
			if(isNaN(pageno) || step == 0) return;
			var pages = JSON.parse(fr_session.getItem("wbs_session_pages"));
			if(!wbs.tools.is.Array(pages)) return;
			
			pageno = pageno + step;
			if(pageno > pages.length || pageno <1) return;
			var url = pages[pageno-1];
			

			// 缓存浏览记录
			pages.splice(pageno-1,1);
			pages[pages.length] = url;
			fr_session.setItem("wbs_session_pages",JSON.stringify(pages));
			fr_session.setItem("wbs_session_page_no",pages.length);
			
			// 解析参数
			fr_session.setItem("wbs_current_page_parameters",JSON.stringify(parseUrl(url)));
			//fr_session.setItem("wbs_session_page_no",pageno);
			
			window.location.href = url;
		};

		// 获取当前页参数
		var getParameter = function(key){
			// 解析参数
			var sps = fr_session.getItem("wbs_current_page_parameters");
			if(sps == null || sps == "") return "";
			
			try{
				jsobj = JSON.parse(fr_session.getItem("wbs_current_page_parameters"));
				if(typeof jsobj[key] == "undefined"){ return "";}
				return jsobj[key];
			}
			catch(e)
			{
				return "";
			}
		}
		
		// 设置当前页参数
		var setParameter = function(key,value){
			// 解析参数
			var sps = fr_session.getItem("wbs_current_page_parameters");
			if(sps == null || sps == "") sps = "{}";
			
			try{
				jsobj = JSON.parse(sps);
				jsobj[key] = value;
				fr_session.setItem("wbs_current_page_parameters",JSON.stringify(jsobj));
				return true;
			}
			catch(e)
			{
				return false;
			}
		}

		return {
			nav		 : nav,
			open	 : open,
			go		 : go,
			getParameter :getParameter,
			setParameter :setParameter,
			parseUrl : parseUrl
		}
		
	}
	)(window));
	
	// wms消息系统-消息注册包装
	var msg = ((function(window){
		var fr_ws = null;
		var reg = function(p50,p51,p52,id_msg_element){
			if("WebSocket" in window  && wbs.pay.chk_login())
			{
				var viewMessage = function(msgbody,timestamp)
				{
					var	x = document.getElementById(id_msg_element);
					if(x == undefined || x == null) return;
					
					var ccolor = "green";
					if(-1 == msgbody.indexOf("成功")) ccolor = "red";
					var rec='<div class="mui-card">';
					rec+='<div class="mui-card-content" style="padding:15px">'+msgbody+'</div>';
					rec+='<div class="mui-card-footer" style="color:'+ ccolor +'">'+timestamp+'</div>';
					rec+='</div>';
					
					x.innerHTML =rec + x.innerHTML;
				}
				
				fr_ws = new WebSocket("ws://www.touch-apos.com:80/wbs/wrm/biz-nobly-ms");
				var onopenfunc = function()
				{
					//alert("连接打开");
					var reg = "{";
					reg += "\"msgtype\":\"" + "REGISTER" + "\",";
					reg += "\"traderid\":\"" + p50 + "\",";
					reg += "\"shopid\":\"" + p51 + "\",";
					reg += "\"userid\":\"" + p52 + "\",";
					reg += "\"traderpass\":\"" + "traderpass" + "\",";
					reg += "\"userpass\":\"" + "userpass" + "\",";
					reg += "}";
					fr_ws.send(reg);	
				};
				var onmessage_func =function(event)
				{
					var obj = eval('(' + event.data + ')');
					if(obj == null || (typeof obj) == "undefined" || obj.body == undefined) return;
					msg = obj.body;
					var d = (new Date).format("MM-dd hh:mm:ss");
					if(-1!=msg.indexOf("成功")){
						if(null != document.getElementById("id_audio_message")) document.getElementById("id_audio_message").play();
					}
					else{
						if(null != document.getElementById("id_audio_fail")) document.getElementById("id_audio_fail").play();
					}
					viewMessage(msg,d);
					mui.toast(msg,{ duration:'long', type:'div' });
				};
				var onclose_func = function()
				{
					fr_ws = new WebSocket("ws://www.touch-apos.com:80/wbs/wrm/biz-nobly-ms");
					fr_ws.onopen = onopenfunc;
					fr_ws.onmessage = onmessage_func;
					fr_ws.onclose = onclose_func;
				}
	
				fr_ws.onopen = onopenfunc;
				fr_ws.onmessage = onmessage_func;
				fr_ws.onclose = onclose_func;
			}
			else{
				alert("当前浏览器不支持消息服务");
			}
		};
		
		return {
			reg      : reg
		};		
	})(window));


	// 返回框架调用对象
	var getRetBody = function(){ return fr_ret_body;};
	var getRetObj =  function(){ return fr_ret_obj;};
	return {
		app             :app,
		pay             :pay,
		nav             :nav,
		tools           :tools,
		msg             :msg,
		gFRSPLIT_FLD    :gFRSPLIT_FLD,
		gFRSPLIT_ROW    :gFRSPLIT_ROW,
		getRetBody      :getRetBody,
		getRetObj       :getRetObj
	};
})(window));
