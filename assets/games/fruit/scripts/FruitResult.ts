import { _decorator, Component, Node, Label, Button, AudioClip, Animation} from 'cc';
import { AudioMgr } from '../../../core/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('FruitResult')
export class FruitResult extends Component {
    @property({ type: Node })
    bg: Node | null = null;
    @property({ type: Node })
    pp: Node | null = null;
    @property({ type: Node })
    btnClose: Node | null = null;
    
    @property({type:Node})
    btnPlayAgain:Node | null = null;
    @property({type:Node})
    btnRanking:Node | null = null;
    @property({type:Label})
    lbYourScore:Label | null = null;
    @property({type:Label})
    lbWeeklyScore:Label | null = null;
    @property({type:Label})
    lbWeeklyRank:Label | null = null;

    audioClip: AudioClip = null;
    callback: () => void;
    start() {
        this.node.active = false;
        this.bg.active = false;
        this.pp.setPosition(0, -1400);
        this.btnPlayAgain.on(Button.EventType.CLICK, this.onClick, this);
        this.btnClose.on(Button.EventType.CLICK, this.onClick, this);
        this.btnRanking.on(Button.EventType.CLICK, this.onClick, this);
    }

    init(audioClip: AudioClip, cb:() => void) {
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
                this.hide();
                break;
            case 'btnPlayAgain':
                this.pp.getComponent(Animation).play('hidepopup');
                this.bg.active = false;
                let timeout2 = setTimeout(() => {
                    clearTimeout(timeout2);
                    this.node.active = false;
                    //this.callback();
                }, 200);
                break;
        }
    }
}

