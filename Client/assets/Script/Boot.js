
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
        var user = {
            name : "asdffasdf",
            password : "111111111",
            addr : "52541aaaa"
        }
        var instance = HttpHandler.instance();
        instance.post("http://localhost:12345/auth", function(err, data){
            cc.log(data);
        }, JSON.stringify(user), false);
    }
});
