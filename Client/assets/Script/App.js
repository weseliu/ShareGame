var app = {};

// 扩展系统函数
// 扩展Array函数
if (!String.equalsIgnoreCase) {
    String.prototype.equalsIgnoreCase = function equalsIgnoreCase(str) {
        if (this.toUpperCase() == str.toUpperCase()) {
            return true;
        }
        return false;
    }
}

if (!String.Format) {
    String.prototype.Format = function () {
        var nLength = arguments.length;
        if (nLength == 0) {
            return this;
        }

        var strResult = this;
        for (var i = 0; i < nLength; i++) {
            strResult = strResult.replace('{' + i + '}', arguments[i]);
        }
        return strResult;
    }
}

String.prototype.startWith = function (str) {
    var reg = new RegExp("^" + str);
    return reg.test(this);
};

String.prototype.endWith = function (str) {
    var reg = new RegExp(str + "$");
    return reg.test(this);
};

if (!Array.contains) {
    Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }
}

if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
        return -1;
    }
}

if(!Array.unique){
    Array.prototype.unique = function()
    {
        var n = {},r=[]; //n为hash表，r为临时数组
        for(var i = 0; i < this.length; i++) //遍历当前数组
        {
            if (!n[this[i]]) //如果hash表中没有当前项
            {
                n[this[i]] = true; //存入hash表
                r.push(this[i]); //把当前数组的当前项push到临时数组里面
            }
        }
        return r;
    }
}

app.isNullOrEmpty = function(obj){
    if(obj===null || obj===undefined) return true;
    for (var t in obj)
        return !1;
    return !0
};

app.parse2Str=function(obj){
    if(obj===null || obj===undefined) return "";
    else if(cc.isString(obj)) return obj;
    else return obj.toString();
};

module.exports = app