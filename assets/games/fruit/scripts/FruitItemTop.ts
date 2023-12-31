import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FruitItemTop')
export class FruitItemTop extends Component {
    @property({type:Sprite})
    spItem:Sprite | null = null;
    @property({type:Label})
    lbCount:Label | null = null;
    @property({type:Node})
    spReadyStick:Node | null = null;
    info = {
        idx:0,
        type:0
    }
    start() {
        // this.lbCount.node.active = false;
        this.spReadyStick.active = false;
    }
    init(spriteFrame:SpriteFrame, info:any){
        this.info = info;
        this.spItem.spriteFrame = spriteFrame;
    }
}

