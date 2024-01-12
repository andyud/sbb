import { _decorator, AudioClip, Component, Node, Button, Animation } from 'cc';
import { AudioMgr } from '../../../core/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('FruitPause')
export class FruitPause extends Component {
    @property({ type: Node })
    bg: Node | null = null;
    @property({ type: Node })
    pp: Node | null = null;
    @property({ type: Node })
    btnClose: Node | null = null;
    @property({ type: Node })
    btnQuit: Node | null = null;
    @property({ type: Node })
    btnRestart: Node | null = null;
    @property({ type: Node })
    btnSound: Node | null = null;
    @property({ type: Node })
    soundOn: Node | null = null;
    @property({ type: Node })
    soundOff: Node | null = null;
    @property({ type: Node })
    btnMusic: Node | null = null;
    @property({ type: Node })
    musicOn: Node | null = null;
    @property({ type: Node })
    musicOff: Node | null = null;
    
    audioClip: AudioClip = null;
    callback: (cmd:number) => void;
    start() {
        this.node.active = false;
        this.bg.active = false;
        this.pp.setPosition(0, -1400);
        this.btnRestart.on(Button.EventType.CLICK, this.onClick, this);
        this.btnClose.on(Button.EventType.CLICK, this.onClick, this);
        this.btnQuit.on(Button.EventType.CLICK, this.onClick, this);
        this.btnSound.on(Button.EventType.CLICK, this.onClick, this);
        this.btnMusic.on(Button.EventType.CLICK, this.onClick, this);


        if (AudioMgr.inst.isSoundOn) {
            this.soundOff.active = false;
            this.soundOn.active = true;
        } else {
            this.soundOff.active = true;
            this.soundOn.active = false;
        }

        if(AudioMgr.inst.isMusicOn){
            this.musicOff.active = false;
            this.musicOn.active = true;
        } else {
            this.musicOff.active = true;
            this.musicOn.active = false;
        }
    }

    init(audioClip: AudioClip,cb:(cmd:number) => void) {
        this.audioClip = audioClip;
        this.callback = cb;
    }
    show() {
        this.node.active = true;
        this.bg.active = true;
        this.pp.getComponent(Animation).play('showpopup');
    }
    hide() {
        this.pp.getComponent(Animation).play('hidepopup');
        this.bg.active = false;
        let timeout1 = setTimeout(() => {
            clearTimeout(timeout1);
            this.node.active = false;
        }, 200);
    }
    onClick(button: Button) {
        AudioMgr.inst.playOneShot(this.audioClip);
        switch (button.node.name) {
            case 'btnClose':
                this.pp.getComponent(Animation).play('hidepopup');
                this.bg.active = false;
                let timeout1 = setTimeout(() => {
                    clearTimeout(timeout1);
                    this.node.active = false;
                }, 200);
                break;
            case 'btnQuit':
                this.pp.getComponent(Animation).play('hidepopup');
                this.bg.active = false;
                let timeout2 = setTimeout(() => {
                    clearTimeout(timeout2);
                    this.node.active = false;
                    this.callback(1);
                }, 200);
                break;
            case 'btnRestart':
                this.pp.getComponent(Animation).play('hidepopup');
                this.bg.active = false;
                let timeout3 = setTimeout(() => {
                    clearTimeout(timeout3);
                    this.node.active = false;
                    this.callback(2);
                }, 200);
                break;
            case 'btnSound':
                AudioMgr.inst.setSoundOn();
                if(AudioMgr.inst.isSoundOn){
                    this.soundOff.active = false;
                    this.soundOn.active = true;
                } else {
                    this.soundOff.active = true;
                    this.soundOn.active = false;
                }
                break;
            case 'btnMusic':
                AudioMgr.inst.setMusicOn();
                if(AudioMgr.inst.isMusicOn){
                    this.musicOff.active = false;
                    this.musicOn.active = true;
                } else {
                    this.musicOff.active = true;
                    this.musicOn.active = false;
                }
                break;
        }
    }
}

