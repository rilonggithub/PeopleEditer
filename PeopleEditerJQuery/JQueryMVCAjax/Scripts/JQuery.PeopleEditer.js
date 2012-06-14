(function ($) {

	/**
	* 插件名字    PeopleEditer
	* 功能        实现从AD域读取Alias并显示，能够检查名字、查找名字、错误名字提示信息、删除整个人名
	* 作者        廖日龙.
	* 日期        2012/06
	*/
	var JQueryPeopleEditer_BACKSPACE_KEY = 8;   /*  BackSpace 键  */
	var JQueryPeopleEditer_RIGHT_KEY = 39;      /*  Right 键      */
	var JQueryPeopleEditer_LEFT_KEY = 37;       /*  Left 键       */
	var JQueryPeopleEditer_SEMICOLON = 186;     /*  分号          */
	var JQueryPeopleEditer_DELETE = 46;         /*  Delete 键     */
	var JQueryPeopleEditer_HOME = 36;           /*  Home 键       */
	var JQueryPeopleEditer_END = 35;            /*  End 键        */
	var JQueryPeopleEditer_UP = 38;             /*  UP 键         */
	var JQueryPeopleEditer_DOWN = 40;           /*  Down 键       */

	var JQueryPeopleEditer_Width5_Array = ['i', 'I', 'j', 'f', 'l', '(', ')', '[', ']', ',', '.', ':', '!', '*', '-', '_', ' ', '|'];
	var JQueryPeopleEditer_WIDTH5 = 3.5;
	var JQueryPeopleEditer_Width7_Array = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '~', '`', '^', '<', '>', '?', '+', '=', '\\', '/', 'a', 'b', 'c', 'd', 'e', 'g', 'h', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
	var JQueryPeopleEditer_WIDTH7 = 7.3;
	var JQueryPeopleEditer_Width8_Array = ['@', '#', '%', '&', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	var JQueryPeopleEditer_WIDTH8 = 9;
	var JQueryPeopleEditer_INPUT_EXTRA_WIDTH = 22
	var JQueryPeopleEditer_SHOW_ALIAS_NAME_MAXLENGTH = 23;
	var JQueryPeopleEditer_inputWidth = 0;


	/************************************************************插件*******************************************************************/
	/*                                                                                                                                  
	/*
	/*
	/*   插件名： PeopleEditer
	/*   功能  ： 实现从AD域读取Alias并显示，能够检查名字、查找名字、错误名字提示信息、删除整个人名
	/*
	/*   
	/*
	/*
	/*
	/***********************************************************************************************************************************/
	$.fn.PeopleEditer = function () {
		return this.each(function () {
			InitiatPeopleEditerIcon(this); /*  初始化插件Div的图标*/
			InitiatPeopleEditerClickEvent(this); /*  初始化插件Div的单击事件*/
			InitiatPeopleEditerText(this);  /*  初始化处理插件Div中的文本内容*/
			InitiatDoubleClickErrorResolveAliasEvent(this);  /*  初始化双击解析错误的Alias时的事件*/

		});
	};





	/************************************************************插件********************************************************************/
	/*                                                                                                                                  
	/*
	/*
	/*   插件名： VialdateAlias
	/*   功能  ： 验证指定PeopleEditer插件中的Alias的合法性，实现了deferred对象。
	/*
	/*   
	/*
	/*
	/*
	/***********************************************************************************************************************************/
	$.fn.VialdateAlias = function () {
		if ($(this).hasClass('JQuery_Plug_PeopleEditer')) {
			var dtd = $.Deferred();                         /*  定义一个私有的 Deferred 对象  */
			return InitiatPeopleEditerCheckName(this, dtd); /*  验证插件Div中所有Alias的合法性*/
		}
	};





	/**
	*   函数名： InitiatDoubleClickErrorResolveAliasEvent
	*   功能  ： 初始化双击解析错误的Alias时的事件
	*
	*  参数
	*       $source : 代表插件Div 的DOM对象
	**/
	function InitiatDoubleClickErrorResolveAliasEvent($source) {
		$('div.JQuery_Plug_PeopleEditer_ResolveError', $($source))
		.live('dblclick', function (event) {
			if (this !== event.target) return;
			var _text = $(this).text();
			$($source).data('$InputPrevAliasDom', $(this));
			var _html = "<input type='text' class='JQuery_Plug_PeopleEditer_input' />";
			$(this).text('');
			$(_html).insertAfter($(this));
			$(this).remove();

			var _inputWidth = SetInputWidthAccordingToInputText($source, $('input.JQuery_Plug_PeopleEditer_input', $($source)), _text);
			$('input.JQuery_Plug_PeopleEditer_input', $($source)).val(_text).addClass('unresolve').width(_inputWidth);
			JQueryPeopleEditer_inputWidth = _inputWidth;
			InitiatAliasInputEvent($source);

		});
	}

	/**
	*   函数名： InitiatPeopleEditerText
	*   功能  ： 解析插件Div中的文本
	*
	*   参数
	*       $source  : 代表插件Div 的DOM对象
	**/
	function InitiatPeopleEditerText($source) {
		var text = $($source).text();
		var $img = $('div.JQuery_Plug_PeopleEditer_img', $($source));
		$($source).text('');
		if ($('div.JQuery_Plug_PeopleEditer_img', $($source)).length === 0) {
			$($img).appendTo($($source));
		}
		var _aliasArray = text.split('|');
		for (var i = 0; i < _aliasArray.length; i++) {
			if (_aliasArray[i].length > 0) {
				var _aliasInfo = _aliasArray[i].split(';');
				var _html = "<div class='JQuery_Plug_PeopleEditer_Alias JQuery_Plug_PeopleEditer_AliasResolved'>" + _aliasInfo[0] + ';' + "</div>";
				$(_html).appendTo($($source));
				$('div.JQuery_Plug_PeopleEditer_AliasResolved', $($source)).filter(function () { return $(this).text() === _aliasInfo[0] }).data('AliasName', _aliasInfo[1]);
			}
		}
		//InitiatInputLostFocusByClickAnyWhere_OR_InitiatPeopleEditerText($source, text, 'unresolve');
	}

	/**
	*   函数名： GenerateRandomClassName
	*   功能  ： 生成一个CSS类名
	*
	*   
	**/
	function GenerateRandomClassName() {
		var _myDate = new Date();
		var _tempName = "JQueryPeopleEditer_" + _myDate.getTime();
		return _tempName;
	}

	/**
	*   函数名： InitiatPeopleEditerIcon
	*   功能  ： 初始化插件Div的图标
	*
	*   参数
	*   $source : 代表插件Div 的Dom对象
	*   
	**/
	function InitiatPeopleEditerIcon($source) {
		/*添加样式*/
		$($source).attr('title', 'Please enter members for the organization,User semicolon to spearate the members');
		$($source).addClass('JQuery_Plug_PeopleEditer');
		var _jquery_html = "<div class='JQuery_Plug_PeopleEditer_img'>";
		_jquery_html += "<img title='Check Names' style='margin-right:10px;' class='JQuery_Plug_PeopleEditer_img_CheckName' src='Pic/checknames.png' />";
		_jquery_html += "<img title='Browse' class='JQuery_Plug_PeopleEditer_img_FindName' src='Pic/addressbook.gif' />";
		_jquery_html += "</div>";
		/* 将图标加到插件Div的后面*/
		$(_jquery_html).appendTo($($source));
		/* 设置图标Div的位置*/
		$('.JQuery_Plug_PeopleEditer_img', $($source)).css({ 'top': $($source).offset().top, 'left': $($source).offset().left + parseInt($($source).width()) + 8 });
		//InitiatPeopleEditerIcon_img_CheckName($source);
	}


	/**
	*   函数名： InitiatPeopleEditerCheckName
	*   功能  ： 获取插件Div 中所有的Alias，然后进行一次Ajax 调用，来Check 所有alias的合法性
	*
	*   参数
	*   $source : 代表插件Div 的DOM元素
	*   dtd     : 一个deferred对象，可以实现when的延时操作
	**/
	function InitiatPeopleEditerCheckName($source, dtd) {
		if ($('img.JQuery_Plug_PeopleEditer_img_loading', $($source)).length > 0) return;
		var _alias = '';
		$('div.JQuery_Plug_PeopleEditer_Alias:not([class*=AliasResolved],[class*=ResolveError])', $($source)).each(function () {
			_alias += ($(this).text().substring(0, $(this).text().length));
		});
		if (_alias.length === 0) return;
		$.ajax({
			type: "get",
			url: "/checkAlias?aliasList=" + _alias,
			success: function (result) {
				var _result = JSON.parse(result);
				if (_result.ResolvedResult.length > 0) {
					AjaxOperationResolvedAlias(_result.ResolvedResult, $source);  /* 处理成功解析的Alias */

				}
				try {
					AjaxOperationResolveErrorAlias(_result.ResolvedErrorResult.OriginalText, $source);  /* 处理错误解析的Alias */
				}
				catch (err)
				{ }
				/*  如果deferred 对象不为空的话，改变它的状态为  “完成” ， 以致页面上的的when 函数的done函数可以执行 */
				if (dtd !== null) {
					dtd.resolve();

				}
			},
			error: function () {
				/*  如果deferred 对象不为空的话，改变它的状态为  “失败” ， 以致页面上的的when 函数的Fail函数可以执行 */
				if (dtd !== null) {
					dtd.reject();
				}
				var errorResult = 'responseText: ' + result.responseText.substring(0, 500) + '\n\r\n\r......\n\r\n\r status: '
					+ result.status + '\n\r\n\r statusText: ' + result.statusText + '\n\r\n\r readyState: ' + result.readyState;
				alert(errorResult);
			},
			beforeSend: function () {
				$('img.JQuery_Plug_PeopleEditer_img_CheckName', $($source)).addClass('JQuery_Plug_PeopleEditer_checkNameDisable').attr('src', 'Pic/checknames_disable.png');
				var _img = "<img class='JQuery_Plug_PeopleEditer_img_loading' src='Pic/loading.gif'>";
				var _layer = "<div class='JQuery_Plug_PeopleEditer_Alias_Layer'></div>";
				var _top = $($source).offset().top;
				var _left = $($source).offset().left;
				var _height = $($source).height() + 23;
				var _width = $($source).width() + 3;
				$(_layer).appendTo($($source));
				$('div.JQuery_Plug_PeopleEditer_Alias_Layer', $($source)).css({ 'top': _top, 'left': _left, 'width': _width, 'height': _height, 'opacity': 0.1 });
				$(_img).appendTo($($source));
				$('img.JQuery_Plug_PeopleEditer_img_loading', $($source)).css({ 'top': _top + 20, 'left': _left + 150 });

			},
			complete: function () {
				$('div.JQuery_Plug_PeopleEditer_Alias_Layer', $($source)).remove();
				$('img.JQuery_Plug_PeopleEditer_img_loading', $($source)).remove();
				$('img.JQuery_Plug_PeopleEditer_img_CheckName', $($source)).removeClass('JQuery_Plug_PeopleEditer_checkNameDisable').attr('src', 'Pic/checknames.png');
			}
		});
		/*  如果deferred 对象不为空的话，返回它的状态和信息， 以致页面上的的when 函数的done函数可以执行 */
		if (dtd !== null) { return dtd.promise(); }
	}








	/**
	*   函数名： AjaxOperationResolvedAlias
	*   功能  ： 处理成功解析的Alias 的样式
	*
	*   参数
	*   result : 成功解析得到的JSON数据
	*   $source : 代表插件Div 的DOM元素
	*   
	**/
	function AjaxOperationResolvedAlias(result, $source) {
		for (var i = 0; i < result.length; i++) {
			RemovingDuplicateResolvedAlias(result[i].DisplayName + ';', $source);
			if (result[i].DisplayName.length === 0) continue;
			$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
				if ($(this).text().toLowerCase() === (result[i].OriginalText + ';')) {
					$(this).removeClass('JQuery_Plug_PeopleEditer_ResolveError').removeClass('unresolve');
					$(this).text(result[i].DisplayName + ';').addClass('JQuery_Plug_PeopleEditer_AliasResolved').attr('title', '');
				}
			});
		}
	}


	/**
	*   函数名： RemovingDuplicateResolvedAlias
	*   功能  ： 移除已经解析的同名的Alias
	*
	*   参数
	*   _text : 成功解析的其中一个Alias的DisplayName
	*   $source : 代表插件Div 的DOM元素
	*   
	**/
	function RemovingDuplicateResolvedAlias(_text, $source) {
		$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
			if ($(this).text() === _text) {   /*如果当前的Alias 的 DisplayName 已经存在，那么就删除原来的Alias */
				$(this).remove();
			}
		});
	}


	/**
	*   函数名： AjaxOperationResolveErrorAlias
	*   功能  ： 处理解析错误的Alias 的样式
	*
	*   参数
	*   result : 解析错误的JSON数据
	*   $source : 代表插件Div 的DOM元素
	*   
	**/
	function AjaxOperationResolveErrorAlias(errorResult, $source) {
		var _errorArray = new Array();
		_errorArray = errorResult.split(';');
		for (var i = 0; i < _errorArray.length; i++) {
			$('.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
				if (escape($(this).text().toLowerCase()) === escape(_errorArray[i].toLowerCase() + ';')) {
					$(this).addClass('JQuery_Plug_PeopleEditer_ResolveError').removeClass('unresolve');  /* 给解析错误的Alias 加上红色波浪线*/
					$(this).attr('title', 'This entry is not found, click for more actions');   /* 给解析错误的Alias 加上Tooltip*/
				}
			});
		}
	}





	/**
	*   函数名： InitiatPeopleEditerClickEvent
	*   功能  ： 初始化插件Div的单击事件
	*
	*   参数
	*   $source : 代表插件Div 的Dom对象
	*   
	**/
	function InitiatPeopleEditerClickEvent($source) {
		$($source).click(function (event) {
			if ($(event.target).attr('class').indexOf('JQuery_Plug_PeopleEditer_img_CheckName') > -1) {
				InitiatPeopleEditerCheckName($source, null);
				return;
			}

			if (event.target !== this) return;
			$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
				$(this).removeClass('JQuery_Plug_PeopleEditer_AliasSelected');
			});
			GenerateInputByClickEvent(this);
		})
	.keyup(function (event) {
		if (event.which === JQueryPeopleEditer_DELETE) {
			$('div.JQuery_Plug_PeopleEditer_AliasSelected', $($source)).remove();
		}
	});
	}

	/**
	*   函数名： GenerateInput
	*   功能  ： 在插件Div中由用户鼠标单击生成一个Input
	*
	*   参数
	*   $source : 代表插件Div 的Dom对象
	*   
	**/
	function GenerateInputByClickEvent($source) {
		var _x = window.event.x;
		var _y = window.event.y;
		var _html = "<input type='text' class='JQuery_Plug_PeopleEditer_input' />";

		positionInputByClick(_x, _y, $source, _html);
		InitiatAliasInputEvent($source);
	}



	/**
	*   函数名： InitiatAliasInputEvent
	*   功能  ： 初始化生成的Input第事件
	*
	*   参数
	*   $source : 代表插件Div 的Dom对象
	*   
	**/
	function InitiatAliasInputEvent($source) {
		$('input.JQuery_Plug_PeopleEditer_input', $($source))
		/*  绑定Input 的失去焦点事件*/
		.live("blur", function () {
			if ($('input.JQuery_Plug_PeopleEditer_input', $($source)).length > 0) {   /*  在没有Input的时候不需要做任何事*/
				if ($(this).prev('div.JQuery_Plug_PeopleEditer_Alias').length > 0) {
					$($source).data('$InputPrevAliasDom', $(this).prev('div.JQuery_Plug_PeopleEditer_Alias'));
				}
				var text = $(this).val();
				if ($(this).data('NotClickAnyWhere') !== true) {
					/* 如果此Input是因为鼠标单击别的地方而失去的焦点，就调用如下方法，此方法中不会继续生成新的Input来等待用户输入*/
					InitiatInputLostFocusByClickAnyWhere_OR_InitiatPeopleEditerText($source, text, 'unresolve');   /*当用户在input中输入了内容，而在其他的地方单击了一下， 此时，就需要将这些Alias样式化。*/
				}
				$('input.JQuery_Plug_PeopleEditer_input', $($source)).remove();   /* 移除掉所有的Input*/
				$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
					if ($(this).text().length === 0) {
						$(this).remove();
					}
				});
			}
			JQueryPeopleEditer_inputWidth = 0;
		})
		/*  绑定Input 的键盘输入事件， */
		.keydown(function (event) {
			$(this).data('Current_Textlength', $(this).val().length);
			if (event.which === JQueryPeopleEditer_LEFT_KEY) {   /*当用户按Left键时处理*/
				operationWhenPressLeft($(this), $source);
			}
			else if (event.which === JQueryPeopleEditer_RIGHT_KEY) {   /*当用户按Right键时处理*/
				operationWhenPressRight($(this), $source);
			}
			else if (event.which === JQueryPeopleEditer_HOME) { /*  Home 键*/
				if ($(this).val().length === 0) {  /*  只有当input中的字符数为0时， 按Home键才会会移动Input的位置*/
					$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).insertAfter($(this));
					$(this).focus();
					$($source).data('$InputPrevAliasDom', $(this));
				}
			}
			else if (event.which === JQueryPeopleEditer_END) { /*  End 键*/
				if ($(this).val().length === 0) {   /*  只有当input中的字符数为0时， 按Home键才会会移动Input的位置*/
					$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).insertBefore($(this));
					$(this).focus();
					$($source).data('$InputPrevAliasDom', $(this).prev('div.JQuery_Plug_PeopleEditer_Alias'));
				}
			}
			else if (event.which === JQueryPeopleEditer_UP) {  /*  Up  键*/
				if ($(this).val().length === 0) {   /*  只有当input中的字符数为0时， 按Up键才会会移动Input的位置*/
					operationWhenPressUporDown(this, $source, 'UP');
				}
			}
			else if (event.which === JQueryPeopleEditer_DOWN) {  /*  Down  键*/
				if ($(this).val().length === 0) {   /*  只有当input中的字符数为0时， 按Up键才会会移动Input的位置*/
					operationWhenPressUporDown(this, $source, 'DOWN');
				}
			}
			else if (event.which === JQueryPeopleEditer_BACKSPACE_KEY || event.which === JQueryPeopleEditer_DELETE) {    /*当用户按删除键时处理*/
				event.stopPropagation();
				operationWhenPressBackspace($(this), $source, event.which);
				SetInputWidthWhenChangeTextByBackSpace($source, $(this), $(this).val());
			}
			else { /*  处理普通的字符录入*/
				/*  当用户按Ctrl + A 时， 选择所有的alias Div*/
				if (window.event.ctrlKey === true) {
					if (event.which === 65) {
						if ($(this).val().length === 0) {
							$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).addClass('JQuery_Plug_PeopleEditer_AliasSelected');
						}
					}
				}
				SetInputWidthWhenChangeTextByChar($source, $(this), event.key);  /*   随着字符改变input 的宽度*/
			}
		})
		.keyup(function (event) {
			if (event.which === JQueryPeopleEditer_SEMICOLON) {   /*当用户输入分号时处理*/
				$(this).data('NotClickAnyWhere', true);   /* 标记此Input不是因为鼠标单击别的地方而失去的焦点*/
				/* 此方法中会生成一个新的Input来等待用户输入 */
				InitiatAliasLayout($source, $(this).val(), $(this));
			}
		})
		.bind('click', function (event) {
			$(this).focus();
			event.stopPropagation();
		})
		.bind('paste', function (event) {
			SetInputWidthAccordingToInputText($source, $(this), window.clipboardData.getData('Text'));
		})
		.bind('cut', function () {
		})
		.focus();
	}



	/**
	*   函数名： operationWhenPressUporDown
	*   功能  ： 处理用户在Input中按上或下键
	*
	*   参数
	*   $input : 代表当前输入的Input 的Dom对象
	*   $source : 代表插件Div 的Dom对象
	*   direction ： 代表移动的方向
	**/
	function operationWhenPressUporDown($input, $source, direction) {
		var _EXTRA_UP_TOP = 20;                  /*    当input往上或下移动时，匹配上或下一个Alias的额外的高度*/
		var _LINE_HEIGHT = 25;                   /*    当input往上或下移动时，一个Alias的高度*/
		var _EXTRA_LEFT_WIDTH = 20;              /*    当input往上或下移动时，匹配一个Alias的左右覆盖额外的宽度*/
		var _top = $($input).offset().top;
		var _left = $($input).offset().left;
		var _aliasTop = 0;
		var $inputClone = undefined;
		var _UP_Top = 0;                        /* 上移时代表目标Alias Div的top 的值*/
		var _DOWN_Top = 0;                      /* 下移时代表目标Alias Div的top 的值*/
		/*************************************************    input往上移动时      ************************************************************/
		if (direction === 'UP') {
			_UP_Top = _top - _LINE_HEIGHT;
			$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
				_aliasTop = $(this).offset().top;
				/*    当input往上移动时,寻找一个匹配的Alias，然后将input insertAfter 到它的后面*/
				if (((_aliasTop >= _UP_Top && _UP_Top + _EXTRA_UP_TOP >= _aliasTop) && $(this).offset().left <= _left && ($(this).offset().left + $(this).width() >= _left))
					|| ((_aliasTop >= _UP_Top && _UP_Top + _EXTRA_UP_TOP >= _aliasTop) && $(this).offset().left >= _left && $(this).offset().left <= _left + _EXTRA_LEFT_WIDTH)
					|| ((_aliasTop >= _UP_Top && _UP_Top + _EXTRA_UP_TOP >= _aliasTop) && $(this).offset().left + $(this).width() + _EXTRA_LEFT_WIDTH >= _left)
				) {
					if ($inputClone === undefined) {
						$inputClone = $($input).clone(true);
						$($input).remove();
						/* 根据匹配的Div的left， 选择input 插入的位置*/
						if ($(this).offset().left - 10 <= $($source).offset().left) {
							$inputClone.insertAfter($(this)).focus();
						} else {
							$inputClone.insertBefore($(this)).focus();
						}
						$($source).data('$InputPrevAliasDom', $(this)); /*跟踪input的前一个Alias Div*/
					} else { return; }
				}
			});
		}
		/*************************************************    input往下移动时      ************************************************************/
		else if (direction === 'DOWN') {
			_DOWN_Top = _top + _LINE_HEIGHT;
			$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
				_aliasTop = $(this).offset().top;
				/*    当input往上移动时,寻找一个匹配的Alias，然后将input insertAfter 到它的后面*/
				if (((_aliasTop + _EXTRA_UP_TOP >= _DOWN_Top && _aliasTop - _EXTRA_UP_TOP <= _DOWN_Top) && $(this).offset().left <= _left && ($(this).offset().left + $(this).width() >= _left))   /* 目标Alias Div的左边小于input的left，但是div的最右边大于input的left*/
					|| ((_aliasTop + _EXTRA_UP_TOP >= _DOWN_Top && _aliasTop - _EXTRA_UP_TOP <= _DOWN_Top) && $(this).offset().left >= _left && $(this).offset().left <= _left + _EXTRA_LEFT_WIDTH) /* 目标Alias Div的左边大于input的left，但是div的最右边要小于 input的left + 指定的宽度*/
					|| ((_aliasTop + _EXTRA_UP_TOP >= _DOWN_Top && _aliasTop - _EXTRA_UP_TOP <= _DOWN_Top) && $(this).offset().left + $(this).width() + _EXTRA_LEFT_WIDTH >= _left)   /*  目标Alias Div的左边 + div 的宽度 + 指定的宽度 要大于 input的left  */
					|| ((_aliasTop + _EXTRA_UP_TOP >= _DOWN_Top && _aliasTop - _EXTRA_UP_TOP <= _DOWN_Top) && $(this).next('div.JQuery_Plug_PeopleEditer_Alias').size() === 0)    /* 如果下一行只有一个Alias*/
				) {
					if ($inputClone === undefined) {
						$inputClone = $($input).clone(true);
						$($input).remove();
						if ($(this).offset().left - 10 <= $($source).offset().left) {
							$inputClone.insertAfter($(this)).focus();
						} else {
							$inputClone.insertBefore($(this)).focus();
						}
						$($source).data('$InputPrevAliasDom', $(this)); /*跟踪input的前一个Alias Div*/
					} else { return; }
				}
			});
		}
	}



	/**
	*   函数名： operationWhenPressRight
	*   功能  ： 处理用户在Input中按Right键
	*
	*   参数
	*   $input : 代表当前输入的Input 的Dom对象
	*   $source : 代表插件Div 的Dom对象
	**/
	function operationWhenPressRight($input, $source) {
		if ($($input).val().length === 0 && ($($input).data('Current_Textlength') === 0 || $($input).data('Current_Textlength') === undefined)) {
			/*  如果input的前一个元素是checkName的图标Div， 那么就选择图标Div的前一个*/
			if ($($input).next('div.JQuery_Plug_PeopleEditer_Alias').length === 0) {
				$($input).next().next('div.JQuery_Plug_PeopleEditer_Alias').insertBefore($($input));  /*将当前Input的下下一个Div移动到input的前面*/
			} else {
				$($input).next('div.JQuery_Plug_PeopleEditer_Alias').insertBefore($($input));  /*将当前Input的下一个Div移动到input的前面*/
			}
			$($source).data('$InputPrevAliasDom', $('.JQuery_Plug_PeopleEditer_input', $($source)).prev('div.JQuery_Plug_PeopleEditer_Alias')); /*跟踪input的前一个Alias Div*/

		}
	}


	/**
	*   函数名： operationWhenPressLeft
	*   功能  ： 处理用户在Input中按Left键
	*
	*   参数
	*   $input : 代表当前输入的Input 的Dom对象
	*   $source : 代表插件Div 的Dom对象
	**/
	function operationWhenPressLeft($input, $source) {
		if ($($input).val().length === 0 && ($($input).data('Current_Textlength') === 0 || $($input).data('Current_Textlength') === undefined)) {
			/*  如果input的前一个元素是checkName的图标Div， 那么就选择图标Div的前一个*/
			if ($($input).prev('div.JQuery_Plug_PeopleEditer_Alias').length === 0) {
				$($input).prev().prev('div.JQuery_Plug_PeopleEditer_Alias').insertAfter($($input)); /*将当前Input的上上一个Div移动到input的后面*/
			} else {
				$($input).prev('div.JQuery_Plug_PeopleEditer_Alias').insertAfter($($input)); /*将当前Input的上一个Div移动到input的后面*/
			}
			$($source).data('$InputPrevAliasDom', $('.JQuery_Plug_PeopleEditer_input', $($source)).prev('div.JQuery_Plug_PeopleEditer_Alias')); /*跟踪input的前一个Alias Div*/
		}
	}

	/**
	*   函数名： operationWhenPressBackspace
	*   功能  ： 处理用户在Input中输入backspace键
	*
	*   参数
	*   $input : 代表当前输入的Input 的Dom对象
	*   $source : 代表插件Div 的Dom对象
	*   key     : 判断用户按下的是Delete 还是BackSpace 键
	**/
	function operationWhenPressBackspace($input, $source, key) {
		if ($($input).val().length === 0 && ($($input).data('Current_Textlength') === 0 || $($input).data('Current_Textlength') === undefined)) {
			/*   如果是backspace键的话，就删除input前面的Alias*/
			if (key === JQueryPeopleEditer_BACKSPACE_KEY) {
				/*  如果input的前一个元素是checkName的图标Div， 那么就选择图标Div的前一个*/
				if ($($input).prev().attr('class').indexOf('JQuery_Plug_PeopleEditer_img') > -1) {
					$($input).prev().prev('div.JQuery_Plug_PeopleEditer_Alias').remove(); /*删除当前input的前一个Alias Div*/
					$($source).data('$InputPrevAliasDom', $('.JQuery_Plug_PeopleEditer_input', $($source)).prev().prev('div.JQuery_Plug_PeopleEditer_Alias'));
				} else {
					$($input).prev('div.JQuery_Plug_PeopleEditer_Alias').remove(); /*删除当前input的前一个Alias Div*/
					$($source).data('$InputPrevAliasDom', $('.JQuery_Plug_PeopleEditer_input', $($source)).prev('div.JQuery_Plug_PeopleEditer_Alias')); /*跟踪input的前一个Alias Div*/
				}
			}
			/*   如果是Delete键的话，就删除input后面的Alias*/
			else if (key === JQueryPeopleEditer_DELETE) {
				/*  如果input的后一个元素是checkName的图标Div， 那么就选择图标Div的后一个*/
				if ($($input).next().attr('class').indexOf('JQuery_Plug_PeopleEditer_img') > -1) {
					$($input).next().next('div.JQuery_Plug_PeopleEditer_Alias').remove(); /*删除当前input的后一个Alias Div*/
				} else {
					$($input).next('div.JQuery_Plug_PeopleEditer_Alias').remove(); /*删除当前input的后一个Alias Div*/
				}

			}
		}
	}


	/**
	*   函数名： positionInputByClick
	*   功能  ： 当用户在input中单击定位时调用的方法。
	*
	*   参数  
	*   _x：      鼠标单击的X轴坐标
	*   _y：      鼠标单击的Y轴坐标
	*   _html:    需要动态生成的HTML
	*   $source :  代表插件Div 的Dom对象
	*   
	**/
	function positionInputByClick(_x, _y, $source, _html) {
		if ($('.JQuery_Plug_PeopleEditer_Alias', $($source)).length === 0) {
			$(_html).appendTo($($source));
			return;
		}
		var _maxTop = 0;     /* 保存Top最大的Alias的位置*/
		var _maxRight = 0;   /* 保存Right最大的Alias的位置*/
		var $tempAliasDom;   /* 保存离鼠标单击的X轴、Y轴最近的Alias的DOM对象*/
		var _isLoadInput = false;
		$('.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
			if ($(this).offset().top > _maxTop) {
				_maxTop = $(this).offset().top;
				$tempAliasDom = $(this);
			}
			if (($(this).offset().left + parseInt($(this).width())) > _maxRight) {
				_maxRight = +parseInt($(this).width());
				$tempAliasDom = $(this);
			}
			/*  判断用户单击的位置， 来选择最近的Alias 作为input的前一个DOM 元素*/
			if ((($(this).offset().left + parseInt($(this).width()) + 15 >= _x)
			&& ($(this).offset().left < _x)
			&& (($(this).offset().top + 20) > _y)
			&& (($(this).offset().top - 10) <= _y))

		) {
				$(_html).insertAfter($(this));
				$($source).data('$InputPrevAliasDom', $(this).prev('div.JQuery_Plug_PeopleEditer_Alias'));
				_isLoadInput = true;
			}
		});
		/*  如果用户单击 peopleEditer Div 内部最下面的空余部分 和 内部最右边的空余部分 时激活 input*/
		if ((_y >= _maxTop || _x > _maxRight) && (_isLoadInput === false)) {
			$(_html).insertAfter($($tempAliasDom));
			$($source).data('$InputPrevAliasDom', $($tempAliasDom).prev('div.JQuery_Plug_PeopleEditer_Alias'));
		}
	}


	/**
	*   函数名： initiatPeoplerEditerAliasEvent
	*   功能  ： 为每一个Alias Div初始化单击事件。
	*
	*   参数
	*   
	**/
	function initiatPeoplerEditerAliasEvent($source) {
		$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
			if ($(this).attr('onclick') === undefined) {
				$(this).click(function (event) {    /*  初始化Alias Div 的单击事件*/
					$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
						$(this).removeClass('JQuery_Plug_PeopleEditer_AliasSelected');
					});
					$(this).addClass('JQuery_Plug_PeopleEditer_AliasSelected');
					event.stopPropagation();
				});
			}
			if ($(this).attr('class').indexOf('unresolve') > -1) {   /*  如果alias 没有resolve，那么就显示提示信息*/
				$(this).attr('title', 'please click the check name button to resolve');
			}
		});

	}

	/**
	*   函数名： InitiatAliasLayout
	*   功能  ： 当用户在input中输入了分号，就表示一个Alias已经输入完成， 此时，就需要将这个Alias样式化。
	*
	*   参数
	*   $source : 代表插件Div 的Dom对象
	*   aliasText: alias 的文本
	*   $input   : 代表Input Dom元素
	*   
	**/
	function InitiatAliasLayout($source, aliasText, $input) {

		if (aliasText === ';') {
			$($input).val('');
			return;
		}
		var _aliasArray = new Array();
		_aliasArray = aliasText.split(';');
		/*  删除已近存在的同名的Alias在插件Div中*/
		for (var i = _aliasArray.length - 1; i >= 0; i--) {
			if (_aliasArray[i].length > 0) {
				DeleteSameAlias(_aliasArray[i], $source);
			}
		}
		$($source).focus();   /*  使Input 失去焦点 */
		var _aliasText = '';
		/*  生成Alias Div 的样式*/
		for (var i = _aliasArray.length - 1; i >= 0; i--) {
			if (_aliasArray[i].length > 0) {
				if (_aliasArray[i].length > JQueryPeopleEditer_SHOW_ALIAS_NAME_MAXLENGTH) _aliasText = _aliasArray[i].substring(0, JQueryPeopleEditer_SHOW_ALIAS_NAME_MAXLENGTH) + '...';
				else _aliasText = _aliasArray[i];
				var _html = "<div class='JQuery_Plug_PeopleEditer_Alias unresolve'>" + _aliasText + ';' + "</div>";
				if ($($source).data('$InputPrevAliasDom') === undefined || (!$($source).data('$InputPrevAliasDom').hasClass('JQuery_Plug_PeopleEditer_Alias'))) {
					if ($('div.JQuery_Plug_PeopleEditer_Alias', $($source)).length > 0) {
						$(_html).prependTo($($source));

					} else {
						$(_html).appendTo($($source));
					}
				} else {
					$(_html).insertAfter($($source).data('$InputPrevAliasDom'));
				}
				initiatPeoplerEditerAliasEvent($($source));
				GenerateInputbyKeyboard($source, $input);
			}

		}
	}

	/**
	*   函数名： DeleteSameAlias
	*   功能  ： 删除PeopleEditer Div 中重复的Alias。
	*
	*   参数
	*   aliasText: alias 的文本
	*   
	**/
	function DeleteSameAlias(alias, $source) {
		$('div.JQuery_Plug_PeopleEditer_Alias', $($source)).each(function () {
			if ($(this).text() === alias + ';') {
				$(this).remove();
			}
		});
	}


	/**
	*   函数名： JQueryPeopleEditerRemovingDuplicateAlias
	*   功能  ： 移除重复的Alias
	*
	*   参数
	*   aliasText: alias 的文本
	*   
	**/
	function JQueryPeopleEditerRemovingDuplicateAlias(aliasList) {
		var _aliasArray = new Array();
		_aliasArray = aliasList.split(';');
		var _newarr = [];
		var _json = {};
		for (var i = 0; i < _aliasArray.length; i++) {
			_json[_aliasArray[i]] = _aliasArray[i];
		}
		for (var name in _json) {
			_newarr.push(name);
		}
		return _newarr;
	}

	/**
	*   函数名： InitiatInputLostFocusByClickAnyWhere_OR_InitiatPeopleEditerText
	*   功能  ： 当用户在input中输入了内容，而在其他的地方单击了一下， 此时，就需要将这些Alias样式化。
	*
	*   参数
	*   $source : 代表插件Div 的Dom对象
	*   aliasText: alias 的文本
	*   aliasStatus  : 当前处理的Alias的解析状态
	*   
	**/
	function InitiatInputLostFocusByClickAnyWhere_OR_InitiatPeopleEditerText($source, aliasText, aliasStatus) {

		var _newarr = JQueryPeopleEditerRemovingDuplicateAlias(aliasText); /*  移除掉alias文本中重复的alias*/
		/*  删除已近存在的同名的Alias在插件Div中*/
		for (var i = _newarr.length - 1; i >= 0; i--) {
			if (_newarr[i].length > 0) {
				DeleteSameAlias(_newarr[i], $source);
			}
		}
		var _aliasText = '';
		/*  生成Alias Div 的样式*/
		for (var i = _newarr.length - 1; i >= 0; i--) {
			if (_newarr[i].length > 0) {
				if (_newarr[i].length > JQueryPeopleEditer_SHOW_ALIAS_NAME_MAXLENGTH) _aliasText = _newarr[i].substring(0, JQueryPeopleEditer_SHOW_ALIAS_NAME_MAXLENGTH) + '...';
				else _aliasText = _newarr[i];
				if (aliasStatus === 'resolved') {
					var _html = "<div class='JQuery_Plug_PeopleEditer_Alias JQuery_Plug_PeopleEditer_AliasResolved'>" + _aliasText + ';' + "</div>";
				} else if (aliasStatus === 'resolveError') {
					var _html = "<div class='JQuery_Plug_PeopleEditer_Alias JQuery_Plug_PeopleEditer_AliasResolveError'>" + _aliasText + ';' + "</div>";
				} else {
					var _html = "<div class='JQuery_Plug_PeopleEditer_Alias unresolve'>" + _aliasText + ';' + "</div>";
				}
				if ($($source).data('$InputPrevAliasDom') === undefined || (!$($source).data('$InputPrevAliasDom').hasClass('JQuery_Plug_PeopleEditer_Alias'))) {
					if ($('div.JQuery_Plug_PeopleEditer_Alias', $($source)).length > 0) {
						$(_html).prependTo($($source));

					} else {
						$(_html).appendTo($($source));
					}
				} else {
					$(_html).insertAfter($($source).data('$InputPrevAliasDom'));
				}
				initiatPeoplerEditerAliasEvent($($source));
			}

		}
	}


	/**
	*   函数名： GenerateInputbyKeyboard
	*   功能  ： 当用户在input中输入了分号,表示一个Alias已经完成，之后会在Div中继续生成一个Input 
	*
	*   参数
	*   $source : 代表插件Div 的Dom对象
	*   $input  : 代表Input Dom元素
	**/
	function GenerateInputbyKeyboard($source, $input) {
		var _html = "<input type='text' class='JQuery_Plug_PeopleEditer_input' />";
		if ($($source).data('$InputPrevAliasDom') === undefined || (!$($source).data('$InputPrevAliasDom').hasClass('JQuery_Plug_PeopleEditer_Alias'))) {
			if ($('div.JQuery_Plug_PeopleEditer_Alias', $($source)).length > 0 && $('div.JQuery_Plug_PeopleEditer_Alias', $($source)).length !== 1) {
				$(_html).insertAfter($($source).children().first());  /* 将新生成的Input 放在第一个Alias 的后面*/
			} else {
				$(_html).appendTo($($source));   /*  将新生成的Input 放在最后面*/
			}

		} else {
			$(_html).insertAfter($($source).data('$InputPrevAliasDom').next());

		}
		InitiatAliasInputEvent($source);    /*  初始化Input的事件*/
	}


	/**
	*   函数名： in_Array
	*   功能  ： 判断某个字符是否出现在Array中 
	*
	*   参数
	*   e :  代表单个字符
	*
	*   返回值：   
	*       true   出现在Array中
	*       false  没有出现在Array中
	**/
	Array.prototype.in_array = function (e) {
		for (i = 0; i < this.length; i++) {
			if (this[i] == e)
				return true;
		}
		return false;
	}


	/**
	*   函数名： SetInputWidthWhenChangeText
	*   功能  ： 当Input中的字符个数变化时，它的宽度也随之变化
	*
	*   参数
	*   $source :  代表插件Div DOM对象
	*   $input  :  代表当前的Input DOM对象
	*   _text   :  代表当前输入在Input中的字符
	**/
	function SetInputWidthWhenChangeTextByChar($source, $input, _text) {
		/*  绑定Input 的change事件*/

		if (JQueryPeopleEditer_Width5_Array.in_array(_text)) {
			JQueryPeopleEditer_inputWidth += JQueryPeopleEditer_WIDTH5;
		}
		else if (JQueryPeopleEditer_Width7_Array.in_array(_text)) {
			JQueryPeopleEditer_inputWidth += JQueryPeopleEditer_WIDTH7;
		}
		else if (JQueryPeopleEditer_Width8_Array.in_array(_text)) {
			JQueryPeopleEditer_inputWidth += JQueryPeopleEditer_WIDTH8;
		}
		if ($($source).width() <= JQueryPeopleEditer_inputWidth + JQueryPeopleEditer_INPUT_EXTRA_WIDTH) {
			$($input).addClass('inputHiddenText');
		} else {
			$($input).width(JQueryPeopleEditer_inputWidth);
		}
	}

	/**
	*   函数名： SetInputWidthWhenChangeTextByBackSpace
	*   功能  ： 当用户在Input中按删除键时，它的宽度也随之变化
	*
	*   参数
	*   $input  :  代表当前的Input DOM对象
	*   _text   :  代表当前输入在Input中的字符
	**/
	function SetInputWidthWhenChangeTextByBackSpace($source, $input, _text) {
		SetInputWidthAccordingToInputText($source, $input, _text);
	}

	/**
	*   函数名： SetInputWidthAccordingToInputText
	*   功能  ： 根据input中的内容，设置input的宽度
	*
	*   参数
	*   $source :  代表插件Div DOM 对象
	*   $input  :  代表当前的Input DOM对象
	*   _text   :  代表当前输入在Input中的字符
	**/
	function SetInputWidthAccordingToInputText($source, $input, _text) {

		if (_text === undefined || _text === null) return;
		var _inputWidth = 0;
		for (var i = 0; i < _text.length; i++) {
			if (JQueryPeopleEditer_Width5_Array.in_array(_text[i])) {
				_inputWidth += JQueryPeopleEditer_WIDTH5;
			}
			else if (JQueryPeopleEditer_Width7_Array.in_array(_text[i])) {
				_inputWidth += JQueryPeopleEditer_WIDTH7;
			}
			else if (JQueryPeopleEditer_Width8_Array.in_array(_text[i])) {
				_inputWidth += JQueryPeopleEditer_WIDTH8;
			}
		}
		if (_inputWidth + JQueryPeopleEditer_INPUT_EXTRA_WIDTH <= $($source).width()) {
			$($input).width(_inputWidth);
			JQueryPeopleEditer_inputWidth = _inputWidth;
		} else {
			$($input).addClass('inputHiddenText').width($($source).width() - JQueryPeopleEditer_INPUT_EXTRA_WIDTH);
			JQueryPeopleEditer_inputWidth = $($source).width() - JQueryPeopleEditer_INPUT_EXTRA_WIDTH;
		}
	}
})(jQuery);