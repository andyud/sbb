import { _decorator, Component, Node, Label, Game, Button, tween, Vec3 } from 'cc';
import GameMgr from '../../../core/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('CowboyBonusItem')
export class CowboyBonusItem extends Component {
    @property({ type: Node })
    sp: Node | null = null;
    @property({ type: Label })
    lb: Label | null = null;
    callback: (idx: number) => void;
    private idx: number = -1;
    start() {
        this.sp.active = true;
        this.lb.node.active = false;
    }
    init(cb: (idx: number) => void, idx: number) {
        this.callback = cb;
        this.idx = idx;
    }
    reset() {
        this.sp.active = true;
        this.lb.node.active = false;
        this.setTouchEnable(true);
        this.sp.scale = new Vec3(1,1,1);
    }
    setIdx(idx: number) {
        this.idx = idx;
    }
    onClick() {
        this.callback(this.idx);
    }
    setValue(val: number) {
        if(val == null || val == 0){
            this.lb.string = '';
        } else {
            this.lb.string = GameMgr.instance.numberWithCommas(val);
        }
        this.lb.node.active = true;
        tween(this.sp).to(0.2,{scale:new Vec3(-1,1,1)})
        .call(()=>{
            this.sp.active = false;
        }).start()
    }
    setTouchEnable(isEnable:boolean){
        this.node.getComponent(Button).interactable = isEnable;
    }
}

