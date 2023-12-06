import { _decorator, Component, Node, Label } from 'cc';
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
    }
    setIdx(idx: number) {
        this.idx = idx;
    }
    onClick() {
        this.callback(this.idx);
    }
    setValue(val: number) {
        let str = `${val}`
        this.sp.active = false;
        this.lb.node.active = true;
        this.lb.string = str.length > 0 ? `+${val}` : '';
    }
}

