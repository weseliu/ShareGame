var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket;

var SocketHandler = cc.Class({
    _socketClient: null,
    _closeEventCallback: null,

    ctor: function () {
    },

    connect: function (url, connectCallback, messageCallback, errorCallback, closeCallback) {
        this._socketClient = new WebSocket(url);
        this._socketClient.binaryType = "arraybuffer";

        this._socketClient.onopen = connectCallback;
        this._socketClient.onmessage = messageCallback;
        this._socketClient.onerror = errorCallback;
        this._socketClient.onclose = this._onCloseCallback.bind(this);
        this._closeEventCallback = closeCallback;
    },

    close: function () {
        if(this._socketClient != null) {
            this._socketClient.close();
        }
    },

    _onCloseCallback: function (closeEvent) {
        // app.dumpMessage("closeEvent : wasClean = {0}, code = {1}, reason = {2}".Format(
        //                 closeEvent.wasClean, closeEvent.code, closeEvent.reason));
        this._socketClient = null;
        if(this._closeEventCallback != null){
            this._closeEventCallback(closeEvent);
        }
    },

    send: function (buffer) {
        if (this._socketClient != null && this._socketClient.readyState == WebSocket.OPEN) {
            this._socketClient.send(buffer);
        }
    }
});

module.exports = SocketHandler