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
*/

;(function($){

	$.fn.dragonsort = function(_options, debug){

		if (debug) console.log('dragonsort running.');

		var defaultOptions = {
			childrenSelector : '*',
			dragDirection : 'both',
			sortDirection : 'vertical'
		};

		$(this).addClass('dragonsort');

		var options = $.extend(true, defaultOptions, _options);
		var prevElement = null;
		var nextElement = null;
		var oldIndex = null;
		var shiftX = null;
		var shiftY = null;

		$(this).on('mousedown', '.dragonsort > '+options.childrenSelector, function(e){
			if (debug) console.log('%s mousedown', $(this).attr('class'));
			
			//initialize
			prevElement = $(this).prev();
			nextElement = $(this).next();
			oldIndex = $(this).css("z-index");
			oldPosition = $(this).css("position");
			shiftX = e.pageX - $(this).offset().left;
			shiftY = e.pageY - $(this).offset().top;

			//clone一份當helper
			$(this).parent().prepend($(this).clone().addClass('helper').css({
				'position' : 'absolute',
				'margin' : 0
			}).offset({top : $(this).offset().top, left : $(this).offset().left}));
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

				//檢查要不要swap placeholder的位置
				//先檢查helper的上一個元素 (left) 且placeholder前面有東西(placeholder前面還不可以是helper)
				if ($('.placeholder').prev(':not(.helper)').length > 0 ) {
					//如果helper的left已經過了前一個元素的一半
					if (options.sortDirection == 'both' || options.sortDirection == 'horizontal') {
						if ($('.helper').offset().left < ($('.placeholder').prev().offset().left + ($('.placeholder').prev().width()/2) ) ) {
							//替換placeholder與前面一個元素的位置
							$('.placeholder').prev().before($('.placeholder'));
						}	
					}
					if (options.sortDirection == 'both' || options.sortDirection == 'vertical') {
						if ($('.helper').offset().top < ($('.placeholder').prev().offset().top + ($('.placeholder').prev().width()/2) ) ) {
							$('.placeholder').prev().before($('.placeholder'));
						}
					}	
				}
				
				//檢查helper下一個元素
				if ($('.placeholder').next().length > 0 ) {
					if (options.sortDirection == 'both' || options.sortDirection == 'horizontal') {
						//如果helper的left+width已經超過後一個元素的一半
						if ( ($('.helper').offset().left + $('.helper').width()) > ($('.placeholder').next().offset().left + ($('.placeholder').next().width()/2)) ) {
							//替換placeholder與後面一個元素的位置
							$('.placeholder').before($('.placeholder').next());
						}
					}
					if (options.sortDirection == 'both' || options.sortDirection == 'vertical') {
						if (($('.helper').offset().top + $('.helper').height()) > ($('.placeholder').next().offset().top + ($('.placeholder').next().height()/2) ) ) {
							$('.placeholder').before($('.placeholder').next());
						}
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