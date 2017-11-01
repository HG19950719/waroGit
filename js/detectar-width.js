		
//查询屏幕宽度，对应设置字体
!(function(doc, win) {
	var docEle = doc.documentElement,
		evt = "onorientationchange" in window ? "orientationchange" : "resize",
	fn = function() {

    	
    	function ex() {
    		width = docEle.clientWidth
    		width && (docEle.style.fontSize = width / 10 + "px");

    	}
		setTimeout(ex, 300);

		
		var width = docEle.clientWidth
    	width && (docEle.style.fontSize = width / 10 + "px");

    };
 
		win.addEventListener(evt, fn, false);
		doc.addEventListener("DOMContentLoaded", fn, false);
   	
}(document, window));