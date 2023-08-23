$(function () {
    var timeFlag = null;
    var msgId = null;

    function getTransResult(val, cb) {
        var salt = (new Date).getTime();
        var from = 'zh';
        var to = 'en';
        var str1 = appid + val + salt + key;
        var sign = MD5(str1);

        var reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
        if (reg.test(val)) {
            $.ajax({
                url: 'https://api.fanyi.baidu.com/api/trans/vip/translate',
                type: 'GET',
                data: {
                    q: val,
                    appid: appid,
                    salt: salt,
                    from: from,
                    to: to,
                    sign: sign
                },
                cache: false,
                dataType: 'jsonp',
                error: function () {
                    if (typeof cb == 'function') cb(val.replace(/[^\\u4E00-\\u9FFF]/ig, ''), val.replace(/[^\\u4E00-\\u9FFF]/ig, ''));
                },
                success: function (data) {
                    console.log(data);
                    if (data && data.trans_result && data.trans_result.length > 0) {
                        if (typeof cb == 'function') cb(data.trans_result[0].dst, data.trans_result[0].src)
                    } else {
                        if (typeof cb == 'function') cb(val.replace(/[^\\u4E00-\\u9FFF]/ig, ''), val.replace(/[^\\u4E00-\\u9FFF]/ig, ''));
                    }
                }
            })
        } else {
            if (typeof cb == 'function') cb(val, val);
        }
    }

    var disableDocumentScroll = false;
    var documentScrollTop = 0;
    $(document).on('scroll.unable', function (e) {
        if (disableDocumentScroll) {
            $(document).scrollTop(documentScrollTop);
        }
    })
    var form = {};
    var activeSelect = null;
    var customArr = {};
    $('.form-item[data-key]').each(function (index, item) {
        init(item);
    })

    function init(item) {
        var key = $(item).attr('data-key');
        form[key] = {};
        form[key].el = $(item);
        $(item).find('input').on('keypress', function (e) {
            if (e.keyCode == 13) {
                $(this).blur();
            }
        })
        if ($(item).find('.my-input input').not('.select-input').length > 0) {
            form[key].value = '';
            form[key].label = '';
            if ($(item).find('.my-input input').not('.select-input').val() !== '') {
                handleInputValue($(item).find('.my-input input').val(), key, $(item).find('.my-input input'), false);
            }
            $(item).find('.my-input input').not('.select-input').on('blur', function () {
                var _this = $(this);
                var val = _this.val();
                handleInputValue(val, key, _this, true);
            })
        }
        if ($(item).find('.my-input textarea').not('.select-input').length > 0) {
            form[key].value = '';
            form[key].label = '';
            if ($(item).find('.my-input textarea').not('.select-input').val() !== '') {
                handleInputValue($(item).find('.my-input textarea').val(), key, $(item).find('.my-input textarea'), false);
            }
            $(item).find('.my-input textarea').not('.select-input').on('blur', function () {
                var _this = $(this);
                var val = _this.val();
                handleInputValue(val, key, _this, true);
            })
        }
        if ($(item).find('.weight input').length > 0) {
            form[key].weight = '';
            if ($(item).find('.weight input').val() !== '') {
                var val1 = $(item).find('.weight input').val();
                val1 = val1.replace(/^\D*([0-9]\d*\.?\d{0,6})?.*$/, '$1');
                val1 = parseFloat(val1);
                if (isNaN(val1)) {
                    form[key].weight = '';
                    $(item).find('.weight input').val('');
                } else {
                    val1 = val1 <= 0 ? 0 : val1;
                    form[key].weight = val1;
                    $(item).find('.weight input').val(val1);
                }
            }
            $(item).find('.weight input').on('blur', function () {
                var val = $(this).val();
                val = val.replace(/^\D*([0-9]\d*\.?\d{0,6})?.*$/, '$1');
                val = parseFloat(val);
                if (isNaN(val)) {
                    form[key].weight = '';
                    $(this).val('');
                } else {
                    val = val <= 0 ? 0 : val;
                    form[key].weight = val;
                    $(this).val(val);
                }
                getResult();
            })
        }
        if ($(item).find('.my-input .select').length > 0) {
            form[key].value = '';
            form[key].label = '';
            form[key].selectIndex = '';
            $(item).find('.my-input .select').on('click', function (e) {
                e.stopPropagation && e.stopPropagation();
                e.preventDefault && e.preventDefault();
                return false;
            })
            $(item).find('.my-input .select-hd').on('click', function () {
                if (activeSelect) {
                    hideSelect();
                } else {
                    var _parent = $(this).parent();
                    activeSelect = _parent;
                    _parent.addClass('is-show');
                }
                window.getSelection().empty();
            })
            if ($(item).find('.my-input .select-bd .list-item').length > 6) {
                $(item).find('.my-input .select-bd .scroll-wrap').addClass('is-scroll');
            } else {
                $(item).find('.my-input .select-bd .scroll-wrap').removeClass('is-scroll');
            }
            var onIndex = '';
            $(item).find('.my-input .select-bd .list-item').each(function (idx, item1) {
                if ($(item1).hasClass('on')) {
                    onIndex = idx;
                }
            })
            if (onIndex !== '' && $(item).find('.my-input .select-bd .list-item').eq(onIndex).length > 0) {
                $(item).find('.my-input .select-bd .list-item').removeClass('on');
                $(item).find('.my-input .select-bd .list-item').eq(onIndex).addClass('on');
                form[key].value = $(item).find('.my-input .select-bd .list-item').eq(onIndex).attr('data-value');
                form[key].label = $(item).find('.my-input .select-bd .list-item').eq(onIndex).text().trim();
                form[key].selectIndex = onIndex;
                $(item).find('.select-hd .input-wrap div.input').html(form[key].label);
                $(item).find('.select-hd .input-wrap div.input').attr('title', form[key].label);
            }
            $(item).find('.my-input .select-bd .list').on('click', '.list-item', function () {
                var index = $(this).index();
                if (form[key].selectIndex !== index) {
                    $(this).siblings().removeClass('on');
                    form[key].value = $(this).attr('data-value');
                    form[key].label = $(this).text().trim();
                    form[key].selectIndex = index;
                    $(this).addClass('on');
                    $(form[key].el).find('.select-hd .input-wrap div.input').html(form[key].label);
                    $(form[key].el).find('.select-hd .input-wrap div.input').attr('title', form[key].label);
                    $(form[key].el).find('.select').addClass('is-value');
                    getResult();
                }
                hideSelect();
            })
            if ($(item).find('.my-input .select-bd .list-item-input input').length > 0) {
                $(item).find('.my-input .select-bd .list-item-input input').on('blur', function () {
                    var inputvalue = $(this).val();
                    if (inputvalue !== '' && inputvalue.length > 0) {
                        var isValueIndex = '';
                        $(item).find('.my-input .select-bd .list-item').each(function (listIndex, listItem) {
                            if ($(listItem).attr('data-value') === inputvalue || $(listItem).text().trim() === inputvalue) {
                                isValueIndex = listIndex;
                            }
                        })
                        $(item).find('.my-input .select-bd .list-item').removeClass('on');
                        $(this).val('');
                        if (isValueIndex !== '' && isValueIndex >= 0) {
                            form[key].selectIndex = isValueIndex;
                            $(item).find('.my-input .select-bd .list-item').eq(isValueIndex).addClass('on');
                            form[key].value = $(item).find('.my-input .select-bd .list-item').eq(isValueIndex).attr('data-key');
                            form[key].label = $(item).find('.my-input .select-bd .list-item').eq(isValueIndex).text().trim();
                            $(form[key].el).find('.select-hd .input-wrap div.input').html(form[key].label);
                            $(form[key].el).find('.select-hd .input-wrap div.input').attr('title', form[key].label);
                            getResult();
                        } else {
                            getTransResult(inputvalue, function (trans_result, trans_result_label) {
                                if (form[key].translate === undefined) form[key].translate = '';
                                form[key].selectIndex = $(item).find('.my-input .select-bd .list-item').length;
                                $(item).find('.my-input .select-bd .list').append('<div class="list-item on" data-value="' + trans_result + '"><div class="ellipsis-2"><span>' + trans_result_label + '</span></div></div>');
                                if ($(item).find('.my-input .select-bd .list-item').length > 6) {
                                    $(item).find('.my-input .select-bd .scroll-wrap').addClass('is-scroll');
                                } else {
                                    $(item).find('.my-input .select-bd .scroll-wrap').removeClass('is-scroll');
                                }
                                form[key].translate = trans_result;
                                form[key].value = trans_result_label;
                                form[key].label = trans_result_label;
                                $(form[key].el).find('.select-hd .input-wrap div.input').html(form[key].label);
                                $(form[key].el).find('.select-hd .input-wrap div.input').attr('title', form[key].label);
                                getResult();
                            })
                        }
                    }
                    hideSelect();
                })
            }
            $(item).find('.my-input .select-bd').hover(function () {
                disableDocumentScroll = true;
                documentScrollTop = $(document).scrollTop();
            }, function () {
                disableDocumentScroll = false;
            });
        }
        if ($(item).find('.opera .btn-copy').length > 0) {
            form[key].copyIndex = 0;
            $(item).find('.opera .btn-copy').on('click', function () {
                var itemParent = $(item).parent();
                copyDom = itemParent.clone(false);
                form[key].copyIndex += 1;
                var copyKey = key + '_copy_' + form[key].copyIndex;
                while (customArr[copyKey] !== undefined) {
                    form[key].copyIndex += 1;
                    copyKey = key + '_copy_' + form[key].copyIndex;
                }
                customArr[copyKey] = copyKey;
                $(copyDom).find('.form-item').attr('data-key', copyKey);
                $(copyDom).find('.opera').html('');
                $(copyDom).find('.opera').append('<div class="btn btn-remove flex-cc" title="删除" data-key="' + copyKey + '">-</div>');
                $(copyDom).find('.my-input input').val('');
                $(copyDom).find('.my-input .translate').html('');
                $(copyDom).find('.my-input .select').removeClass('is-show is-value');
                $(copyDom).find('.my-input .input-wrap div.input').html('');
                $(copyDom).find('.my-input .input-wrap div.input').attr('title', '');
                $(copyDom).find('.my-input .select-hd .btn-del').attr('data-key', copyKey);
                $(copyDom).find('.my-input .select-bd .list-item').removeClass('on');
                $(copyDom).find('.weight input').val('');
                customArr[copyKey] = copyDom;
                var positionDom = itemParent;
                $($(item).parent().parent().children().get().reverse()).each(function (pIndex, pItem) {
                    if (!!$(pItem).find('.form-item').attr('data-key') && $(pItem).find('.form-item').attr('data-key').indexOf(key) >= 0) {
                        positionDom = $(pItem);
                        return false;
                    }
                })
                positionDom.after(copyDom);
                init(copyDom.find('.form-item'));
            })
        }
        if ($(item).find('.opera .btn-remove').length > 0) {
            $(item).find('.opera .btn-remove').on('click', function () {
                handleRemove($(this).attr('data-key'));
                getResult();
            })
        }
        if ($(item).find('.my-input .btn-del').length > 0) {
            $(item).find('.my-input .btn-del').on('click', function (e) {
                var key = $(this).attr('data-key');
                handleReset(key);
                getResult();
                e.stopPropagation && e.stopPropagation();
                e.preventDefault && e.preventDefault();
                return false;
            })
        }
    }

    function handleInputValue(val, key, _this, needResult) {
        if (key.indexOf('main') >= 0 || key.indexOf('secondary') >= 0 || key.indexOf('no') >= 0) {
            getTransResult(val, function (trans_result, trans_result_label) {
                if (form[key].translate === undefined) form[key].translate = '';
                _this.val(trans_result_label);
                form[key].translate = trans_result;
                form[key].value = trans_result_label;
                form[key].label = trans_result_label;
                $(form[key].el).find('.my-input .translate').html(form[key].translate);
                getResult();
            })
        } else if (key.indexOf('stylize') >= 0) {
            val = val.replace(/[^0-9]/ig, '');
            val = parseInt(val);
            if (isNaN(val)) {
                form[key].value = '';
                form[key].label = '';
                _this.val('');
            } else {
                val = val <= 0 ? 0 : val >= 1000 ? 1000 : val;
                form[key].value = val;
                form[key].label = val;
                _this.val(val);
            }
        } else if (key.indexOf('seed') >= 0) {
            val = val.replace(/[^0-9]/ig, '');
            val = parseInt(val);
            if (isNaN(val)) {
                form[key].value = '';
                form[key].label = '';
                _this.val('');
            } else {
                val = val <= 0 ? 0 : val >= 4294967295 ? 4294967295 : val;
                form[key].value = val;
                form[key].label = val;
                _this.val(val);
            }
        } else if (key.indexOf('quality') >= 0) {
            val = val.replace(/^\D*([0-9]\d*\.?\d{0,6})?.*$/, '$1');
            val = parseFloat(val);
            if (isNaN(val)) {
                form[key].value = '';
                form[key].label = '';
                _this.val('');
            } else {
                val = val <= 0 ? 0 : val >= 2 ? 2 : val;
                form[key].value = val;
                form[key].label = val;
                _this.val(val);
            }
        } else if (key.indexOf('repeat') >= 0) {
            val = val.replace(/^\D*([0-9]\d*\.?\d{0,6})?.*$/, '$1');
            val = parseFloat(val);
            if (isNaN(val)) {
                form[key].value = '';
                form[key].label = '';
                _this.val('');
            } else {
                val = val <= 2 ? 2 : val >= 40 ? 40 : val;
                form[key].value = val;
                form[key].label = val;
                _this.val(val);
            }
        } else if (key.indexOf('chaos') >= 0) {
            val = val.replace(/[^0-9]/ig, '');
            val = parseInt(val);
            if (isNaN(val)) {
                form[key].value = '';
                form[key].label = '';
                _this.val('');
            } else {
                val = val <= 0 ? 0 : val >= 100 ? 100 : val;
                form[key].value = val;
                form[key].label = val;
                _this.val(val);
            }
        } else {
            form[key].value = val;
            form[key].label = val;
        }
        if (needResult) getResult();
    }

    $('body').on('click', hideSelect);

    function hideSelect() {
        if (activeSelect) {
            $(activeSelect).removeClass('is-show');
            activeSelect = null;
        }
    }

    function handleRemove(key) {
        delete form[key];
        if (customArr[key]) $(customArr[key]).remove();
        delete customArr[key];
    }

    function handleCopy(txt) {
        var textarea = document.createElement('textarea');
        textarea.readOnly = 'readonly';
        textarea.style.position = 'absolute';
        textarea.style.top = '-99999px';
        textarea.value = txt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        window.getSelection().empty();
        document.body.removeChild(textarea);
    }

    $('#createdBtn').on('click', function () {
        handleCopy($('#result').val());
    })

    $('#createImage').on('click', function () {
        result = $('#result').val();
        prompt = result.slice(17)
        if (!prompt) {
            alert('请输入提示词')
            return
        }
        msgId = new Date().getTime()
        $('#ret').html('<p>发送中...</p>')
        $.post(laf_url, {
                "type": "imagine",
                "param": {
                    "question": prompt,
                    "msg_Id": msgId
                }
            }, function (data, status) {

            }
        );

        timeFlag = window.setInterval(getPic, 2000)
    })

    $('#createdBtn2').on('click', function () {
        handleCopy($('#result2').text().trim());
    })
    $('#resetBtn').on('click', function () {
        for (var key in form) {
            handleReset(key, true);
        }
        getResult();
    })

    function handleReset(key, clear) {
        if (form[key].value !== undefined) {
            form[key].value = '';
        }
        if (form[key].label !== undefined) {
            form[key].label = '';
        }
        if (form[key].translate !== undefined) {
            form[key].translate = '';
        }
        if (form[key].weight !== undefined) {
            form[key].weight = '';
        }
        if (form[key].selectIndex !== undefined) {
            form[key].selectIndex = '';
        }
        if (form[key].el) {
            $(form[key].el).find('.my-input input').val('');
            $(form[key].el).find('.my-input .translate').html('');
            $(form[key].el).find('.weight input').val('');
            $(form[key].el).find('.select-bd .list-item').removeClass('on');
            $(form[key].el).find('.select-hd .input-wrap div.input').html('');
            $(form[key].el).find('.select-hd .input-wrap div.input').attr('title', '');
            $(form[key].el).find('.select').removeClass('is-value');
        }
        if (clear) {
            for (var key2 in customArr) {
                handleRemove(key2);
            }
        }
    }

    var sortArr = ['imgurl', 'medium', 'main', 'artist', 'secondary', 'composition', 'camera', 'descriptor', 'lighting', 'color', 'game', 'accuracy', 'environment', 'style', 'national', 'photography', 'material', 'depth', 'no', 'aspect', 'seed', 'stylize', 'quality', 'chaos', 'weight', 'repeat', 'version'];

    function getResult() {
        var base = '/imagine prompt:'
        var result = '';
        var resultLabel = '';
        var formKyes = Object.keys(form);
        var hasSecondary = false;
        var secondaryHasWeight = false;
        var hasDepth = false;
        for (var i = 0; i < sortArr.length; i++) {
            for (var j = 0; j < formKyes.length; j++) {
                if (formKyes[j].indexOf(sortArr[i]) >= 0 && form[formKyes[j]] && form[formKyes[j]].value != '') {
                    var value = form[formKyes[j]].translate != undefined ? form[formKyes[j]].translate : form[formKyes[j]].value;
                    var label = form[formKyes[j]].label;
                    var weight = form[formKyes[j]].weight != undefined && form[formKyes[j]].weight != '' ? '::' + form[formKyes[j]].weight : '';
                    switch (sortArr[i]) {
                        case 'main':
                            result += ' ' + value + weight;
                            //resultLabel += ' ' + label + weight;
                            break;
                        case 'imgurl':
                            result += ' ' + value + (weight != '' ? ' ' + weight : '');
                            //resultLabel += ', ' + label + (weight != '' ? ' ' + weight : '');
                            break;
                        case 'medium':
                            result += ' ' + value + ' of';
                            //resultLabel += ' ' + label + ' 的';
                            break;
                        case 'artist':
                            result += ', by ' + value + weight;
                            //resultLabel += ', 来自于 ' + label + weight;
                            break;
                        case 'secondary':
                            result += (hasSecondary ? ', ' : ' ,') + value + weight;
                            secondaryHasWeight = weight !== '';
                            hasSecondary = true;
                            break;
                        case 'game':
                            result += ', ' + value + ' video-game style' + weight;
                            break;
                        case 'depth':
                            hasDepth = false;
                            if (value.toLocaleUpperCase().indexOf('NO') >= 0) {
                                // 不处理
                            } else if (value.toLocaleUpperCase().indexOf('DEEP') >= 0) {
                                result += ', --no defocus';
                                //resultLabel += ', --排除 散焦';
                                hasDepth = true;
                            } else if (value.toLocaleUpperCase().indexOf('SHA') >= 0) {
                                result += ', dof';
                                //resultLabel += ', 自由度';
                            } else {
                                result += ', ' + value;
                                //resultLabel += ', ' + label;
                            }
                            break;
                        case 'no':
                            if (!hasDepth) {
                                result += ' --no';
                                //resultLabel += ' --排除';
                            }
                            var noArr = value.split(',');
                            for (var k = 0; k < noArr.length; k++) {
                                if (noArr[k][0] === ' ') noArr[k][0] = noArr[k][0].slice(1);
                                if (noArr[k][0] !== ' ') {
                                    result += ' ';
                                }
                                result += noArr[k];
                            }
                            //resultLabel += label;
                            break;
                        case 'aspect':
                            result += ' --ar ' + value;
                            //resultLabel += ' --比例 ' + label;
                            break;
                        case 'seed':
                            result += ' --seed ' + value;
                            //resultLabel += ' --种子 ' + label;
                            break;
                        case 'stylize':
                            result += ' --s ' + value;
                            //resultLabel += ' --风格化 ' + label;
                            break;
                        case 'quality':
                            result += ' --q ' + value;
                            //resultLabel += ' --质量 ' + label;
                            break;
                        case 'chaos':
                            result += ' --c ' + value;
                            //resultLabel += ' --混乱 ' + label;
                            break;
                        case 'weight':
                            result += ' --iw ' + value;
                            //resultLabel += ' --重量 ' + label;
                            break;
                        case 'repeat':
                            result += ' --r ' + value;
                            //resultLabel += ' --质量 ' + label;
                            break;
                        case 'version':
                            result += ' ' + value;
                            //resultLabel += ' ' + label;
                            break;
                        default:
                            result += ', ' + value + weight;
                            //resultLabel += ', ' + label + weight;
                            break;
                    }
                }
            }
        }
        if (/^[,]{1}/.test(result)) {
            result = result.slice(1);
        }
        if (/^[,]{1}/.test(resultLabel)) {
            resultLabel = resultLabel.slice(1);
        }
        if (result[0] !== ' ') result = ' ' + result;
        $('#result').val(base + result);
        $('#result2').html(resultLabel);
    }

    getResult();

    //获取生成的图片:已经完成
    function getPic(){
        $.post(laf_url,
            {"type": "RetrieveMessagesById","param":{"msg_Id":msgId}},
            function (result) {
                if (result.length <= 0) {
                    $('#list').html('<p>暂无数据</p>')
                    return
                }
                //只显示第一张图片
                var data = result[0]

                $('#list').html('')
                var content = data.content;
                if(data.type!=0) {
                    //"**[123123123] Mokeys and tigers, rule of thirds** - <@123123123123> (15%) (fast)";
                    // 获取其中百分比
                    var match = content.match(/\(\d+%\)/);
                    var info = ""
                    if (match) {
                        var percentage = match[0].slice(1, -2);
                        info = "目前已完成（" + percentage + "%）";
                    } else {
                        info = "未开始！"
                    }

                    var res = '<p style="padding:20px 0px;font-size: 16px;">图片生成中：' + info + '</p><br/>'
                    $('#list').html(res);
                }else{
                    var attachments = data.attachments[0]
                    if (attachments.width > 512) {
                        h = '<p style="padding:20px 0px;font-size: 16px;">提示词：' +content.split("**")[1] + '</p><br/>'
                        h += '<a target="_blank" href="' + attachments.url + '"><img width="700px" src="' + attachments.url + '"></a><br/>'

                        //提供4张图的下载路径
                        var c1 = data.content.split("**")[1]
                        var m1 = data.id
                        var f1 = data.author.flags;
                        var u1 = data.attachments[0].url


                        $('#list').html('')
                        $('#list').html(h)
                        for(var i=1; i<=4; i++) {

                            //提供第一张图片的下载地址
                            var $a = $('<a style="font-size:16px;margin-left: 10px" href="javascript:void(0)" id="'+i+'">图 '+i+'</a>')
                            $a.one("click", function () {
                                //生成放大图片
                                $.post(laf_url,
                                    {
                                        "type": "upscale",
                                        "param": {"content": c1, "index": $(this).attr("id"), "msgId": m1, "flags": f1, "url": u1}
                                    },
                                    function (data) {

                                    });

                                //获取放大图片的地址
                                setTimeout(function () {
                                    $.post(laf_url,
                                        {"type": "RetrieveMessagesById", "param": {"msg_Id": msgId}},
                                        function (result) {
                                            //获取第一张图片
                                            data = result[0]
                                            var attachments = data.attachments[0]
                                            window.open(attachments.url, "_blank", "width=1000, height=800, top=100, left=100");
                                        }
                                    )
                                }, 10000)

                                //点击一次后，取消点击行为
                                $(this).attr({"disabled":"disabled"}).css("color","gray").css("cursor","default");
                            })
                            $('#list').append($a)
                        }

                        $('#list').append("<span style='margin-right: 10px'>（提示：每张图的下载需要等待10秒！）<span>")
                    }
                    clearInterval(timeFlag)
                }
            });
    }
})