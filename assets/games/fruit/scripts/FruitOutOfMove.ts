import {_decorator, AudioClip, Component, Node, Button, Animation } from 'cc';
import { AudioMgr } from '../../../core/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('FruitOutOfMove')
export class FruitOutOfMove extends Component {
    @property({ type: Node })
    bg: Node | null = null;
    @property({ type: Node })
    pp: Node | null = null;
    @property({ type: Node })
    btnClose: Node | null = null;
    @property({ type: Node })
    btnRestart: Node | null = null;


    audioClip: AudioClip = null;
    callback: (cmd:number) => void;
    start() {
        this.node.active = false;
        this.bg.active = false;
        this.pp.setPosition(0, -1400);
        this.btnRestart.on(Button.EventType.CLICK, this.onClick, this);
        this.btnClose.on(Button.EventType.CLICK, this.onClick, this);
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
                    //--back to lobby
                    this.callback(1);
                }, 200);
                break;
            case 'btnRestart':
                this.pp.getComponent(Animation).play('hidepopup');
                this.bg.active = false;
                let timeout2 = setTimeout(() => {
                    clearTimeout(timeout2);
                    this.node.active = false;
                    this.callback(2);
                }, 200);
                break;
        }
    }
}

