
/**
* 插件名字    一个PeopleEditer插件
* 功能        实现从AD域读取Alias并显示，能够检查名字、查找名字、错误名字提示信息、删除整个人名
* 作者        廖日龙.
* 日期        2012/06
*/
var JQueryPeopleEditer_BACKSPACE_KEY = 8;   /*  BackSpace 键*/
var JQueryPeopleEditer_RIGHT_KEY = 39;      /*  Right 键*/
var JQueryPeopleEditer_LEFT_KEY = 37;       /*  Left 键*/
var JQueryPeopleEditer_SEMICOLON = 186;     /*  分号*/
var JQueryPeopleEditer_DELETE = 46;         /*  Delete 键*/
var JQueryPeopleEditer_HOME = 36;           /*  Home 键*/
var JQueryPeopleEditer_END = 35;            /*  End 键*/
var JQueryPeopleEditer_UP = 38;             /*  UP 键*/
var JQueryPeopleEditer_DOWN = 40;           /*  Down 键*/

var JQueryPeopleEditer_Width5_Array = ['i', 'I', 'j', 'f', 'l', '(', ')', '[', ']', ',', '.', ':', '!', '*', '-', '_', ' ', '|'];
var JQueryPeopleEditer_WIDTH5 = 3.5;
var JQueryPeopleEditer_Width7_Array = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '~', '`', '^', '<', '>', '?', '+', '=', '\\', '/', 'a', 'b', 'c', 'd', 'e', 'g', 'h', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
var JQueryPeopleEditer_WIDTH7 = 7.3;
var JQueryPeopleEditer_Width8_Array = ['@', '#', '%', '&', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var JQueryPeopleEditer_WIDTH8 = 9;
var JQueryPeopleEditer_INPUT_EXTRA_WIDTH = 22
var JQueryPeopleEditer_SHOW_ALIAS_NAME_MAXLENGTH = 23;
var JQueryPeopleEditer_inputWidth = 0;


jQuery.fn.PeopleEditer = function () {
    return this.each(function () {

        InitiatPeopleEditerIcon(this); /*  初始化插件Div的图标*/
        InitiatPeopleEditerClickEvent(this); /*  初始化插件Div的单击事件*/
        InitiatPeopleEditerText(this);  /*  初始化处理插件Div中的文本内容*/
        InitiatDoubleClickErrorResolveAliasEvent(this);  /*  初始化双击解析错误的Alias时的事件*/
        InitiatPeopleEditerCheckName(); /*  验证插件Div中所有Alias的合法性*/
    });
};



/**
*   函数名： InitiatDoubleClickErrorResolveAliasEvent
*   功能  ： 初始化双击解析错误的Alias时的事件
*
*  参数
*       $source : 代表插件Div 的DOM对象
**/
function InitiatDoubleClickErrorResolveAliasEvent($source) {
    $('div.JQuery_Plug_PeopleEditer_ResolveError')
    .live('dblclick', function (event) {
        if (this !== event.target) return;
        var _text = $(this).text();
        $($source).data('$InputPrevAliasDom', $(this));
        var _html = "<input type='text' class='JQuery_Plug_PeopleEditer_input' />";
        $(this).text('');
        $(_html).insertAfter($(this));
        $(this).remove();
        var _inputWidth = SetInputWidthAccordingToInputText($source, $('.JQuery_Plug_PeopleEditer_input'), _text);
        $('.JQuery_Plug_PeopleEditer_input').val(_text).addClass('unresolve').width(_inputWidth);
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
    $($source).text('');
    InitiatInputLostFocusByClickAnyWhere_OR_InitiatPeopleEditerText($source, text, 'unresolve');
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
*   $event : 代表插件Div 的Dom对象
*   
**/
function InitiatPeopleEditerIcon($event) {
    /*添加样式*/
    $($event).addClass('JQuery_Plug_PeopleEditer');
    var _jquery_html = "<div style=' position:absolute;' class='JQuery_Plug_PeopleEditer_img'>";
    _jquery_html += "<img style='margin-right:10px;' class='JQuery_Plug_PeopleEditer_img_CheckName' src='Pic/checknames.png' />";
    _jquery_html += "<img class='JQuery_Plug_PeopleEditer_img_FindName' src='Pic/addressbook.gif' />";
    _jquery_html += "</div>";
    /* 将图标加到插件Div的后面*/
    $(_jquery_html).insertAfter($($event));
    /* 设置图标Div的位置*/
    $('.JQuery_Plug_PeopleEditer_img').css({ 'top': $($event).offset().top, 'left': $($event).offset().left + parseInt($($event).width()) + 8 });
    InitiatPeopleEditerIcon_img_CheckName();
}


/**
*   函数名： InitiatPeopleEditerCheckName
*   功能  ： 获取插件Div 中所有的Alias，然后进行一次Ajax 调用，来Check 所有alias的合法性
*
*   参数
*   
**/
function InitiatPeopleEditerCheckName() {
    var _alias = '';
    $('div.JQuery_Plug_PeopleEditer_Alias').each(function () {
        if ($(this).hasClass('JQuery_Plug_PeopleEditer_AliasResolved')) return;
        if ($(this).hasClass('JQuery_Plug_PeopleEditer_ResolveError')) return;
        _alias += ($(this).text().substring(0, $(this).text().length));
    });

    RequestByGetAjax("checkAlias", "JQueryPeopleEditercheckAliasAjax_Success", "JQueryPeopleEditercheckAliasAjax_Fail", _alias);
}

/**
*   函数名： InitiatPeopleEditerIcon_img_CheckName
*   功能  ： 初始化插件Div的checkName图标的单击事件
*
*   参数
*   
**/
function InitiatPeopleEditerIcon_img_CheckName() {
    $('.JQuery_Plug_PeopleEditer_img_CheckName').click(function () {
        InitiatPeopleEditerCheckName();
    });
}

/**
*   函数名： RequestByGetAjax
*   功能  ： checkName时的Ajax调用
*
*   参数
action ： Ajax调用的方法
successFunction： 成功的方法
failFunction  ：失败的方法
Param ： 传送的参数
*   
**/
function RequestByGetAjax(action, successFunction, failFunction, Param) {
    $.get("/" + action + "?aliasList=" + Param, JQueryPeopleEditercheckAliasAjax_Success).error(JQueryPeopleEditercheckAliasAjax_Fail);
}





/**
*   函数名： AjaxOperationResolvedAlias
*   功能  ： 处理成功解析的Alias 的样式
*
*   参数
*   result : 成功解析得到的JSON数据
*   
**/
function AjaxOperationResolvedAlias(result) {
    for (var i = 0; i < result.length; i++) {
        RemovingDuplicateResolvedAlias(result[i].DisplayName + ';');
        $('div.JQuery_Plug_PeopleEditer_Alias').each(function () {
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
*   
**/
function RemovingDuplicateResolvedAlias(_text) {
    $('div.JQuery_Plug_PeopleEditer_Alias').each(function () {
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
*   
**/
function AjaxOperationResolveErrorAlias(errorResult) {
    var _errorArray = new Array();
    _errorArray = errorResult.split(';');
    for (var i = 0; i < _errorArray.length; i++) {
        $('.JQuery_Plug_PeopleEditer_Alias').each(function () {
            if ($(this).text().toLowerCase() === (_errorArray[i] + ';')) {
                $(this).addClass('JQuery_Plug_PeopleEditer_ResolveError').removeClass('unresolve');
                $(this).attr('title', 'This entry is not found, click for more actions');
            }
        });
    }
}


/**
*   函数名： JQueryPeopleEditercheckAliasAjax_Success
*   功能  ： 单击CheckName后，Ajax成功返回结果的处理方法
*
*   参数
*   result : 得到的JSON数据
*   
**/
function JQueryPeopleEditercheckAliasAjax_Success(result) {
    var _result = JSON.parse(result);
    AjaxOperationResolvedAlias(_result.ResolvedResult);  /* 处理成功解析的Alias */
    AjaxOperationResolveErrorAlias(_result.ResolvedErrorResult.OriginalText);  /* 处理错误解析的Alias */
}


/**
*   函数名： JQueryPeopleEditercheckAliasAjax_Fail
*   功能  ： 单击CheckName后，Ajax失败的处理方法
*
*   参数
*   result : 错误的信息
*   
**/
function JQueryPeopleEditercheckAliasAjax_Fail(result) {
    alert('error');
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
    $($source).click(function () {
        $('div.JQuery_Plug_PeopleEditer_Alias').each(function () {
            $(this).removeClass('JQuery_Plug_PeopleEditer_AliasSelected');
        });
        GenerateInputByClickEvent(this);
    })
    .keyup(function (event) {
        if (event.which === JQueryPeopleEditer_DELETE) {
            $('div.JQuery_Plug_PeopleEditer_AliasSelected').remove();
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
    $('input.JQuery_Plug_PeopleEditer_input')
    /*  绑定Input 的失去焦点事件*/
        .live("blur", function () {
            if ($('input.JQuery_Plug_PeopleEditer_input').length > 0) {   /*  在没有Input的时候不需要做任何事*/
                if ($(this).prev('div.JQuery_Plug_PeopleEditer_Alias').length > 0) {
                    $($source).data('$InputPrevAliasDom', $(this).prev('div.JQuery_Plug_PeopleEditer_Alias'));
                }
                var text = $(this).val();
                if ($(this).data('NotClickAnyWhere') !== true) {
                    /* 如果此Input是因为鼠标单击别的地方而失去的焦点，就调用如下方法，此方法中不会继续生成新的Input来等待用户输入*/
                    InitiatInputLostFocusByClickAnyWhere_OR_InitiatPeopleEditerText($source, text, 'unresolve');   /*当用户在input中输入了内容，而在其他的地方单击了一下， 此时，就需要将这些Alias样式化。*/
                }
                $('input.JQuery_Plug_PeopleEditer_input').remove();   /* 移除掉所有的Input*/
                $('div.JQuery_Plug_PeopleEditer_Alias').each(function () {
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
                    $('div.JQuery_Plug_PeopleEditer_Alias').insertAfter($(this));
                    $(this).focus();
                    $($source).data('$InputPrevAliasDom', $(this));
                }
            }
            else if (event.which === JQueryPeopleEditer_END) { /*  End 键*/
                if ($(this).val().length === 0) {   /*  只有当input中的字符数为0时， 按Home键才会会移动Input的位置*/
                    $('div.JQuery_Plug_PeopleEditer_Alias').insertBefore($(this));
                    $(this).focus();
                    $($source).data('$InputPrevAliasDom', $(this).prev('div.JQuery_Plug_PeopleEditer_Alias'));
                }
            }
            else if (event.which === JQueryPeopleEditer_UP) {  /*  Up  键*/
                if ($(this).val().length === 0) {   /*  只有当input中的字符数为0时， 按Up键才会会移动Input的位置*/

                }
            }
            else if (event.which === JQueryPeopleEditer_BACKSPACE_KEY || event.which === JQueryPeopleEditer_DELETE) {    /*当用户按删除键时处理*/
                event.stopPropagation();
                operationWhenPressBackspace($(this), $source, event.which);
                SetInputWidthWhenChangeTextByBackSpace($source, $(this), $(this).val());
            } else {
                if (window.event.ctrlKey === true) {
                    if (event.which === 65) {
                        if ($(this).val().length === 0) {
                            $('div.JQuery_Plug_PeopleEditer_Alias').addClass('JQuery_Plug_PeopleEditer_AliasSelected');
                        }
                    }
                }
                SetInputWidthWhenChangeTextByChar($source, $(this), event.key);
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



function operationWhenPressUporDown($input, $source, direction) {
    var _top = $($input).offset().top;
    var _left = $($input).offset().left;
    if (direction === 'UP') {
        var _UP_Top = _top + 20;
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
        $($input).next('div.JQuery_Plug_PeopleEditer_Alias').insertBefore($($input));  /*将当前Input的下一个Div移动到input的前面*/
        $($source).data('$InputPrevAliasDom', $('.JQuery_Plug_PeopleEditer_input').prev('div.JQuery_Plug_PeopleEditer_Alias')); /*跟踪input的前一个Alias Div*/
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
        $($input).prev('div.JQuery_Plug_PeopleEditer_Alias').insertAfter($($input)); /*将当前Input的上一个Div移动到input的后面*/
        $($source).data('$InputPrevAliasDom', $('.JQuery_Plug_PeopleEditer_input').prev('div.JQuery_Plug_PeopleEditer_Alias')); /*跟踪input的前一个Alias Div*/
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
        if (key === JQueryPeopleEditer_BACKSPACE_KEY) {
            $($input).prev('div.JQuery_Plug_PeopleEditer_Alias').remove(); /*删除当前input的前一个Alias Div*/
            $($source).data('$InputPrevAliasDom', $('.JQuery_Plug_PeopleEditer_input').prev('div.JQuery_Plug_PeopleEditer_Alias')); /*跟踪input的前一个Alias Div*/
        } else if (key === JQueryPeopleEditer_DELETE) {
            $($input).next('div.JQuery_Plug_PeopleEditer_Alias').remove(); /*删除当前input的前一个Alias Div*/
            $($source).data('$InputPrevAliasDom', $('.JQuery_Plug_PeopleEditer_input').prev('div.JQuery_Plug_PeopleEditer_Alias')); /*跟踪input的前一个Alias Div*/
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
    if ($('.JQuery_Plug_PeopleEditer_Alias').length === 0) {
        $(_html).appendTo($($source));
        return;
    }
    var _maxTop = 0;     /* 保存Top最大的Alias的位置*/
    var _maxRight = 0;   /* 保存Right最大的Alias的位置*/
    var $tempAliasDom;   /* 保存离鼠标单击的X轴、Y轴最近的Alias的DOM对象*/
    var _isLoadInput = false;
    $('.JQuery_Plug_PeopleEditer_Alias').each(function () {
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
function initiatPeoplerEditerAliasEvent() {
    $('div.JQuery_Plug_PeopleEditer_Alias').each(function () {
        if ($(this).attr('onclick') === undefined) {
            $(this).click(function (event) {    /*  初始化Alias Div 的单击事件*/
                $('div.JQuery_Plug_PeopleEditer_Alias').each(function () {
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
            DeleteSameAlias(_aliasArray[i]);
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
                if ($('div.JQuery_Plug_PeopleEditer_Alias').length > 0) {
                    $(_html).prependTo($($source));

                } else {
                    $(_html).appendTo($($source));
                }
            } else {
                $(_html).insertAfter($($source).data('$InputPrevAliasDom'));
            }
            initiatPeoplerEditerAliasEvent();
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
function DeleteSameAlias(alias) {
    $('div.JQuery_Plug_PeopleEditer_Alias').each(function () {
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
            DeleteSameAlias(_newarr[i]);
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
                if ($('div.JQuery_Plug_PeopleEditer_Alias').length > 0) {
                    $(_html).prependTo($($source));

                } else {
                    $(_html).appendTo($($source));
                }
            } else {
                $(_html).insertAfter($($source).data('$InputPrevAliasDom'));
            }
            initiatPeoplerEditerAliasEvent();
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
        if ($('div.JQuery_Plug_PeopleEditer_Alias').length > 0 && $('div.JQuery_Plug_PeopleEditer_Alias').length !== 1) {
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
        $($input).width(_inputWidth + JQueryPeopleEditer_INPUT_EXTRA_WIDTH);
        JQueryPeopleEditer_inputWidth = _inputWidth + JQueryPeopleEditer_INPUT_EXTRA_WIDTH;
    }
}