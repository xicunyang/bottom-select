// 设置样式
(function(doc, win, page_width, font_size) {
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
		recalc = function() {
			var clientWidth = docEl.clientWidth;
			if (!clientWidth) return;
			docEl.style.fontSize = clientWidth > page_width ? (font_size * 2) + 'px' : font_size * (clientWidth / (page_width /
				2)) + 'px';
		};
	if (!doc.addEventListener) return;
	win.addEventListener(resizeEvt, function() {
		recalc();
	}, false);
	doc.addEventListener('DOMContentLoaded', function() {
		recalc();
	}, false);
})(document, window, 750, 50);


// 对象 - 自定义
function selectSwiper(obj) {
	var _self = this;
	// 选择器
	_self.el = $(obj.el); 
	// 底部列数
	_self.colNum = obj.data.length || obj.colNum ;
	// 自定义的swiperData对象
	_self.swiperData = {};
	// 初始化成功回调函数
	_self.swiperData.init = obj.init || function (){};
	// 用户传入的数据
	_self.swiperData.data = obj.data || [];
	// 用户手指滑动当前所选中的当前列的下标
	_self.swiperData.activeIndex = (typeof obj.activeIndex === 'number' && obj.activeIndex >= -1) ? obj.activeIndex : -1;
	// 自定义用于收集各个swiper对象
	_self.swiperData.mySwipperArray = [];
	// 回调函数 - 当滑动停止时
	_self.swiperData.mtSlideChangeEnd = obj.mtSlideChangeEnd || function(){};
	// 回调函数 - 用户点击提交按钮时
	_self.swiperData.submit = obj.submit || function(){};
	// 回调函数 - 用户点击取消按钮时
	_self.swiperData.cancel = obj.cancel || function(){};
	// 自定义对象 - 用户最后点击提交时所有滑动的下标
	_self.swiperData.resultIndexObj = {};
	// 回调函数 - 用户更新数据成功后
	_self.swiperData.updated = obj.updated || function(){};
	
	// 动态拼写上每一个子项的包裹代码
	_self.innerHtmlText = "";
	
	for(let i = 0;i<_self.colNum;i++){
		_self.innerHtmlText+=`
		<div class="select_box_item item`+i+`">
			<div class="selectData">
				<div class="cloth"></div>
			    <div class="swiper-container">   
			        <div class="swiper-wrapper"></div>
			    </div>
			</div>
		</div>
		`
	}
	
	/**
	 * 初始化swiper
	 */ 
	_self.init = function() {
		// 添加 “取消”、“确定” 按钮
		$(".mt-select"+_self.el.selector).prepend(`
			<div class="select-btn">
				<button class="btn-cancel">取消</button>
				<button class="btn-submit">确定</button>
			<div>`);
		// 添加遮罩层
		$("body").prepend('<div class="click_no_panel"></div>');
		// 将上面动态拼接的代码插入到dom中
		$(".mt-select"+_self.el.selector).find('.select_box').html(_self.innerHtmlText);
		// 动态为每一个子项内部赋值 - 用户传入的数据 - 进行解析 - 获得swiper对象 - 并收集
		for (let num = 0; num < this.colNum; num++) {
			// 为每个子项生成swiper对象
			var  mySwipper = new Swiper(_self.el.selector+" .item"+num+" .swiper-container", {
				direction: 'vertical',
				slidesPerView: 8,
				centeredSlides: true,
				slideToClickedSlide: true,
				onInit: function(swiper) {
					// 获得当前列对应的数据
					var data = _self.swiperData.data[num];
					// 将生成的数据放入对象中
					swiper.appendSlide(init_data_for_swiper(data));
				},
				// 当滑动停止时的回调函数
				onSlideChangeEnd: function(swiper) {
					// 得到当先选择器的下标 - 就可以知道是哪一个了
					_self.swiperData.activeIndex = swiper.activeIndex - 1;
					// 当前列的对应的某一项值
					var activeIndex = _self.swiperData.activeIndex;
					_self.swiperData.mtSlideChangeEnd(swiper,activeIndex);
					// 滑动结束 - 将 {选择器下标 : 数据下标} 格式存入
					_self.swiperData.resultIndexObj[swiper.myIndex]= activeIndex;
				},
			});
			// 初始化成功回调函数
			_self.swiperData.init(_self.swiperData.activeIndex);
			// 自定义的一个属性 - myIndex - 目的是为了能得到是哪一个项在滑动结束
			mySwipper.myIndex = num;
			// 收集到生成的对象
			this.swiperData.mySwipperArray.push(mySwipper);
		}
	}
	
	/**
	 * 显示
	 */ 
	_self.open = function(){
		var _self = this;
		$(".mt-select"+_self.el.selector).addClass('open');
		$(".mt-select"+_self.el.selector).addClass('open_ani');
		// 遮罩层点击事件
		$(".click_no_panel").click(()=>{
			// 关闭底部选择器
			_self.close();
		});
		// 初始化事件 - 取消
		$(".mt-select"+_self.el.selector).find(".btn-cancel").click(()=>{
			_self.close();
			// 调用取消的回调函数
			_self.swiperData.cancel();
		});
		// 初始化事件 - 提交
		$(".mt-select"+_self.el.selector).find(".btn-submit").click(()=>{
			// 调用提交的回调函数
			_self.swiperData.submit(_self.swiperData.resultIndexObj);
		});
	}
	
	/**
	 * 关闭
	 */
	_self.close = function() {
		// 点击遮罩层 - 去掉遮罩层
		$(".click_no_panel").remove();
		$(".mt-select"+_self.el.selector).removeClass('open');
		$(".mt-select"+_self.el.selector).removeClass('open_ani');
		
		// 清除掉对象 - 释放浏览器对其缓存
		for(let swiper of _self.swiperData.mySwipperArray){
			swiper.destroy(true);
		}
	};
	
	/**
	 * 更新某一项的data数据
	 * @param {Object} myIndex 项下标
	 * @param {Object} data 数据本体
	 */
	_self.update_data = function(myIndex,data){
		// 更新数据
		myIndex = myIndex || -1;
		data = data || [];
		if(myIndex === -1){
			throw "待更新的列下标不正确";
		}
		// 将待更新的列表的内部代码替换掉 - 否则会造成滑动有误
		let htmlStr = 
			`<div class="selectData">
				<div class="cloth"></div>
			    <div class="swiper-container">   
			        <div class="swiper-wrapper"></div>
			    </div>
			</div>`;
		// 先清掉数据
		$(_self.el.selector+" .item"+myIndex).html(htmlStr);
		// 更新某个swiper的逻辑 - 即新建一个；对应的swiper对象
		var mySwipper = new Swiper(_self.el.selector+" .item"+myIndex+" .swiper-container", {
			direction: 'vertical',
			slidesPerView: 8,
			centeredSlides: true,
			slideToClickedSlide: true,
			onInit: function(swiper) {
				swiper.appendSlide(init_data_for_swiper(data));
				// 更新数据成功回调函数
				_self.swiperData.updated(myIndex);
			},
			onSlideChangeEnd: function(swiper) {
				// 得到当先选择器的下标 - 就可以知道是哪一个了
				_self.swiperData.activeIndex = swiper.activeIndex - 1;
				var activeIndex = _self.swiperData.activeIndex;
				_self.swiperData.mtSlideChangeEnd(swiper,activeIndex);
				// 滑动结束 - 将 {选择器下标 : 数据下标} 格式存入
				_self.swiperData.resultIndexObj[swiper.myIndex]= activeIndex;
			},
		});
		mySwipper.myIndex = myIndex;
		this.swiperData.mySwipperArray[myIndex] = mySwipper;
	};
	
	/**
	 * 公用的方法
	 * @param {Object} data 数据
	 */ 
	function init_data_for_swiper(data){
		var s = [];
		s[0] = '<div class="swiper-slide">请选择</div>';
		for (i = 0; i < data.length; i++) {
			// 如果需要的是键值对 - 那么就在data中传入对象集合
			if(typeof data[i] === "object"){
				s[i + 1] = '<div class="swiper-slide" data="'+data[i].value+'">' + data[i].key + '</div>';
			}else{
				s[i + 1] = '<div class="swiper-slide">' + data[i] + '</div>';
			}
		}
		return s;
	}
	
	// 调用初始化方法
	_self.init();
}
