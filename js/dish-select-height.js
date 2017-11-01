
window.onload = function () {
	
	!function () {
		
	 	var evt = "onorientationchange" in window ? "orientationchange" : "resize";
		
		/*调整选择区高度*/
	 	function changeSelectHeight () {
	 		
	 		var selectHeight = $(window).height() - $('.head')[0].offsetHeight;
	
	 		$('.container').css({
	 			'height' : selectHeight + 'px'
	 		});
	 		
	 		$('.commodity-series').css({
	 			'height' : selectHeight - ( $('.all-commodity')[0].offsetHeight + $('.j-cart-footer')[0].offsetHeight ) + 'px'
	 		});
	 		
	 		$('.series-list').css({
	 			'height' : selectHeight - ( $('.all-commodity')[0].offsetHeight + $('.j-cart-footer')[0].offsetHeight ) + 'px'
	 		});
	 	}
	 	
	 	changeSelectHeight();
	 	window.addEventListener(evt, changeSelectHeight, false);
	}()

}