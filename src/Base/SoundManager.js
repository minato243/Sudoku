var SoundManager = cc.Class.extend({
    volume:1,
    status: SOUND_ON,

    playSound: function(soundPath){
        if(this.status == SOUND_OFF) return 0;
        var tag = cc.audioEngine.playEffect(soundPath, false);
        return tag;
    },

    stopSound: function(tag){
        cc.audioEngine.stopEffect(tag);
    },

    stopAllSound: function(){
        cc.audioEngine.stopAllEffects();
    },

    playMusic: function(musicPath){
        if(this.status == SOUND_OFF) return;
        cc.audioEngine.playMusic(musicPath);
    },

    stopMusic: function(){
        cc.audioEngine.stopMusic();
    },

    setMusicOn: function(){
        this.status = SOUND_ON;
        //SoundManager.playBackgroundMusic();
    },

    setMusicOff: function(){
        this.status = SOUND_OFF;
        this.stopMusic();
    }
});

SoundManager.instance = null;

SoundManager.getInstance = function(){
    if(SoundManager.instance == null){
        SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
};

SoundManager.playRightSound = function(){
    SoundManager.getInstance().playSound(res.rightSound);
};

SoundManager.playWrongSound = function(){
    SoundManager.getInstance().playSound(res.wrongSound);
};

SoundManager.playClickSound = function(){
    SoundManager.getInstance().playSound(res.clickSound);
};

SoundManager.playWonSound = function(){
    SoundManager.getInstance().playSound(res.wonSound);
};

SoundManager.playLostSound = function(){
    SoundManager.getInstance().playSound(res.lostSound);
};

SoundManager.playBackgroundMusic = function(){
    SoundManager.getInstance().playMusic(res.bgMusic);
};

SoundManager.pauseMusic = function(){
    cc.audioEngine.pauseMusic();
};

SoundManager.resumeMusic = function(){
    cc.audioEngine.resumeMusic();
};