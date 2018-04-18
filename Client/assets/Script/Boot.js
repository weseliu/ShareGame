
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
        this.loadProto();
    },

    update : function(dt) {

    },

    initModules : function(){
        cc.log("initModules");
        this.initStates();
    },

    initStates : function(){
        this.stateManager = new StateManager();
        this.stateManager.register("LoginState", new LoginState());
    },

    loadProto :function(){
        MessageBuilder.instance().loadProtos(["protocol/connect", "protocol/game"], function(){
            this.stateManager.changeState("LoginState");
        }.bind(this));
    }
});

module.exports = Boot