/*
jQuery plugin : dragonsort
--- v0.0.1 2012-06-29
	‧開始coding
--- v0.0.2 2012-06-30
	‧水平sorting完成

*/

;(function($){

	$.fn.dragonsort = function(_options, debug){

		if (debug) console.log('dragonsort running.');

		var defaultOptions = {
			dragDirection : 'both'
		};

		var options = $.extend(true, defaultOptions, _options);
		var prevElement = null;
		var nextElement = null;
		var oldIndex = null;
		var shiftX = null;
		var shiftY = null;

		$(this).children().mousedown(function(e){
			if (debug) console.log('%s mousedown', $(this).attr('class'));

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


			$('.helper').css("z-index", 10000);

			$('.helper').mousemove(function(e){
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
				//先檢查helper的左邊 (left) 且placeholder前面有東西(placeholder前面還不可以是helper)
				if ($('.placeholder').prev(':not(.helper)').length > 0) {
					//如果helper的left已經過了前一個元素的一半
					if ($('.helper').offset().left < ($('.placeholder').prev().offset().left + ($('.placeholder').prev().width()/2) ) ) {
						//替換placeholder與前面一個元素的位置
						$('.placeholder').prev().before($('.placeholder'));
					}
				}
				
				//檢查helper的右邊
				if ($('.placeholder').next().length > 0) {
					//如果helper的left+width已經超過後一個元素的一半
					if ( ($('.helper').offset().left + $('.helper').width()) > ($('.placeholder').next().offset().left + ($('.placeholder').next().width()/2)) ) {
						//替換placeholder與後面一個元素的位置
						$('.placeholder').before($('.placeholder').next());
					}
				}
				

				// cancel out any text selections
        		document.body.focus();

		        // prevent text selection in IE
		        document.onselectstart = function () { return false; };
		        // prevent IE from trying to drag an image
		        $(this).ondragstart = function() { return false; };
        
		        // prevent text selection (except IE)
		        return false;
			}).mouseleave(function(e){
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
			}).mouseup(function(e){
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