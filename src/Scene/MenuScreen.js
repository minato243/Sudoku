var MenuScreenLayer = cc.Layer.extend({
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

        this.bgImage = mainScreen.node.getChildByName("bgImage");
        var playButton = this.bgImage.getChildByName("btn_play");
        playButton.addTouchEventListener(this.startGame, this);

        this.volumeButton = this.bgImage.getChildByName("btn_volume");
        this.volumeButton.addTouchEventListener(this.onClickVolumeButton, this);

        this.shareButton = this.bgImage.getChildByName("btn_share");
        this.shareButton.addTouchEventListener(this.onClickShareButton, this);
        this.shareButton.setVisible(true);

        this.highScoreButton = this.bgImage.getChildByName("btn_high_score");
        this.highScoreButton.addTouchEventListener(this.onClickHighScoreButton, this);

        this.achievementButton = this.bgImage.getChildByName("btn_achievement");
        this.achievementButton.addTouchEventListener(this.onClickAchievementButton, this);
        this.achievementButton.setVisible(false);

        this.settingButton = this.bgImage.getChildByName("btn_setting");
        this.settingButton.addTouchEventListener(this.onClickSettingButton, this);
        this.settingButton.setVisible(false);

        var keyboardListener = cc.EventListener.create({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                cc.log("keyCode = "+keyCode);
                if(keyCode == cc.KEY.backspace || keyCode == cc.KEY.back){
                    MenuScreenLayer.getInstance().onBackPress();
                }else if(keyCode == cc.KEY.home){
                    //do something
                }
            }
        });
        cc.eventManager.addListener(keyboardListener, this.bgImage);

        //this.initAdmob();
        return true;
    },

    initAdmob: function(){
        sdkbox.PluginAdMob.init();
        sdkbox.PluginAdMob.setListener({
            adViewDidReceiveAd : function(name) {
                cc.log("*** adViewDidReceiveAd "+ name);
                if(name == ADMOB_BANNER) sdkbox.PluginAdMob.show(name);
            },
            adViewDidFailToReceiveAdWithError : function(name, msg) {
                cc.error("*** " +msg+"Ads = "+ name);
            },
            adViewWillPresentScreen : function(name) {
                cc.log("AdMob adViewWillPresentScreen " + name);
            },
            adViewDidDismissScreen : function(name) {
                cc.log("AdMob adViewDidDismissScreen " + name);
                GameDataMgr.getInstance().gold += 10;
                if(PlayScene.getInstance().isRunning()){
                    PlayScene.getInstance().layer.updateCoin();
                }
            },
            adViewWillDismissScreen : function(name) {
                cc.log("AdMob adViewWillDismissScreen " + name);
            },
            adViewWillLeaveApplication : function(name) {
                cc.log("AdMob adViewWillLeaveApplication " + name);
            }
        });
        sdkbox.PluginAdMob.cache(ADMOB_BANNER);
        sdkbox.PluginAdMob.cache(ADMOB_INTERSTITIAL);
        sdkbox.PluginAdMob.cache(ADMOB_VIDEO_REWARD);
    },

    startGame: function(pSender, controlEvent){
        if(controlEvent == ccui.Widget.TOUCH_ENDED){
            SoundManager.playClickSound();
            ScreenMgr.getInstance().changeScreen(MAP_SCREEN);
        }
    },

    onClickVolumeButton: function(pSender, controlEvent){
        if(controlEvent == ccui.Widget.TOUCH_ENDED){
            cc.log("onClickVolumeButton");
            var soundMgr = SoundManager.getInstance();
            if(soundMgr.status == SOUND_ON) soundMgr.setMusicOff();
            else soundMgr.setMusicOn();
            SoundManager.playClickSound();

            this.updateButtonVolume();
        }
        
    },

    onClickShareButton: function(pSender, controlEvent){
        if(controlEvent == ccui.Widget.TOUCH_ENDED){
            //todo
            SoundManager.playClickSound();
            cc.warn("onClickShareButton");
            PlatformUtils.getInstance().shareMyApp();
        }
    },

    onClickHighScoreButton: function(pSender, controlEvent){
        if(controlEvent == ccui.Widget.TOUCH_ENDED){
            //todo
            SoundManager.playClickSound();
            PlatformUtils.getInstance().showHighScore();
            cc.error("onClickHighScoreButton");
        }
    },
    onClickSettingButton: function(pSender, controlEvent){
        if(controlEvent == ccui.Widget.TOUCH_ENDED){
            //todo
            SoundManager.playClickSound();
            cc.log("onClickSettingButton");
        }
    },
    onClickAchievementButton: function(pSender, controlEvent){
        if(controlEvent == ccui.Widget.TOUCH_ENDED){
            //todo
            SoundManager.playClickSound();
            cc.log("onClickAchievementButton");
        }
    },

    updateButtonVolume: function(){
        if(SoundManager.getInstance().status == SOUND_OFF){
            cc.log("SOUND_OFF");
            this.volumeButton.loadTextureNormal("btn_volume_off_2.png", ccui.Widget.PLIST_TEXTURE);
            this.volumeButton.loadTexturePressed("btn_volume_on_2.png", ccui.Widget.PLIST_TEXTURE);
        } else {
            cc.log("SOUND_ON");
            this.volumeButton.loadTextureNormal("btn_volume_off.png", ccui.Widget.PLIST_TEXTURE);
            this.volumeButton.loadTexturePressed("btn_volume_on.png", ccui.Widget.PLIST_TEXTURE);
        }
    },

    onBackPress: function(){
        this.acceptCallBack = cc.callFunc(this.doBackPress, this);
        var dialog = MessageDialog.getInstance();
        dialog.startDialog(this.acceptCallBack, null, "Exit Game", "Are you sure want to exit game?");
        dialog.setAcceptLabel("Exit");
        dialog.setCancelLabel("Cancel");
    },

    doBackPress: function(){
        cc.director.end();
    }

});

MenuScreenLayer.instance = null;
MenuScreenLayer.getInstance = function(){
    if(MenuScreenLayer.instance == null){
        MenuScreenLayer.instance = new MenuScreenLayer();
        MenuScreenLayer.instance.retain();
    }

    return MenuScreenLayer.instance;
};

var MenuScreen = cc.Scene.extend({
    layer: null,

    onEnter:function () {
        this._super();
        this.layer = MenuScreenLayer.getInstance();
        if(this.layer.getParent() == null )this.addChild(this.layer);
        PlatformUtils.getInstance().signInGoogle();
    }
});
