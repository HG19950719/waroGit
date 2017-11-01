$(function () {  
		//获取商品组
		function  setCommoditySeries() {
			var commoditySeriesContainer =  $("#commodity-series");
			var snull = "";
			//获取门店的商品组代码；
			var	pmitems =  '80' + wbs.gFRSPLIT_FLD+ '43' + wbs.gFRSPLIT_FLD + snull; 
			
			//存储拼接的字符串
			var temp = '';
			commodityArr = wbs.app.biz("BIZ_TPOS_SLSCH", "SLSCH_PRODCATEGORY_L1", pmitems, "").out_ds.RECORDS;

			for(var i = 0; i < commodityArr.length; i++) {

				if(i == 0) {
					temp += '<li class="commodity-select active" data-id="' + commodityArr[i][1] + '">' + commodityArr[i][4] + '</li>';			
					
				} else {
					temp += '<li class="commodity-select" data-id="' + commodityArr[i][1] +'">' + commodityArr[i][4] + '</li>';
				}
			}
			
			commoditySeriesContainer.html(temp);
			
			var commoditySelect = $('.commodity-select');
			commoditySelect.click(function () {
				//防止重复一个按钮刷新
				if( $(this).hasClass('active') ) {
					return;
				}
				//排他添加active类名
				commoditySelect.removeClass('active');
				$(this).addClass('active');
				
				
				//测试用，实际使用需删除下面判断
				if( $(this).attr('data-id') == 4 ) {
					return;
				}
				etCommodityInfo();
			})
		}
		
		setCommoditySeries();
		
		function etCommodityInfo() {
			var commodityInfoContainer = $("#commodity-info-list");
			var snull = "";
			var idValue = $('.commodity-select.active').attr("data-id");
			var pmitems2 =  '80' + wbs.gFRSPLIT_FLD + '43' + wbs.gFRSPLIT_FLD + idValue + wbs.gFRSPLIT_FLD + snull + wbs.gFRSPLIT_FLD + snull + wbs.gFRSPLIT_FLD + snull + wbs.gFRSPLIT_FLD + snull;
			commodityObj2 = wbs.app.biz("BIZ_TPOS_SLSCH", "SLSCH_PROD", pmitems2, "").out_ds.RECORDS;
			console.log(commodityObj2);
			var temp = '';
			
			for(var i = 0; i < commodityObj2.length; i++) {
				temp += '<li class="food-item clearfix" data-pid="' + commodityObj2[i][1] + '">' +
					'<div class="food-pic-wrap">' +
						'<img class="food-pic" src="images/food-icon/e224b5a4bc7d0d4a4eec040fcee15jpeg.jpg" alt/>' +
					'</div>' +
					'<div class="food-cont-wrap">' +
						'<div class="food-cont">' +
							'<p class="food-name">' + commodityObj2[i][2] + '</p>' +
							'<div class="food-content-sub">' +
								'<span>月售&nbsp;948</span>' +
								'<span class="food-good">赞233</span>' +
							'</div>' +
							'<div class="food-price-region">' +
								'<span class="food-price">¥' + Number(commodityObj2[i][7]) + '</span>' +
							'</div>' +
							'<div class="food-option clearfix">' +
								'<a class="btnCommodityAdd add-food fr" href="javascript:;">' +
									'<i class="cart-iconfont cart-icon-jia"></i>' +
								'</a>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</li>';
			}
			commodityInfoContainer.html(temp);
			onCartBtnAddSub();
			
		}
		
		etCommodityInfo();
}); 