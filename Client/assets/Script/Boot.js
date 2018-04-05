
var app = require("App")
var Network = require("Network/Network")
var MessageBuilder = require("Network/MessageBuilder")
var LoginManager = require("Session/LoginManager")

cc.Class({
    extends: cc.Component,

    onLoad (){
        
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
        // Network.instance().httpPost("http://localhost:12345/auth", JSON.stringify(user), function(err, data){
        //     cc.log(data);
        // }, false);

        // var protoFile = "protocol/KConnectProto";  
        // cc.loader.loadRes(protoFile, function (err, proto){  
        //     cc.log("loadfinish");  
        
        //     var Builder = ProtoBuf.protoFromString(proto);  
        // });  

        MessageBuilder.instance().loadProtos(["protocol/connect", "protocol/game"], function(){
            LoginManager.instance().login(function(isSuccess, errType, errInfo){
                cc.log("isSuccess : " + isSuccess + ", errType : " + errType + ", errInfo" + errInfo);
            });
        });
    }
});
