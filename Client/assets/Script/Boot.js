
var app = require("App")
var HttpHandler = require("Network/HttpHandler")
var MessageBuilder = require("Network/MessageBuilder")

cc.Class({
    extends: cc.Component,

    onLoad () {
        
    },

    start () {
        
    },

    update (dt) {

    },

    onStartButtonClick(node){
        // var user = {
        //     name : "asdffasdf",
        //     password : "111111111",
        //     addr : "52541aaaa"
        // }
        // var instance = HttpHandler.instance();
        // instance.post("http://localhost:12345/auth", function(err, data){
        //     cc.log(data);
        // }, JSON.stringify(user), false);

        // var protoFile = "protocol/KConnectProto";  
        // cc.loader.loadRes(protoFile, function (err, proto){  
        //     cc.log("loadfinish");  
        
        //     var Builder = ProtoBuf.protoFromString(proto);  
        // });  

        MessageBuilder.instance().loadProtos(["protocol/CSProto", "protocol/KConnectProto"], function(){
            
        });
    }
});
