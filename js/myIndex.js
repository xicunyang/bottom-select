$(function() {
	var hgS1;
	var myData = [
					[{key:'北京',value:1},{key:'西安',value:2},{key:'湖南',value:3}],
					['王菲','窦唯','宋冬野','赵雷','房东的猫','安九'],
					['无法长大', '不开的唇', '南海少年', '传奇', '已是两条路上的人', '阿刁']
				];
	$('.btn_open').on('click', function() {
		swiper = new selectSwiper({
			el: '.select1',
			colNum:3,
			data: myData,
			init: function(index) {
				// 初始化成功 
			},
			updated: function(index){
				// 更新数据成功 
				console.log("数据更新成功"+index);
			},
			mtSlideChangeEnd:function(swiper,activeIndex){
				// 移动停止 
				console.log(swiper.myIndex);
				console.log("activeIndex"+activeIndex)
			},
			submit:function(data){
				// 提交成功
				swiper.close();
			},
			cancel:function(){
				// 取消提交
				console.log("取消成功");
			}
		});
		// 打开底部选择器
		swiper.open();
	});
	
	$(".btn_close").click(()=>{
		// 关闭底部选择器
		swiper.close();
	});
	
	$(".updateData").click(()=>{
		// 模拟更新数据
		var newData = ["111","222","333","444",];
		//  更新数据 - (待更新的列下标 , 更新的数据)
		swiper.update_data(2,newData);
	})
});
