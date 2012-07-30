/*
jQuery plugin : dragonsort
--- v0.0.1 2012-06-29
	‧開始coding
--- v0.0.2 2012-06-30
	‧水平sorting完成
--- v0.0.3 2012-07-05
	‧將監聽方式改為.on()
	‧新增options.sortDirection
	‧新增options.childrenSelector
--- v0.0.4 2012-07-19
	‧判斷方式改成document.elementFromPoint(x, y)!
	‧(to-do) position? offset?
--- v0.0.5 2012-07-20
	‧offset() -> position()
--- v0.0.6 2012-07-20
	‧目標最底層
	‧helper被覆蓋的問題
*/

;(function($){

	$.fn.dragonsort = function(_options, debug){

		if (debug) console.log('dragonsort running.');

		$(this).addClass('dragonsort');

		var dragonsortElement = this.get(0);

		var defaultOptions = {
			childrenSelector : '*',
			dragDirection : 'both',
			sortDirection : 'vertical'
		};

		

		var options = $.extend(true, defaultOptions, _options);
		var prevElement = null;
		var nextElement = null;
		var oldIndex = null;
		var shiftX = null;
		var shiftY = null;

		$(this).on('mousedown', '.dragonsort > '+options.childrenSelector, function(e){
			if (debug) console.log('%s mousedown', $(this).attr('class'));
			e.preventDefault();

			//$('.placeholder')[0]
			var beenDraged = this;
			//initialize
			prevElement = $(this).prev();
			nextElement = $(this).next();
			oldIndex = $(this).css("z-index");
			oldPosition = $(this).css("position");
			shiftX = e.pageX - $(this).position().left;
			shiftY = e.pageY - $(this).position().top;

			//clone一份當helper
			$(this).parent().prepend($(this).clone().addClass('helper').css({
				'position' : 'absolute',
				'margin' : 0
			}).position({top : $(this).position().top, left : $(this).position().left}));
			//讓原來的變hidden, 加上placeholder class
			$(this).css("visibility", "hidden").addClass('placeholder');

			//讓helper顯示在最上層
			$('.helper').css("z-index", 10000);

			$('.helper').on('mousemove', function(e){

				//switch for options.dragDirection
				switch (options.dragDirection) {
					case 'vertical' :
						$('.helper').offset({top : e.pageY-shiftY});
						break;
					case 'horizontal' :
						$('.helper').offset({left : e.pageX-shiftX});
						break;
					case 'both':
					default :
						$('.helper').offset({top : e.pageY-shiftY, left : e.pageX-shiftX});
						break;
				}	

				//取得helper中心點座標
				var helperCenterPosition = {
					'x' : $('.helper').position().left + $('.helper').width()/2 - $(document).scrollLeft(),
					'y' : $('.helper').position().top + $('.helper').height()/2 - $(document).scrollTop()
				};

				//利用暫時把helper藏起來的方式取得中心點上的element
				$('.helper').hide();
				//var targetElement = document.elementFromPoint(helperCenterPosition.x, helperCenterPosition.y);
				var targetElement = findLastElement(helperCenterPosition.x, helperCenterPosition.y);
				$('.helper').show();
				
				//檢查該元素是不是同一層
				if ($(targetElement).parent('.dragonsort').length > 0) {
					//檢查placeholder在target的前面還是後面
					//如果是前面
					if ($('.dragonsort>*').index(beenDraged) < $('.dragonsort>*').index(targetElement)) {
						//就搬到target後面
						$(targetElement).after($('.placeholder'));
					} else {
						$(targetElement).before($('.placeholder'));
					}
					
				}
				
				//移除瀏覽器預設的選取動作-----------------------------------

				// cancel out any text selections
        		document.body.focus();

		        // prevent text selection in IE
		        document.onselectstart = function () { return false; };
		        // prevent IE from trying to drag an image
		        $(this).ondragstart = function() { return false; };
        
		        // prevent text selection (except IE)
		        return false;
		        //-----------------------------------------------------------

			}).on('mouseleave', function(e){
				if (debug) console.log('%s mouseleave', $(this).attr('class'));

				//檢查往下找找不找的到helper
				var _target = document.elementFromPoint(e.pageX, e.pageY);



				var elementQueue = new Array();
				do {
					//找到 helper
					if ($(_target).hasClass('helper')) {
						//找完了，把隱藏的元素顯示出來
						$.each(elementQueue, function(idx, element){
							$(element).show();
						});
						return;
					} else {

						//不是helper
						//找上一層
						$(_target).hide();
						elementQueue.push(_target);
						_target = document.elementFromPoint(e.pageX, e.pageY);
						if (_target == null) {
							break;
						}
						if (_target.tagName == 'HTML' || _target.className == dragonsortElement.className) {
							//已經到底
							break;
						}

					}
				} while(1);
				//找完了，把隱藏的元素顯示出來
				$.each(elementQueue, function(idx, element){
					$(element).show();
				});

				$(this).off('mousemove').off('mouseleave').off('mouseup').css({
					"z-index" : oldIndex,
					"position" : oldPosition
				}).remove();
				$('.placeholder').removeClass('placeholder').css("visibility", "visible");;
				$(this).
				oldIndex = null;
				oldPosition = null;
				shiftX = null;
				shiftY = null;
			}).on('mouseup', function(e){
				if (debug) console.log('%s mouseup', $(this).attr('class'));
				$(this).off('mousemove').off('mouseleave').off('mouseup').css({
					"z-index" : oldIndex,
					"position" : oldPosition
				}).remove();
				$('.placeholder').removeClass('placeholder').css("visibility", "visible");
				$('.helper').remove();
				oldIndex = null;
				oldPosition = null;
				shiftX = null;
				shiftY = null;	
			});

		});

		function findLastElement(_x, _y) {
			//用來放探找過程中被隱藏的element
			var _target = document.elementFromPoint(_x, _y);
			var elementQueue = new Array();
			do {
				//把當前目標隱藏，好讓document.elementFromPoint可以找到下一層的element
				$(_target).hide();
				//把當前目標push進array，處理完的時候記得取消隱藏
				elementQueue.push(_target);
				//target的上一層元素
				var prevElement = document.elementFromPoint(_x, _y);
				if (prevElement == null) {
					break;
				}
				//看看上一層元素是不是已經到底層(html or plugin target)
				if (prevElement.tagName == 'HTML' || prevElement.className == dragonsortElement.className) {
					//是就break
					break;
				} else {
					//不是就把當上一層當target繼續找
					_target = prevElement;
				}
			} while(1);
			//找完了，把隱藏的元素顯示出來
			$.each(elementQueue, function(idx, element){
				$(element).show();
			});
			return _target;
		}

	}; //end dragonsort

	$.fn.disableSelection = function() {
		return this.each(function(){
			$(this).attr('unselectable', 'on').css({
				'-moz-user-select':'none',
                '-o-user-select':'none',
                '-khtml-user-select':'none',
                '-webkit-user-select':'none',
                '-ms-user-select':'none',
                'user-select':'none'
			}).bind('selectstart', function(){
				return false;
			})
		});
	}; //end disableSelection

})(jQuery);