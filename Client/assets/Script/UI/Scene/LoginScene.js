var LoginManager = require("../../Session/LoginManager");

cc.Class({
    extends: cc.Component,

    start () {

    },

    onLoginButtonClick (node) {
        cc.log("onLoginButtonClick");
        LoginManager.instance().login(function(isSuccess, errType, errInfo){
            cc.log("isSuccess : " + isSuccess + ", errType : " + errType + ", errInfo : " + errInfo);
        });
    },
});
