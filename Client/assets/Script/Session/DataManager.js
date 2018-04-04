var DataManager = cc.Class({
    
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
        
    },
});

module.exports = DataManager;