

var product={  
    id:0,  
    name:"",  
    num:0,  
    price:0.00  
};  
var orderdetail={  
    username:"",  
    phone:"",  
    address:"",  
    zipcode:"",  
    totalNumber:0,  
    totalAmount:0.00      
}  

var cart = {
		
}







/*
    功能：计算总价格
 */

function getTotalPrice() {
	
    var foodNums = $('.food-num');
    var sum = 0;

    for(var i = 0, len = cks.length; i < len; i++) {

        var tempNum = foodNums[i].innerHTML;
        sum = Number(temp) + sum;
    }
    
    return sum;
}


function onCartBtnAddSub() {
	var btnCommodityAdds = $('.btnCommodityAdd');
		console.log(btnCommodityAdds);
	//绑定+按钮事件
	btnCommodityAdds.click(function () {
		alert(1);
		var self = $(this);
        var numObj = self.next('span')[0];//上一个兄弟节点

		if(!numObj) {
			var temp = document.createElement('div');
			temp.innerHTML ='<span class="food-num">1</span>' +
				'<a class="btnCommoditySub sub-food fl" href="javascript:;">' +
					'<i class="cart-iconfont cart-icon-jian"></i>' +
				'</a>';
			self.parent().append(temp.children);
			
			cartCommoditySub(self.nextAll('a')[0]);
		} else {
			numObj.innerText = Number(numObj.innerText) + 1;
		}

		
	});
	
	//绑定购物车商品减函数
	function cartCommoditySub(self) {

		$(self).click(function () {
			var self = $(this);
			var numObj = self.prev('span')[0];
			numObj.innerText = Number(numObj.innerText) - 1;
			if(Number(numObj.innerText) < 1) {
				$(numObj).remove();
				self.remove();
			}
			
		
		});
	}
}

