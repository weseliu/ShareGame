var MessageBuilder = require("MessageBuilder");

var MessageDispatch = cc._Class.extend({
    
    _messageRegisterMap: null,
    _sentMessageCallbackList: null,

    statics:{
        MESSAGE_TIMEOUT_TIME: 15000,
    },

    ctor: function () {
        this._messageRegisterMap = {};
        this._sentMessageCallbackList = [];

        cc.director.getScheduler().schedule(this._messageResponseChecker.bind(this), this,
                                            1, cc.REPEAT_FOREVER, 0, false, "_messageResponseChecker");
    },

    onSocketConnect: function () {
        this._sentMessageCallbackList = [];
        this._onMessageCallback("socket_connect");
    },

    onSocketError: function (errorEvent) {
        this._onMessageCallback("socket_error", errorEvent);
    },

    onSocketClose: function(closeEvent) {
        this._sentMessageCallbackList = [];
        this._onMessageCallback("socket_close", closeEvent);
    },

    onSocketMessage: function (messageEvent) {
        if(messageEvent.data == null){
            return;
        }

        var messageObj = MessageBuilder.instance().decode(messageEvent.data);
        var messageType = MessageBuilder.instance().getMessageTypeName(messageObj);
        var messageKey = this._getMessageKey(messageType);
        this._onMessageCallback(messageKey, messageObj);
    },

    _onMessageCallback: function (messageKey, messageObj) {
        var eventList = this._messageRegisterMap[messageKey];
        if(eventList != null) {
            for (var i = 0; i < eventList.length; i++) {
                var handler = eventList[i];
                if (handler.enable === true && typeof handler.callback === "function") {

                    if(handler.autoRelease === true) {
                        handler.enable = false;
                    }
                    handler.callback.call(handler.objInstance,messageObj);

                    //message timeout process
                    for(var j = 0; j < this._sentMessageCallbackList.length; j++){
                        if(!this._sentMessageCallbackList[j]) continue;
                        var sentHandler = this._sentMessageCallbackList[j][1];
                        if(sentHandler.message === messageKey && sentHandler.objInstance === handler.objInstance){
                            this._sentMessageCallbackList[j] = null;
                        }
                    }
                }
            }

            this._messageRegisterMap[messageKey] = eventList.filter(function (element) {
                return (element.enable === true);
            });

            this._updateMessageCallbackList();
        }
    },

    registerSocketConnectEvent: function (connectEvent, obj, callback) {
        this._registerSocketEvent(obj, connectEvent, callback);
    },

    unregisterSocketConnectEvent: function (connectEvent, obj) {
        this.unregisterSocketEvent(obj, connectEvent);
    },

    registerSocketMessageEvent: function (obj, message, callback, autoRelease) {
        var messageKey = this._getMessageKey(message);
        return this._registerSocketEvent(obj, messageKey, callback, autoRelease);
    },

    _registerSocketEvent: function (obj, message, callback, autoRelease) {
        var eventList = this._messageRegisterMap[message];
        if(eventList != null) {
            var filtered = eventList.filter(function (element) {
                return (element.objInstance === obj && element.message === message);
            });

            if (filtered.length > 0) {
                return null;
            }
        }

        var handler = {
            enable :true,
            objInstance: obj,
            message: message,
            callback: callback,
            autoRelease: autoRelease
        };

        this._messageRegisterMap[message] = this._messageRegisterMap[message] || [];
        this._messageRegisterMap[message].push(handler);
        return handler;
    },

    unregisterSocketEvent: function (obj, message) {
        var eventList = this._messageRegisterMap[message];
        if(eventList != null) {
            this._messageRegisterMap[message] = eventList.filter(function (element) {
                return (element.objInstance != obj || element.message != message);
            });
        }
    },

    unregisterAllSocketEvent: function (obj) {
        var messageMap = this._messageRegisterMap;
        for (var message in messageMap) {
            if (messageMap.hasOwnProperty(message)) {
                var eventList = messageMap[message];
                if(eventList != null) {
                    messageMap[message] = eventList.filter(function (element) {
                        return (element.objInstance != obj);
                    });
                }
            }
        }
    },

    checkMessageResponse: function(sentInfo){
        this._sentMessageCallbackList.push(sentInfo);
    },

    _messageResponseChecker: function(){
        if(this._sentMessageCallbackList.length === 0){
            return;
        }

        var updateList = false;
        var currTime = new Date().getTime();
        for(var i = 0; i < this._sentMessageCallbackList.length; i++){
            var sentInfo = this._sentMessageCallbackList[i];

            var sentTime = sentInfo[0];
            var handler = sentInfo[1];
            //time out
            if(sentTime + this.MESSAGE_TIMEOUT_TIME < currTime){
                this._onMessageCallback(handler.message, null);
                updateList = true;
                this._sentMessageCallbackList[i] = null;
            }
        }

        if(updateList === true) {
            this._updateMessageCallbackList();
        }
    },

    _updateMessageCallbackList: function(){
        this._sentMessageCallbackList = this._sentMessageCallbackList.filter(function (element) {
            return (element != null);
        });
    },
 
    _getMessageKey: function (message) {
        return "socket_" + message;
    }
});

module.exports = MessageDispatch;
