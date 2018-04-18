
var app = require("App");
var Network = require("Network/Network");
var MessageBuilder = require("Network/MessageBuilder");
var StateManager = require("Common/StateManager");
var LoginState = require("GameState/LoginState");

var Boot = cc.Class({
    extends: cc.Component,
    stateManager : null,

    statics :{
        _instance : null,
        instance () {
            if(this._instance == null){
                this._instance = new this();
            }
            return this._instance;
        }
    },

    onLoad : function(){
        cc.game.addPersistRootNode(this.node);
    },

    start : function() {
        this.initModules();
    },

    update : function(dt) {

    },

    initModules : function(){
        this.initStates();
    },

    initStates : function(){
        this.stateManager = new StateManager();
        this.stateManager.register("LoginState", new LoginState());
    },

    loadProto :function(){
        MessageBuilder.instance().loadProtos(["protocol/connect", "protocol/game"], function(){
            this.stateManager.changeState("LoginState");
        });
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


    }
});

module.exports = Boot