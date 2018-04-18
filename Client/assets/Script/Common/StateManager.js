var StateManager = cc.Class({
    _stateRegisterMap: null,
    _stateStack: null,

    ctor: function () {
        this._stateRegisterMap = {};
        this._stateStack = [];
    },

    register: function(stateName, state) {
        state.initialize();
        this._stateRegisterMap[stateName] = state;
    },

    unregister: function(stateName) {
        if(this._stateRegisterMap[stateName] != null) {
            this._stateRegisterMap[stateName].uninitialize();
            this._stateRegisterMap[stateName] = null;
        }
    },

    changeState: function(stateName, userData) {
        var state = this._stateRegisterMap[stateName];
        if(state == null) {
            return;
        }

        if(this._stateStack.length > 0){
            var oldState = this._stateStack.pop();
            if(oldState != null){
                oldState.onStateLeave();
            }
        }
        this._stateStack.push(state);
        state.onStateEnter(userData);
    },

    topStateName: function() {
        var state = this._stateStack[this._stateStack.length - 1];
        for(var prop in this._stateRegisterMap) {
            if(this._stateRegisterMap[prop] === state){
                return prop;
            }
        }
        return null;
    },

    clear: function() {
        for(var state in this._stateStack){
            state.onStateLeave();
        }
        this._stateStack = null;
        this._stateRegisterMap = null;
    }

});

module.exports = StateManager