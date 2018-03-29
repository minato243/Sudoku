var res = {
    MainScene_json : "res/MainScene.json",
    PlayScene_json : "res/PlayScene.json",
    LoadingScene_json: "res/LoadingScene.json",
    MapScene_json: "res/MapScene.json",
    GameOverDialog: "res/GameOverDialog.json",
    SelectedDialog: "res/MapInfoDialog.json",
    MessageDialog: "res/MessageDialog.json",
    playSceneImage: {type: "image", src: "res/playScene.png"},
    playScenePlist: {type: "plist", src: "res/playScene.plist"},
    mapSceneImage: {type: "image", src: "res/mapScene.png"},
    mapScenePlist: {type: "plist", src: "res/mapScene.plist"},

    clickSound: "res/sound/click.mp3",
    rightSound: "res/sound/right.wav",
    wrongSound: "res/sound/wrong.mp3",
    wonSound: "res/sound/won.mp3",
    lostSound: "res/sound/lost.mp3",
    bgMusic: "res/sound/bg_music.mp3",

    FONT_TW_CONDENSED_32:"res/TW_CONDENSED_32.fnt",
    FONT_TW_CONDENSED_40:"res/TW_CONDENSED_40.fnt"

};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
};
