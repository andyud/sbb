import { _decorator, Component, Node, Label, Button, AudioClip, Animation, tween, Vec3, UIOpacity} from 'cc';
import { AudioMgr } from '../../../core/AudioMgr';
import GameMgr from '../../../core/GameMgr';
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
    btnNext:Node | null = null;
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
        this.btnNext.on(Button.EventType.CLICK, this.onClick, this);
        this.btnClose.on(Button.EventType.CLICK, this.onClick, this);
    }

    init(audioClip: AudioClip, cb:(cmd:number) => void) {
        this.audioClip = audioClip;
        this.callback = cb;
    }
    show(score:number,totalStar:number) {
        this.node.active = true;
        this.bg.active = true;
        this.pp.getComponent(Animation).play('showpopup');

        //--
        for(let i=0;i<this.stars.length;i++){
            this.stars[i].getComponent(UIOpacity).opacity = 0;
        }

        GameMgr.instance.numberTo(this.lbScore,0,score, 1000);
        for(let i=0;i<totalStar;i++){
            let posX = -200;
            if(i==1){
                posX = 0;
            } else if(i==2){
                posX = 200;
            }
            tween(this.stars[i])
            .to(0.3 +i*0.05,{position:new Vec3(posX,0),scale:new Vec3(3,3,3)})
            .delay(0.1)
            .to(0.1,{scale:new Vec3(1,1,1),position:new Vec3(0,0)})
            .start();
            tween(this.stars[i].getComponent(UIOpacity))
            .to(0.3 +i*0.05,{opacity:255})
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
                this.callback(1);
                break;
            case 'btnNext':
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

