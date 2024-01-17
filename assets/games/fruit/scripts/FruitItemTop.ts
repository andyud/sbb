import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FruitItemTop')
export class FruitItemTop extends Component {
    @property({type:Sprite})
    spItem:Sprite | null = null;
    @property({type:Label})
    lbCount:Label | null = null;
    @property({type:Label})
    lbTarget:Label | null = null;
    @property({type:Node})
    spReadyStick:Node | null = null;
    currentCount = 0;
    info = {
        idx:0,
        type:0,
        count:0
    }
    start() {
        // this.lbCount.node.active = false;
        this.spReadyStick.active = false;
    }
    init(spriteFrame:SpriteFrame, info:any){
        this.info = info;
        this.spItem.spriteFrame = spriteFrame;
        this.lbCount.string = "0";
        this.lbTarget.string = `${this.info.count}`;
        if(this.info.idx%2==0){
            this.lbCount.color = new Color().fromHEX('#ec5504');
        } else {
            this.lbCount.color = new Color().fromHEX('#198339');
        }
        this.spReadyStick.active = false;
        this.lbCount.node.active = true;
        this.lbTarget.node.active = true;
    }
    setIncreaseCount(){
        this.currentCount++;
        if(this.currentCount>=this.info.count){
            this.currentCount = this.info.count;
            if(this.spReadyStick.active==false){
                let timeout = setTimeout(()=>{
                    clearTimeout(timeout);
                    this.spReadyStick.active = true;
                    this.lbCount.node.active = false;
                    this.lbTarget.node.active = false;
                },1000)
            }
        } else {
            this.lbCount.string = `${this.currentCount}`;
        }
        
    }
}