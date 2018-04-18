var StateBase = require("../Common/StateBase");

var LoginState = cc.Class({
    extends : StateBase,

    ctor: function () {
    },

    initialize: function() {
        cc.log("LoginState initialize");
    },

    uninitialize: function() {
        cc.log("LoginState uninitialize");
    },

    onStateEnter: function(userData) {
        cc.log("LoginState onStateEnter");
        cc.director.loadScene("Scene/Login");
    },

    onStateLeave: function() {
        cc.log("LoginState onStateLeave");
    }
});