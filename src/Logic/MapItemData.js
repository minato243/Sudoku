/**
 * Created by thaod on 12/3/2017.
 */

var MapItemData = cc.Class.extend({
    level: 0,
    status: LOCK,
    numStar: 0,

    /**
     *
     * @param level of item, start from 1,2...
     * @param status LOCK or UNLOCK
     * @param numStar number star of this level, equal 0 if status = LOCK
     */
    ctor: function(level, status, numStar){
        if(arguments.length == 3){
            this.init(level, status, numStar);
        } else if(arguments.length == 1){
            this.init(level, LOCK, 0);
        }else this.init(0, LOCK,0);
    },

    init: function(level,status, numStar){
        this.level = level;
        this.status = status;
        this.numStar = numStar;
    },

    open: function() {
        this.status = UN_LOCK;
    },

    setNumStar: function(numStar){
        this.numStar = numStar;
    },

    toString: function(){
        var result = "MapItemData{level = "+ this.level+", status = "+this.status +", numStar = "+ this.numStar+"}";
        return result;
    },

    convertToStorageString: function(){
        var result = this.level+"|"+this.status+"|"+this.numStar;
        return result;
    }

});

MapItemData.createFromString = function(data){
    var mapItemData = new MapItemData();
    var dataArray = data.split("|");
    if(dataArray == undefined || dataArray.length == 0) return null;

    mapItemData.level = parseInt(dataArray[0]);
    mapItemData.status = (dataArray[1]=="true");
    mapItemData.numStar = parseInt(dataArray[2]);
    return mapItemData;
};

MapItemData.createFromNumStar = function(level, numStar, status){
    var mapItemData = new MapItemData();
    mapItemData.level = level;
    mapItemData.status = status;
    mapItemData.numStar = numStar;

    return mapItemData;
};
