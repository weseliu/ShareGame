var HttpHandler = cc.Class({
    statics :{
        _instance : null,
        instance () {
            if(this._instance == null){
                this._instance = new this();
            }
            return this._instance;
        }
    },

    ctor : function () {
    },

    get : function (url, cb) {
        cc.loader.loadJson(url, cb);
    },

    _loadTxtByPost : function(url, cb, data) {
        var xhr = cc.loader.getXMLHttpRequest();
        var errInfo = "load " + url + " failed!";

        var params = "";
        if (typeof(data) == "object") {
            for (key in data) {
                params += (key + "=" + data[key] + "&");
            }
        } else {
            params = data;
        }
        xhr.open("POST", url, true);

        xhr.responseType = "text";
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text\/plain; charset=utf-8");
        }

        xhr.onload  = function () {
            if (xhr.readyState === 4)
                xhr.status === 200 ? cb(null, xhr.responseText) : cb({
                    status: xhr.status,
                    errorMessage: errInfo
                }, null);
        };

        xhr.onerror = function () {
            if(cc.isFunction(cb)){
                cb({status: xhr.status, errorMessage: errInfo}, null);
            }
        };
        xhr.send(params);
    },

    post : function(url, cb, data, isText) {
        this._loadTxtByPost(url, function (err, txt) {
            if (err) {
                if(cc.isFunction(cb)){
                    cb(err,null);
                }
            }
            else {
                try {
                    var result = "";
                    if(isText === true){
                        result = txt;
                    } else {
                        result = JSON.parse(txt);
                    }
                }
                catch (e) {
                    cb({msg:e},null);
                    return;
                }
                cb(null, result);
            }
        }, data);
    }
});

module.exports = HttpHandler

