import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FruitItem')
export class FruitItem extends Component {
    @property({type:Sprite})
    spItem:Sprite | null = null;
    @property({type:Sprite})
    spHL:Sprite | null = null;
    @property({type:Node})
    spHorizontal: Node | null = null;
    @property({type:Node})
    spVertical: Node | null = null;
    info = {
        row:0,
        col:0,
        idx:0,
        type:0,
    }
    start() {
        this.spHL.node.active = false;
    }
    init(tex:SpriteFrame,texHL:SpriteFrame,texBomb:SpriteFrame,info:any){
        this.spItem.spriteFrame = tex;
        this.spHL.spriteFrame = texHL;
        this.info = info;
        // this.spHL.spriteFrame = texHL;
    }
    setHL(isActive:boolean){
        this.spItem.node.active = !isActive;
        this.spHL.node.active = isActive;
    }
    // update(deltaTime: number) {
        
    // }
}

