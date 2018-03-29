/***  Created by thaod on 5/1/2017.*/

var GameOverDialog = BasePopupDialog.extend({
    starList: [],
    titleLabel: null,
    newGameLabel: null,

    timeLabel: null,
    errorLabel: null,
    scoreLabel: null,
    goldLabel: null,

    menuButton: null,
    newGameButton: null,

    isVictory: false,
    error: 0,
    time: 0,
    level:1,

    timeScore: 0,
    errorScore:0,
    totalScore: 0,
    numStar:0,

    curPercent:0,

   ctor: function(){
       this._super();
       var layer = ccs.load(res.GameOverDialog);
       this.addChild(layer.node);
       var bgImage = layer.node.getChildByName("bgImage");
       var bgDialog = bgImage.getChildByName("bgDialog");
       var bgTitle = bgDialog.getChildByName("bg_game_over_title");

       this.titleLabel = bgTitle.getChildByName("lb_title");

       this.timeLabel = bgDialog.getChildByName("lb_time");
       this.errorLabel = bgDialog.getChildByName("lb_error");
       this.scoreLabel = bgDialog.getChildByName("lb_total_score");
       this.goldLabel = bgDialog.getChildByName("lb_coin_bonus");

       this.starList = [];
       for (var i = 0; i < 3; i ++){
           var starImg = bgTitle.getChildByName("img_star_"+(i+1));
           this.starList.push(starImg);
       }

       this.menuButton = bgDialog.getChildByName("btn_menu");
       this.menuButton.addTouchEventListener(this.onMenuClick, this);
       this.newGameButton = bgDialog.getChildByName("btn_new_game");
       this.newGameButton.addTouchEventListener(this.onNewGameClick, this);

       this.newGameLabel = this.newGameButton.getChildByName("lb_new_game");
   },

    initData: function() {
        if (this.isVictory) this.initVictoryData();
        else this.initLoseData();
    },

    initVictoryData: function(){
        this.titleLabel.setString("You Win");
        this.newGameLabel.setString("Next Level");

        this.timeScore = GameDataMgr.convertFromTimeToScore(this.time) + GameDataMgr.getCompleteScore(this.level);
        this.errorScore = GameDataMgr.convertFromErrorToScore(this.error);
        this.totalScore = GameDataMgr.getScore(this.level, this.time, this.error);
        this.setStringForScoreLabel(this.timeScore, this.errorScore);

        this.numStar = GameDataMgr.convertFromScoreToStar(this.totalScore, this.level);
        this.showStar(this.numStar);
    },

    initLoseData: function(){
        this.titleLabel.setString("Game Over");
        this.newGameLabel.setString("Restart");

        this.timeLabel.setString(Utility.timeToString(this.time));
        this.errorLabel.setString(this.error.toString());
        this.scoreLabel.setString("0");
        this.goldLabel.setString("0");

        this.showStar(0);
    },

    showStar: function(numStar) {
        for (var i = 0; i < numStar; i ++){
            this.starList[i].setVisible(true);
        }

        for (i = 0; i < 3; i ++){
            this.starList[i].setVisible(false);
        }

        if(numStar >0) this.showStarEffect();
    },

    showStarEffect: function(){
        this.starList[0].setVisible(true);
        var action = cc.sequence(cc.scaleTo(0, 0.2,0.2), cc.scaleTo(0.5 , 1.1, 1.1), cc.scaleTo(0.25, 1, 1), cc.callFunc(this.showEffectOnSecondStar, this));
        this.starList[0].runAction(action);
    },

    showEffectOnSecondStar: function(){
        cc.log("showEffectOnSecondStar");
        if(this.numStar >1){
            this.starList[1].setVisible(true);
            var action = cc.sequence(cc.scaleTo(0, 0.2,0.2), cc.scaleTo(0.5 , 1.1, 1.1), cc.scaleTo(0.25, 1, 1), cc.callFunc(this.showEffectOnThirdStar, this));
            this.starList[1].runAction(action);
        }
    },

    showEffectOnThirdStar: function(){
        cc.log("showEffectOnThirdStar");
        if(this.numStar >2){
            this.starList[2].setVisible(true);
            var action = cc.sequence(cc.scaleTo(0, 0.2,0.2), cc.scaleTo(0.5 , 1.1, 1.1), cc.scaleTo(0.25, 1, 1));
            this.starList[2].runAction(action);
        }
    },

    onEnter: function(){
        this._super();

        if(this.isVictory) this.schedule(this.updateScore, GameOverDialog.INTERVAL);
        this.curPercent = 0;
    },

    updateScore: function(delta){
        this.curPercent += GameOverDialog.INTERVAL;

        var curTimeScore = Math.floor(this.timeScore * this.curPercent / GameOverDialog.EFFECT_TIME);
        var curErrorScore = Math.floor(this.errorScore * this.curPercent / GameOverDialog.EFFECT_TIME);

        if(this.curPercent >= GameOverDialog.EFFECT_TIME){
            this.unschedule(this.updateScore);
            curTimeScore = this.timeScore;
            curErrorScore = this.errorScore;
        }
        this.setStringForScoreLabel(curTimeScore, curErrorScore);

    },

    setStringForScoreLabel: function(timeScore, errorScore){
        this.timeLabel.setString(timeScore.toString());
        if(errorScore > 0) this.errorLabel.setString("-"+errorScore.toString());
        else this.errorLabel.setString("0");

        var totalScore = timeScore - errorScore;
        var goldEarn = GameDataMgr.convertFromScoreToGold(totalScore);

        this.scoreLabel.setString(totalScore.toString());
        if(goldEarn > 0)this.goldLabel.setString("+"+goldEarn.toString());
        else this.goldLabel.setString("0");
    },


    onExit: function(){
        this._super();
    },

    //closeDialog: function(){
    //    cc.log("closeDialog");
    //    var action = cc.Sequence(cc.ScaleTo(0.2, 1.2), cc.ScaleTo(0.3, 0.5), cc.CallFunc(this._removeFromParent, this));
    //    this.runAction(action);
    //},
    //
    //_removeFromParent: function(){
    //    this.stopAllActions();
    //    ScreenMgr.getInstance().currentScreen.removeChild(this);
    //},

    onMenuClick: function(sender, controlEvent){
        Utility.setScaleWhenTouchButton(sender, controlEvent);
        SoundManager.playClickSound();
        if(controlEvent == ccui.Widget.TOUCH_ENDED){
            this.closeDialog();
            this.backToMenu();
        }

    },

    onNewGameClick: function(sender, controlEvent){
        Utility.setScaleWhenTouchButton(sender, controlEvent);
        SoundManager.playClickSound();
        if(controlEvent == ccui.Widget.TOUCH_ENDED){
            this.closeDialog();
            this.startNewGame();
        }
    },

    startNewGame: function(){
        var playScreen = ScreenMgr.getInstance().currentScreen;
        if(this.isVictory) playScreen.nextLevel();
        else playScreen.restart();
    },

    backToMenu: function(){
        ScreenMgr.getInstance().changeScreen(MAP_SCREEN);
    }


});

GameOverDialog.EFFECT_TIME = 3;
GameOverDialog.INTERVAL = 0.0625;

GameOverDialog.dialogInstance = null;
GameOverDialog.getInstance = function(){
    if(GameOverDialog.dialogInstance == null){
        GameOverDialog.dialogInstance = new GameOverDialog();
        GameOverDialog.dialogInstance.retain();
    }
    return GameOverDialog.dialogInstance;
};


GameOverDialog.startDialog = function(win, time, numError, level){
    var dialog = GameOverDialog.getInstance();
    if(arguments.length == 4){
        dialog.time = time;
        dialog.error = numError;
        dialog.level = level;
    }

    dialog.isVictory = win;
    dialog.initData();
    if(dialog.getParent() != null) return;

    ScreenMgr.getInstance().currentScreen.addChild(dialog, LAYER_DIALOG);
};
