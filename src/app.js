
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        var mainScreen = ccs.load(res.MainScene_json);
        this.addChild(mainScreen.node);

        var playButton = mainScreen.node.getChildByName("btn_play");
        playButton.addTouchEventListener(this.startGame, this); 

        return true;
    },


    startGame: function(pSender){
        cc.log("start game");
        //cc.director.pushScene(new GameScene());   
    }
});


var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});