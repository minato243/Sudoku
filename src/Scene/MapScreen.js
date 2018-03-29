/**
 * Created by thaod on 12/3/2017.
 */

var MapLayer = cc.Layer.extend({
    bgImage: null,
    nextMapButton: null,
    previousMapButton: null,
    itemList: [],
    itemDataList:[],

    currentMap:1,

    ctor: function()
    {
        //////////////////////////////
        // 1. super init first
        this._super();

        var mapScreen = ccs.load(res.MapScene_json);
        this.addChild(mapScreen.node);

        this.bgImage = mapScreen.node.getChildByName("bgImage");

        this.nextMapButton = this.bgImage.getChildByName("btn_next");
        this.nextMapButton.addTouchEventListener(this.onClickNextMapButton, this);

        this.previousMapButton = this.bgImage.getChildByName("btn_previous");
        this.previousMapButton.addTouchEventListener(this.onClickPreviousMapButton, this);

        this.initMapItem();
        this.initEffectOnButton();
        this.showButton();
        this.showEffectOnMapItem();

        var touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            touchBeganPos:null,

            onTouchBegan: function (touch, event) {
                this.touchBeganPos = touch.getLocation();
                return true;
            },

            onTouchEnded: function (touch, event) {
                var pos = touch.getLocation();
                cc.log("onTouchEnded "+ pos.x+" "+pos.y+" touchBegan "+ this.touchBeganPos.x+" "+ this.touchBeganPos.y);
                if(pos.y - this.touchBeganPos.y > 20) MapScene.getInstance().layer.switchPreviousMap();
                else if(pos.y - this.touchBeganPos.y < -20) MapScene.getInstance().layer.switchNextMap();
                return true;
            }

        });

        cc.eventManager.addListener(touchListener, this.bgImage);

        var keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                cc.log("keyCode = "+keyCode);
                if(keyCode == cc.KEY.backspace || keyCode == cc.KEY.back){
                    MapLayer.getInstance().onBackPress();
                }else if(keyCode == cc.KEY.home){
                    //do something
                }
            }
        });
        cc.eventManager.addListener(keyboardListener, this.bgImage);

        return true;
    },

    initMapItem: function(){
        var itemDataList = GameDataMgr.getInstance().getMapItemDataList();
        this.itemList = [];
        for (var i = 0; i < NUM_LEVEL_ONE_MAP; i ++){
            var dataIdx = (this.currentMap-1) * NUM_LEVEL_ONE_MAP + i;
            var button = this.bgImage.getChildByName("btn_item_"+  (i+1).toString());
            var itemData = itemDataList[dataIdx];
            var mapItem = new MapItem(button, itemData);
            mapItem.initData();

            this.itemList.push(mapItem);
        }
    },

    showButton: function(){
        if(this.currentMap == 1){
            this.setPreviousButtonVisible(false);
        } else this.setPreviousButtonVisible(true);

        if(this.currentMap == NUM_GROUP){
            this.setNextButtonVisible(false);
        } else this.setNextButtonVisible(true);
    },

    initEffectOnButton: function(){
        var action = cc.repeatForever(cc.sequence(cc.MoveBy.create(0.5, cc.p(0, -10)), cc.MoveBy.create(0.5, cc.p(0, 10))));
        this.nextMapButton.stopAllActions();
        this.nextMapButton.runAction(action);

        action = cc.repeatForever(cc.sequence(cc.MoveBy.create(0.5, cc.p(0, 10)), cc.MoveBy.create(0.5, cc.p(0, -10))));
        this.previousMapButton.stopAllActions();
        this.previousMapButton.runAction(action)
    },

    initEffectOnCurMapItem: function(){
        var action = cc.repeatForever(cc.sequence(cc.scaleTo(0.5,1.1, 1.1 ), cc.scaleTo(0.5, 1,1)));
        var curLevel = GameDataMgr.getInstance().currentLevel;
        if(this.currentMap == Math.floor(curLevel / NUM_LEVEL_ONE_MAP)+1) {
            cc.log("current map "+ curLevel);
            this.itemList[(curLevel -1) % NUM_LEVEL_ONE_MAP].button.runAction(action);
        }
    },

    stopEffectOnMapItems: function(){
        var size = this.itemList.length;
        for (var i = 0; i < size; i ++){
            this.itemList[i].button.stopAllActions();
        }
    },

    showEffectOnMapItem: function(){
        this.stopEffectOnMapItems();
        this.initEffectOnCurMapItem();
    },

    updateData: function(){
        this.loadCurrentMap();
    },

    onClickNextMapButton: function(sender, event){
        Utility.setScaleWhenTouchButton(sender, event);
        if(event == ccui.Widget.TOUCH_ENDED){
            SoundManager.playClickSound();
            this.switchNextMap();
        }
    },
    switchNextMap: function(){
        if(this.currentMap < NUM_GROUP) {
            this.currentMap ++;
            this.changeBackground();
            this.loadCurrentMap();
        }
        this.showButton();
        this.showEffectOnMapItem();
    },

    onClickPreviousMapButton: function(sender, event){
        Utility.setScaleWhenTouchButton(sender, event);
        if(event == ccui.Widget.TOUCH_ENDED){
            SoundManager.playClickSound();
            this.switchPreviousMap();
        }
    },

    switchPreviousMap: function(){
        if(this.currentMap > 1) {
            this.currentMap --;
            this.changeBackground();
            this.loadCurrentMap();
        }

        this.showButton();
        this.showEffectOnMapItem();
    },

    onDragBgImage: function(sender, event){

    },

    changeBackground: function(){
        var str = "bg_"+ this.currentMap+".png";
        this.bgImage.setSpriteFrame(str);
    },

    loadCurrentMap: function(){
        var itemData = GameDataMgr.instance.getMapItemDataList();

        for (var i = 0; i < NUM_LEVEL_ONE_MAP; i++){
            var dataIdx = (this.currentMap - 1) * NUM_LEVEL_ONE_MAP + i;
            this.itemList[i].setData(itemData[dataIdx]);
        }
    },

    setNextButtonVisible: function(visible){
        this.nextMapButton.setVisible(visible);
    },

    setPreviousButtonVisible: function(visible){
        this.previousMapButton.setVisible(visible);
    },

    onBackPress: function(){
        ScreenMgr.getInstance().changeScreen(MENU_SCREEN);
    }


});

MapLayer.instance = null;

MapLayer.getInstance = function(){
    if(MapLayer.instance == null){
        MapLayer.instance = new MapLayer();
        MapLayer.instance.retain();
    }

    return MapLayer.instance;
};

var MapScene = cc.Scene.extend({
    layer: null,

    ctor: function()
    {
        this._super();
        this.layer = MapLayer.getInstance();
        this.addChild(this.layer);
    },

    onEnter: function(){
        this._super();
        this.layer.showEffectOnMapItem();
        this.layer.initEffectOnButton();
    },

    updateData: function(){
        this.layer.updateData();
    }

});

MapScene.instance = null;
MapScene.getInstance = function()
{
    if(MapScene.instance == null)
    {
        MapScene.instance = new MapScene();
        MapScene.instance.retain();
    }
    return MapScene.instance;
}

