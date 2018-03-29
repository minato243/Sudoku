/**
 * Created by thaod on 5/2/2017.
 */


var LoadingScreenLayer = cc.Layer.extend({
    progressBar: null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        var loadingScreen = ccs.load(res.LoadingScene_json);
        this.addChild(loadingScreen.node);

        this.progressBar = loadingScreen.node.getChildByName("bgImage").getChildByName("bg_bar").getChildByName("progress_bar");
        //this.progressBar.setPercent(100);
        return true;
    },

    updateProgressBar: function(progress){
        this.progressBar.setPercent(progress);
    }

});


var LoadingScreen = cc.Scene.extend({
    progress: 0,
    loadingLayer: null,
    ctor: function(){
        this._super();
        this.progress = 0;
        this.loadingLayer = null;
    },

    onEnter:function () {
        this._super();
        this.loadingLayer = new LoadingScreenLayer();
        this.addChild(this.loadingLayer);
        this.schedule(this.updateProgressBar,0.0625);
    },

    updateProgressBar: function(delta){
        this.progress += delta *50;
        cc.log("updateProgressBar "+this.progress.toString());
        if(this.progress >100){
            this.unschedule(this.updateProgressBar);
            ScreenMgr.getInstance().changeScreen(MENU_SCREEN);
            return;
        }

        this.loadingLayer.updateProgressBar(this.progress);
    }
});
