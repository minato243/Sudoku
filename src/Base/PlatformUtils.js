/** Created by thaod on 1/8/2018.*/

var PlatformUtils = cc.Class.extend({

    signInGoogle: function(){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT, "signIn","()V");
    },

    shareMyApp: function(){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT,"shareMyApp","()V");
    },

    rateApp: function(){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT,"rateMyApp","()V");
    },

    showHighScore: function(){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT, "showRanking","()V");
    },

    updateScore: function(score){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT, "updateHighScore", "(I)V", score);
    },

    showInterstitialAd: function(){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT, "showInterstitialAd", "()V")
    },

    showVideoRewardAd: function(){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT, "showVideoRewardAd", "()V");
    },

    initBanner: function(){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT, "initBanner", "()V");
    },

    showBanner: function(){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT, "showBanner", "()V");
    },

    hideBanner: function(){
        this.callAndroidFunction(PlatformUtils.CLASS_DEFAULT, "hideBanner", "()V");
    },

    callAndroidFunction: function(className, methodName, methodSignature, parameters){
        if(sys.platform ==  sys.WIN32) return;
        var returnValue;
        if(parameters == undefined) returnValue = jsb.reflection.callStaticMethod(className, methodName,methodSignature);
        else returnValue = jsb.reflection.callStaticMethod(className, methodName,methodSignature, parameters);
        cc.log("PlatformUtils.callAndroidFunction "+ returnValue);
    },

    javaCallBackAddGold: function(num){
        GameDataMgr.getInstance().addGold(num);
        var playScene = PlayScene.getInstance();
        if(playScene != null && playScene.isRunning()) {
            playScene.layer.updateCoin();
            playScene.layer.showAddGoldEffect(num);
        }
    }

});

PlatformUtils.instance = null;

PlatformUtils.getInstance = function(){
    if(PlatformUtils.instance == null){
        PlatformUtils.instance = new PlatformUtils();
    }

    return PlatformUtils.instance;
};

PlatformUtils.destroyInstance = function(){
    if(PlatformUtils.instance!= null){
        PlatformUtils.instance.release();
    }
};

PlatformUtils.CLASS_DEFAULT = "com.biggame.sudoku.AndroidUtils";
