import {_decorator, AudioClip, Component, Node, Button, Animation, Label, tween, Vec3 } from 'cc';
import { AudioMgr } from '../../../core/AudioMgr';
import GameMgr from '../../../core/GameMgr';
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
    @property({ type: Label })
    lbScore: Label | null = null;
    @property([Node])
    stars: Node[] = [];

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
    show(score:number,totalStar:number) {
        this.node.active = true;
        this.bg.active = true;
        this.pp.getComponent(Animation).play('showpopup');

        //--
        this.stars[0].setPosition(-1103.72,-1638.903);
        this.stars[1].setPosition(-1103.72,-1638.903);
        this.stars[2].setPosition(-1103.72,-1638.903);
        GameMgr.instance.numberTo(this.lbScore,0,score, 1000);
        for(let i=0;i<totalStar;i++){
            tween(this.stars[i])
            .to(0.4 +i*0.1,{position:new Vec3(0,0)})
            .start();
        }
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

