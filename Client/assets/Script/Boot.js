
var app = require("App")
var HttpHandler = require("Network/HttpHandler")

cc.Class({
    extends: cc.Component,

    onLoad () {
        
    },

    start () {
        
    },

    update (dt) {

    },

    onStartButtonClick(node){
        var isNull = app.isNullOrEmpty(this);
        if(isNull == false){
            var instance = HttpHandler.instance();
            instance.post("www.baidu.com");
        }
    }
});
