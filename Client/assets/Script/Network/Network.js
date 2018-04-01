var MessageDispatch = require("MessageDispatch");
var HttpHandler = require("HttpHandler");
var SocketHandler = require("SocketHandler");
var MessageBuilder = require("MessageBuilder");

var Network = cc.Class({
    _httpInstance: null,
    _socketHandler: null,
    _messageDispatch: null,

    statics :{
        _instance : null,
        instance () {
            if(this._instance == null){
                this._instance = new this();
            }
            return this._instance;
        }
    },

    ctor: function () {
        this._httpInstance = new HttpHandler();
        this._socketHandler = new SocketHandler();
        this._messageDispatch = new MessageDispatch();
    },

    connectServer: function (url) {
        this._socketHandler.connect(url,
            this._messageDispatch.onSocketConnect.bind(this._messageDispatch),
            this._messageDispatch.onSocketMessage.bind(this._messageDispatch),
            this._messageDispatch.onSocketError.bind(this._messageDispatch),
            this._messageDispatch.onSocketClose.bind(this._messageDispatch));
    },

    closeConnect: function () {
        this._socketHandler.onLogout();
    },

    sendMessage: function (messageObj, callback) {
        if(callback != null){
            var messageType = MessageBuilder.instance().getMessageTypeName(messageObj);
            var handler = this._messageDispatch.registerSocketMessageEvent(callback[0], messageType, callback[1], true);
            if(handler != null) {
                this._messageDispatch.checkMessageResponse([new Date().getTime(), handler]);
            }
        }

        this._socketHandler.send(MessageBuilder.instance().encode(messageObj));
    },

    sendRawMessage: function(message){
        this._socketHandler.send(message);
    },

    registerConnectEvent: function (connectEvent, obj, callback) {
        this._messageDispatch.registerSocketConnectEvent(connectEvent, obj, callback);
    },

    unregisterConnectEvent: function (connectEvent, obj) {
        this._messageDispatch.unregisterSocketConnectEvent(connectEvent, obj);
    },

    registerMessageEvent: function (obj, messageType, callback) {
        this._messageDispatch.registerSocketMessageEvent(obj, messageType, callback, false);
    },

    unregisterMessageEvent: function (obj, messageType) {
        this._messageDispatch.unregisterSocketEvent(obj, messageType);
    },

    unregisterAllEvent: function (obj) {
        this._messageDispatch.unregisterAllSocketEvent(obj);
    },

    httpPost: function (url, data, cb, isText) {
        this._httpInstance.post(url, cb, data, isText);
    },

    httpGet: function (url, cb) {
        this._httpInstance.get(url, cb);
    }
});

module.exports = Network
