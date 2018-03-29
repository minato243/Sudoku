/**
 * Created by thaod on 12/3/2017.
 */

var MapItem = cc.Class.extend({
    TAG:"MapItem ",
    button: null,
    lockSprite: null,
    starList:[],
    levelLabel: null,
    data: null,
    lockSize: null,
    openSize: null,

    ctor: function(){
      this._super();
    },

    ctor: function(item, data){
        this.button = item;
        this.data = data;

        this.button.setScale9Enabled(false);
        this.lockSprite = this.button.getChildByName("img_log");
        this.starList = [];
        for (var i = 0; i < 3; i ++){
            var starSprite = this.button.getChildByName("ic_star_"+ (i+1).toString());
            this.starList.push(starSprite);
        }
        this.levelLabel = this.button.getChildByName("lb_level");

        this.button.addTouchEventListener(this.onButtonClick, this);

        this.lockSize = cc.Sprite.create("#ic_log_item.png").getContentSize();
        this.openSize = cc.Sprite.create("#ic_ready.png").getContentSize();
        //Utility.getInstance().setScaleWhenTouch(this.button);
    },

    initData: function(){
        this.levelLabel.setString(this.data.level.toString());
        this.lockSprite.setVisible(this.data.status == LOCK);
        var backgroundSprite = this.getBackgroundSpriteNameFromData(this.data.status, this.data.numStar);
        var pressBackgroundSprite = this.getBackgroundSpriteNameFromData(this.data.status, this.data.numStar);
        this.button.loadTextureNormal(backgroundSprite, ccui.Widget.PLIST_TEXTURE);
        this.button.loadTexturePressed(pressBackgroundSprite, ccui.Widget.PLIST_TEXTURE);

        this.setPosition();
        this.showNumStar();
    },

    createBackgroundSpriteFromData: function(){
        if(this.data.status == LOCK){
            return cc.Sprite.create("#ic_log_item.png");
        } else {
            if(this.data.numStar == 0) return cc.Sprite.create("#ic_ready.png");
            else return cc.Sprite.create("#ic_finished_item.png");
        }
    },

    getBackgroundSpriteNameFromData: function(status, numStar){
        if(status == LOCK){
            return "ic_log_item.png";
        } else {
            if(numStar == 0) return "ic_ready.png";
            else return "ic_finished_item.png";
        }
    },

    showNumStar: function(){
        for (var i = 0; i < this.data.numStar; i ++){
            this.starList[i].setVisible(true);
        }

        for (i = this.data.numStar; i < 3; i ++){
            this.starList[i].setVisible(false);
        }
    },

    onButtonClick: function(sender, controlEvent){
        Utility.setScaleWhenTouchButton(sender, controlEvent);

        if(controlEvent == ccui.Widget.TOUCH_ENDED){
            if(this.data.status == UN_LOCK) this.startGame();
            else this.showLockNotify();
        }
    },

    setPosition: function(){
        var size = this.lockSize;
        if(this.data.status == UN_LOCK){
            size = this.openSize;
        }

        this.button.setSize(size);
        this.levelLabel.setPosition(cc.p(size.width/2, size.height *6/10));
        this.lockSprite.setPosition(cc.p(size.width/2, 5));
    },

    startGame: function(){
        var level = GameDataMgr.getCache(KEY_CURRENT_LEVEL, 0);
        if (this.data.level == level) this.showPlayingDialog();
        else this.doStartNewGame();
    },

    doStartNewGame: function(){
        ScreenMgr.getInstance().changeScreen(PLAY_SCREEN);
        var playScreen = ScreenMgr.getInstance().currentScreen;
        playScreen.startNewGame(this.data.level);
    },

    doLoadCurrentGame: function(){
        cc.log("MapItem.doLoadCurrentGame");
        ScreenMgr.getInstance().changeScreen(PLAY_SCREEN);
        var playScreen = ScreenMgr.getInstance().currentScreen;
        playScreen.loadCurrentGame(this.data.level);
    },


    showLockNotify: function(){
        //todo
    },

    showPlayingDialog: function(){
        var acceptCallBack = cc.callFunc(this.doLoadCurrentGame, this);
        var closeCallBack = cc.callFunc(this.doStartNewGame, this);
        var dialog = MessageDialog.getInstance();
        dialog.startDialog(acceptCallBack, closeCallBack, "Notify", "Do you want to load last map you have played?" );
        dialog.setAcceptLabel("Resume");
        dialog.setCancelLabel("New Game");
    },

    setData: function(data)
    {
        this.data = data;
        this.initData();
    }


});