var Network = require("../Network/Network")
var MessageBuilder = require("../Network/MessageBuilder")

var LoginManager = cc.Class({
    _isLoginSuccess: null,
    _loginCallback: null,
    _queryServerHttpUrl : null,
    _loginProgressNotify : null,
    _lastPingValue : null,
    _identityToken : "",

    statics :{
        _instance : null,
        instance () {
            if(this._instance == null){
                this._instance = new this();
            }
            return this._instance;
        }
    },

    ctor: function(){
        this._isLoginSuccess = false;
        this._lastPingValue = 0;
        this._identityToken = "";

        this._queryServerHttpUrl = "http://127.0.0.1:12345/auth";
        Network.instance().registerConnectEvent("socket_connect", this, this.onConnectEvent.bind(this));
        Network.instance().registerConnectEvent("socket_error", this, this.onConnectErrorEvent.bind(this));
        Network.instance().registerConnectEvent("socket_close", this, this.onConnectCloseEvent.bind(this));
        Network.instance().registerMessageEvent(this, "CMD_KICKOFF_ACCOUNT", this.onSvrKickOffMessage.bind(this));
    },

    login: function(callback){
        this._isLoginSuccess = false;
        this._loginCallback = callback;
        this.queryServerAddress();
    },

    logout: function(){
        this._isLoginSuccess = false;
        Network.instance().closeConnect();
    },

    isLoginSuccess : function(){
        return this._isLoginSuccess;
    },

    getCurrentPingValue : function(){
        cc.log("getCurrentPingValue: _lastPingValue = " + this._lastPingValue);
        return this._lastPingValue;
    },

    _onLoginCallback : function(isSuccess, errType, errInfo){
        if(this._loginCallback != null){
            this._loginCallback(isSuccess, errType, errInfo);
            this._loginCallback = null;
        }

        if(isSuccess){
            this._startPingMessageLoop(true);
        }
    },

    notifyLoginProgress: function(content, percent){
        if(cc.isFunction(this._loginProgressNotify)){
            this._loginProgressNotify(content, percent);
        }
    },

    queryServerAddress: function() {
        var requestInfo = {
            "user_channel": "001",
            "acc": "111111111111111111111111",
            "pwd": "",
            "access_token": ""
        };

        Network.instance().httpPost(this._queryServerHttpUrl, JSON.stringify(requestInfo),
                               this._onQueryAddressResponse.bind(this));
    },

    _onQueryAddressResponse: function(err, respJson) {
        if(respJson!= null && respJson.ret_code === "0") {
            this._identityToken =  respJson.identity_token;
            this._onQueryAddressSuccess(respJson.server_url);
        } else {
            this._onQueryAddressFail(respJson);
        }
    },

    _onQueryAddressSuccess : function(svrUrl){
        this.connectServer(svrUrl);
    },

    _onQueryAddressFail : function(respJson){
        if(respJson == null){
            respJson = {};
            respJson.ret_code = -1;
            respJson.ret_desc = "no response!";
        }
        this._onLoginCallback(false, respJson.ret_code, respJson.ret_desc);
    },

    connectServer: function(server_url) {
        Network.instance().connectServer(server_url);
    },

    onConnectEvent: function(){
        this.sendAuthMessage();
    },

    onConnectErrorEvent: function() {
        cc.log("LoginManager : onConnectErrorEvent");
        if(!this.isLoginSuccess()){
            this._onLoginCallback(false, "onConnectErrorEvent", null);
        }
    },

    onConnectCloseEvent: function() {
        cc.log("LoginManager : onConnectCloseEvent");
        // app.messageBox(app.strings.CONNECT_CLOSED_TIP, [app.CONNECT_BTN, app.CANCEL_BTN], 0, function(button){
        //     if(button == app.ButtonType.OK){
        //         this.login(function(isSuccess, errType, errInfo){
        //             if(isSuccess === false){
        //                 app.messageBox(app.strings.LOGIN_FAIL_TIP, [app.OK_BTN], 0, function(){
        //                     this.doLogout();
        //                 }.bind(this));
        //             }
        //         }.bind(this), null, false);
        //     } else {
        //         this.doLogout();
        //     }
        // }.bind(this));
    },

    sendAuthMessage: function(){
        var authObj = MessageBuilder.instance().autoBuild("CMD_AUTH_CS");
        authObj.game_id = 10;
        authObj.identity_token = this._identityToken;
        Network.instance().sendMessage(authObj, [this, this.onAuthMessage.bind(this)]);
    },

    onAuthMessage: function(authJson) {
        if(authJson == null) {
            return;
        }

        if(authJson.ret_code === 0) {
            this.sendAccountLogin();
        } else {
            cc.log("onAuthMessage fail!")
            this._onLoginCallback(false, "onAuthMessage", authJson);
        }
    },

    sendAccountLogin: function(){
        this.notifyLoginProgress(app.strings.LAUNCH_TIP_ACCOUNT_LOGIN, 1.0);
        var aloginObj = app.messageBuilder().autoBuild("CMD_ALOGIN_CS");
        aloginObj.verion_type = 1;
        aloginObj.account = app.platformManager().deviceInfo.getDeviceUniqueId();
        aloginObj.name = app.platformManager().deviceInfo.getDeviceName();
        aloginObj.client_ver = app.platformManager().deviceInfo.getPackageVersion();
        aloginObj.channel = app.platformManager().deviceInfo.getChannelCode();
        aloginObj.operaters_type = app.platformManager().deviceInfo.getMobileOperatorsType();
        var location = app.platformManager().deviceInfo.getLocation();
        aloginObj.longitude = location.longitude;
        aloginObj.latitude = location.latitude;

        Network.instance().sendMessage(aloginObj, [app.loginManager(), this.onAccountLogin.bind(app.loginManager())]);
    },

    onAccountLogin: function(loginJson){
        if(loginJson == null) {
            return;
        }

        if(loginJson.result === 0){
            this._isLoginSuccess = true;
            cc.log("onAccountLogin : login success!");
            this._onLoginCallback(true, null, null);
        } else {
            cc.log("onAccountLogin : " + loginJson.hint_msg);
            this._onLoginCallback(false, "onAccountLogin", loginJson);
        }
    }

});

module.exports = LoginManager;