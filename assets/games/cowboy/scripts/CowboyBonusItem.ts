import { _decorator, Component, Node, Label, Game, Button, tween, Vec3, Color, sp } from 'cc';
import GameMgr from '../../../core/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('CowboyBonusItem')
export class CowboyBonusItem extends Component {
    @property({ type: Label })
    lb: Label | null = null;
    @property({type: sp.Skeleton})
    pickEff : sp.Skeleton | null = null;
    callback: (idx: number) => void;
    private idx: number = -1;
    start() {
        this.pickEff.setAnimation(0, 'bonus_poster_idle',false);
        this.lb.node.active = false;
    }
    init(cb: (idx: number) => void, idx: number) {
        this.callback = cb;
        this.idx = idx;
    }
    reset() {
        this.setTouchEnable(false);
        this.pickEff.setAnimation(0,'bonus_poster_appearance',false);
        let timeout = setTimeout(()=>{
            clearTimeout(timeout);
            this.pickEff.setAnimation(0, 'bonus_poster_idle',false);
            this.lb.node.active = false;
            this.setTouchEnable(true);
            this.lb.color = Color.WHITE;
        },2000);
    }
    setIdx(idx: number) {
        this.idx = idx;
    }
    onClick() {
        this.callback(this.idx);
    }
    setValue(val: number,plus:string='',sColor:string) {
        this.lb.color = new  Color().fromHEX(sColor);
        if(val == null || val == 0){
            this.lb.string = '';
        } else {
            this.lb.string = plus + GameMgr.instance.numberWithCommas(val);
        }
        // this.lb.color = new Color().fromHEX('');
        this.lb.node.active = true;
        this.pickEff.setAnimation(0, 'bonus_poster_disappearance',false);
    }
    setTouchEnable(isEnable:boolean){
        this.node.getComponent(Button).interactable = isEnable;
    }
}

