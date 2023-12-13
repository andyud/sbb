//AudioMgr.ts
import { Node, AudioSource, AudioClip, resources, director } from 'cc';
/**
 * @en
 * this is a sington class for audio play, can be easily called from anywhere in you project.
 * @zh
 * 这是一个用于播放音频的单件类，可以很方便地在项目的任何地方调用。
 */ 
export class AudioMgr {
    private static _inst: AudioMgr;
    public static get inst(): AudioMgr {
        if (this._inst == null) {
            this._inst = new AudioMgr();
        }
        return this._inst;
    }
    //--main bgm
    bgm:AudioSource = null;
    bgmNode:Node = null;

    //--spin
    bgmSpin:AudioSource = null;
    bgmSpinNode:Node = null;

    //--tension
    bgmTension:AudioSource = null;
    bgmTensionNode:Node = null;

    //--coin
    bgmCoin:AudioSource = null;
    bgmCoinNode:Node = null;

    //--freeSpin
    bgmFreeSpin:AudioSource = null;
    bgmFreeSpinNode:Node = null;
    
    //--bonus
    bgmBonus:AudioSource = null;
    bgmBonusNode:Node = null;

    public soundIdx: number = -1;
    public isPause:boolean = false;
    constructor() {
        //@en create a node as audioMgr
        //@zh 创建一个节点作为 audioMgr
        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        //@en add to the scene.
        //@zh 添加节点到场景
        director.getScene().addChild(audioMgr);

        //@en make it as a persistent node, so it won't be destroied when scene change.
        //@zh 标记为常驻节点，这样场景切换的时候就不会被销毁了
        director.addPersistRootNode(audioMgr);

        //@en add AudioSource componrnt to play audios.
        //@zh 添加 AudioSource 组件，用于播放音频。
        

        //--main
        this.bgmNode = new Node();
        this.bgm = this.bgmNode.addComponent(AudioSource);
        audioMgr.addChild(this.bgmNode);

        //--spin
        this.bgmSpinNode = new Node();
        this.bgmSpin = this.bgmSpinNode.addComponent(AudioSource);
        audioMgr.addChild(this.bgmSpinNode);
  
        //--tension
        this.bgmTensionNode = new Node();
        this.bgmTension = this.bgmTensionNode.addComponent(AudioSource);
        audioMgr.addChild(this.bgmTensionNode);

        //--coin
        this.bgmCoinNode = new Node();
        this.bgmCoin = this.bgmCoinNode.addComponent(AudioSource);
        audioMgr.addChild(this.bgmCoinNode);

        //--freeSpin
        this.bgmFreeSpinNode = new Node();
        this.bgmFreeSpin = this.bgmFreeSpinNode.addComponent(AudioSource);
        audioMgr.addChild(this.bgmFreeSpinNode);
    
        //--bonus
        this.bgmBonusNode = new Node();
        this.bgmBonus = this.bgmBonusNode.addComponent(AudioSource);
        audioMgr.addChild(this.bgmBonusNode);
    }

    public get audioSource() {
        return this.bgm;
    }

    public setAudioSouce(src:string,sound: AudioClip){
        switch(src){
            case 'main':
                this.bgm.clip = sound;
                this.bgm.loop = true;
                break;
            case 'spin':
                this.bgmSpin.clip = sound;
                this.bgmSpin.loop = true;
                break;
            case 'freespin':
                this.bgmFreeSpin.clip = sound;
                this.bgmFreeSpin.loop = true;
                break;
            case 'bonus':
                this.bgmBonus.clip = sound;
                this.bgmBonus.loop = true;
                break;
            case 'tension':
                this.bgmTension.clip = sound;
                this.bgmTension.loop = true;
                break;
            case 'coin':
                this.bgmCoin.clip = sound;
                this.bgmCoin.loop = true;
                break;
        }
    }
    
    /**
     * @en
     * play short audio, such as strikes,explosions
     * @zh
     * 播放短音频,比如 打击音效，爆炸音效等
     * @param sound clip or url for the audio
     * @param volume 
     */
    playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this.bgm.playOneShot(sound, volume);
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this.bgm.playOneShot(clip, volume);
                }
            });
        }
    }

    /**
     * @en
     * play long audio, such as the bg music
     * @zh
     * 播放长音频，比如 背景音乐
     * @param sound clip or url for the sound
     * @param volume 
     */
    play(sound: AudioClip | string, soundIdx:number, volume: number = 1.0) {
        if(this.soundIdx == soundIdx){
            if(this.isPause){
                this.bgm.play();
            }
            return;
        } 
        this.bgm.stop();
        this.soundIdx = soundIdx;
        if (sound instanceof AudioClip) {
            this.bgm.clip = sound;
            this.bgm.loop = true;
            this.bgm.play();
            this.bgm.volume = volume;
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this.bgm.clip = clip;
                    this.bgm.play();
                    this.bgm.volume = volume;
                }
            });
        }
    }

    /**
     * stop the audio play
     */
    stop() {
        this.bgm.stop();
        this.bgmBonus.stop();
        this.bgmFreeSpin.stop();
        this.bgmSpin.stop();
        this.bgmCoin.stop();
        this.bgmTension.stop();
    }

    /**
     * pause the audio play
     */
    pause() {
        this.isPause = true;
        this.bgm.pause();
    }

    /**
     * resume the audio play
     */
    resume(){
        this.bgm.play();
    }

    setVolumn(val:number){
        this.bgm.volume = val;
        this.bgmBonus.volume = val;
        this.bgmCoin.volume = val;
        this.bgmFreeSpin.volume = val;
        this.bgmTension.volume = val;
        this.bgmSpin.volume = val;
    }

    playSpin(){
        if(this.bgmSpin.playing){
            this.bgmSpin.volume = 1;
        } else {
            this.bgmSpin.play();
        }
    }
    pauseSpin(){
        this.bgmSpin.pause();
    }
    playTension(){
        this.bgmTension.play();
    }
    pauseTension(){
        this.bgmTension.pause();
    }
    playBonus(){
        this.bgmBonus.play();
    }
    pauseBonus(){
        this.bgmBonus.pause();
    }
    playFreeSpin(){
        if(this.bgmFreeSpin.playing){
            this.bgmFreeSpin.volume = 1;
        } else {
            this.bgmFreeSpin.play();
        }
    }
    pauseFreeSpin(){
        this.bgmFreeSpin.pause();
    }
    playCoin(){
        this.bgmCoin.play();
    }
    pauseCoin(){
        this.bgmCoin.pause();
    }
    pauseAllBgm(){
        this.bgmBonus.pause();
        this.bgmFreeSpin.pause();
        this.bgmSpin.pause();
        this.bgmCoin.pause();
        this.bgmTension.pause();
    }
}