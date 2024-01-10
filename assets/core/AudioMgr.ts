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
    public isSoundOn:boolean = true;
    setSoundOn(){
        this.isSoundOn = !this.isSoundOn;
        if(this.isSoundOn){
            if(this.bgm && this.bgm.clip!=null){
                this.playBgm();
            }
            console.log('sound on');
        } else {
            console.log('sound off');
            this.pauseAllBgm();
        }
    }
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
      play short sound
     */
    playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        if(!this.isSoundOn) return;
        if (sound instanceof AudioClip) {
            this.bgm.playOneShot(sound, volume);
        }
    }

    /**
     play bg sound
     */
    // play(sound: AudioClip | string, soundIdx:number, volume: number = 1.0) {
    //     if(this.soundIdx == soundIdx){
    //         if(this.isPause){
    //             this.bgm.play();
    //         }
    //         return;
    //     } 
    //     this.bgm.stop();
    //     this.soundIdx = soundIdx;
    //     if (sound instanceof AudioClip) {
    //         this.bgm.clip = sound;
    //         this.bgm.loop = true;
    //         this.bgm.play();
    //         this.bgm.volume = volume;
    //     }
    // }
    playBgm(){
        if(!this.isSoundOn) return;
        if(this.bgm.clip==null) return;
        if(this.bgm.playing){
            this.bgm.volume = 1;
        } else {
            this.bgm.play();
        }
    }


    /**
     * stop the audio play
     */
    stop() {
        if(this.bgm!=null && this.bgm.clip!=null){
            this.bgm.stop();
            this.bgm.clip = null;
        }
        if(this.bgmBonus!=null && this.bgmBonus.clip!=null){
            this.bgmBonus.stop();
            this.bgmBonus.clip = null;
        }
        if(this.bgmFreeSpin && this.bgmFreeSpin.clip!=null){
            this.bgmFreeSpin.stop();
            this.bgmFreeSpin.clip = null;
        }
        if(this.bgmSpin && this.bgmSpin.clip!=null){
            this.bgmSpin.stop();
            this.bgmSpin.clip=null;
        }
        if(this.bgmCoin && this.bgmCoin.clip!=null){
            this.bgmCoin.stop();
            this.bgmCoin.clip = null;
        }
        if(this.bgmTension && this.bgmTension.clip!=null){
            this.bgmTension.stop();
            this.bgmTension.clip = null;
        }
    }

    /**
     * pause the audio play
     */
    pause() {
        this.isSoundOn = false;
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
        if(!this.isSoundOn) return;
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
        if(!this.isSoundOn) return;
        this.bgmTension.play();
    }
    pauseTension(){
        this.bgmTension.pause();
    }
    playBonus(){
        if(!this.isSoundOn) return;
        this.bgmBonus.play();
    }
    pauseBonus(){
        this.bgmBonus.pause();
    }
    playFreeSpin(){
        if(!this.isSoundOn) return;
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
        if(!this.isSoundOn) return;
        this.bgmCoin.play();
    }
    pauseCoin(){
        this.bgmCoin.pause();
    }
    pauseAllBgm(){
        this.bgm.pause();
        this.bgmBonus.pause();
        this.bgmFreeSpin.pause();
        this.bgmSpin.pause();
        this.bgmCoin.pause();
        this.bgmTension.pause();
    }
}