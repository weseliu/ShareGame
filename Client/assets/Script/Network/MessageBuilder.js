var ProtoBuf = require("Protocol/protobuf")
var app = require("../App")

var MessageBuilder = cc.Class({
    _builder: null,
    _messageRoot: null,
    _csPack: null,
    _logicBody: null,
    _csMsg: null,

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
        this._builder = ProtoBuf.newBuilder({convertFieldsToCamelCase: false});
    },

    loadProtos: function(files, callback){
        var loadCompleted = function(){
            this._messageRoot = this._builder.build();
            this._csPack = this.build("CSPACK", true);
            this._logicBody = this.build("CMD_LOGIC_CS", true);
            this._csMsg = this.build("CSMSG");
    
            this.buildProtoEnum();
            this._moduleTest();
            if(cc.isFunction(callback)){
                callback();
            }
        }.bind(this);

        var length = files.length;
        var count = 0;
        var loadCounter = function(){
            count ++;
            if(count == length){
                if(cc.isFunction(loadCompleted)){
                    loadCompleted();
                }
            }
        }
        for(var i = 0; i < length; i++){
            this._loadProto(files[i], loadCounter);
        }
    },

    _loadProto: function (filePath, callback) {
        cc.loader.loadRes(filePath, function (err, proto){  
            ProtoBuf.loadProto(proto, this._builder, filePath);
            if(cc.isFunction(callback)){
                callback();
            }
        }.bind(this)); 
    },

    buildProtoEnum : function(){
        app.protoEnum = {};
        this._buildProtoEnum(this._getMessageBase(true));
        this._buildProtoEnum(this._getMessageBase(false));
    },

    _buildProtoEnum: function(rootObj){
        for(var prop in rootObj) {
            if (rootObj.hasOwnProperty(prop)) {
                var value = rootObj[prop];
                if (typeof (value) === "object") {
                    app.protoEnum[prop] = {};
                    for(var item in value) {
                        if (value.hasOwnProperty(item)) {
                            app.protoEnum[prop][item] = value[item];
                        }
                    }
                }
            }
        }
    },

    getMessageTypeName: function(messageObj) {
        var message = messageObj.$type.name;
        if(message.endWith("_CS"))
            message = message.substring(0,message.lastIndexOf('_CS'));
        else if(message.endWith("_SC"))
            message = message.substring(0,message.lastIndexOf('_SC'));
        return message;
    },

    getMessageName: function(messageType, uploadMessage) {
        if (uploadMessage === true) {
            return messageType + "_CS";
        }
        return messageType + "_SC";
    },

    build: function (message) {
        var base = this._getMessageBase(this._isCommand(message));
        return new base[message]();
    },

    autoBuild: function(message) {
        var base = this._getMessageBase(this._isCommand(message));
        var rootObj = new base[message]();

        function buildChildren(base, rootObj) {
            for(var i in rootObj.$type.children){
                if (rootObj.$type.children.hasOwnProperty(i)) {
                    var child = rootObj.$type.children[i];
                    if (child.repeated) {
                        rootObj[child.name] = [];
                    } else {
                        rootObj[child.name] = child.type.defaultValue;
                        if (child.resolvedType != null && child.resolvedType.className !== "Enum") {
                            rootObj[child.name] = new base[child.resolvedType.name]();
                            buildChildren(base, rootObj[child.name]);
                        }
                    }
                }
            }
        }

        buildChildren(base, rootObj);
        return rootObj;
    },

    encode: function (messageObj) {
        var message = messageObj.$type.name;
        var messageType = this.getMessageTypeName(messageObj);
        if (this._isCommand(message)) {
            return this._encodeCommand(messageObj, messageType);
        }

        return this._encodeMessage(messageObj, messageType);
    },

    _encodeCommand: function (messageObj, messageType) {
        var base = this._getMessageBase(true);
        this._csPack.cmd = base["CommandType"][messageType];
        this._csPack.body = messageObj.toArrayBuffer();

        return this._csPack.toArrayBuffer();
    },

    _encodeMessage: function (messageObj, messageType) {
        var msgBase = this._getMessageBase(false);
        this._csMsg.msg = msgBase["MessageType"][messageType];
        this._csMsg.body = messageObj.toArrayBuffer();

        this._logicBody.logic_pkg = this._csMsg.toArrayBuffer();

        return this._encodeCommand(this._logicBody, "CMD_LOGIC");
    },

    decode: function (buffer, uploadMessage) {
        var cmdBase = this._getMessageBase(true);
        var packageObj = cmdBase["SCPACK"].decode(buffer);

        var commandName = this._getCommandNameByValue(packageObj.cmd);
        var commandObjName = this.getMessageName(commandName, uploadMessage);
        var commandObj = cmdBase[commandObjName].decode(packageObj.body);
        if (packageObj.cmd != cmdBase["CommandType"]["CMD_LOGIC"]) {
            return commandObj;
        }

        var msgBase = this._getMessageBase(false);
        var messagePkgObj = msgBase["SCMSG"].decode(commandObj["logic_pkg"]);

        var messageName = this._getMessageNameByValue(messagePkgObj.msg);
        var messageObjName = this.getMessageName(messageName, uploadMessage);
        var messageObj = msgBase[messageObjName].decode(messagePkgObj.body);

        return messageObj;
    },

    _getMessageBase: function (isCommand) {
        return isCommand ? this._messageRoot.connect : this._messageRoot.game;
    },

    _isCommand : function(message){
        if(cc.isFunction(this._messageRoot.connect[message])) {
            return true;
        }
        return false;
    },

    _getCommandNameByValue: function (value) {
        var cmdBase = this._getMessageBase(true);
        for (var cmd in cmdBase["CommandType"]) {
            if (cmdBase["CommandType"][cmd] === value) {
                return cmd;
            }
        }
        return null;
    },

    _getMessageNameByValue: function (value) {
        var msgBase = this._getMessageBase(false);
        for (var msg in msgBase["MessageType"]) {
            if (msgBase["MessageType"][msg] === value) {
                return msg;
            }
        }
        return null;
    },

    _moduleTest: function () {
        // var obj = this.build("WX_CMD_AUTH_CS", true);
        // obj.game_id = 10000;
        // obj.auth_type = 1;
        // obj.account = "sssssssss";
        // obj.qwd_md5 = "12485242";

        // var buffer = this.encode(obj, true);
        // var obj2 = this.decode(buffer, true);

        // var obj3 = this.build("CMD_ERROR_SC");
        // obj3.msg_box_type = 1;
        // obj3.error_code = 1;
        // obj3.cmd_id = 2;
        // obj3.title = "12485242";
        // obj3.content = "asdfasdfasdf";

        // var buffer2 = this.encode(obj3);
        // var obj4 = this.decode(buffer2, false);

        // var obj5 = this.build("CMD_ROLE_MISC_SC");
        // var data = this.build("RoleMisc");
        // obj5.data = data;


        // var obj7 = this.autoBuild("CMD_ROLE_MISC_SC");
        // obj7.data.object_id = 1;

        // obj7.data.base.sex = 1;
        // obj7.data.base.map_id = 2;
        // obj7.data.base.name = "test";
        // obj7.data.base.self_def_photo = "http://test";
        // obj7.data.base.mobile = "13688026101";

        // obj7.data.privilege.privilege_flag = 32;
        // obj7.data.privilege.vip_level = 32;

        // obj7.data.online_gift.have_next_gift = false;
        // obj7.data.online_gift.next_seconds = 2;
        // obj7.data.online_gift.gift_gold = 3;
        // obj7.data.online_gift.vip_gold_ratio = 4;

        // obj7.data.next_online_gift.have_next_gift = false;
        // obj7.data.next_online_gift.next_seconds = 2;
        // obj7.data.next_online_gift.gift_gold = 3;
        // obj7.data.next_online_gift.vip_gold_ratio = 4;

        // var buffer5 = this.encode(obj7);
        // var obj8 = this.decode(buffer5, false);

        // cc.log("********* MessageBuilder: Test Success!*************");
    }
});

module.exports = MessageBuilder