import { _decorator, Animation, Component, easing, Node, Sprite, SpriteFrame, Tween, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { GameEvent } from '../../../core/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('FruitItem')
export class FruitItem extends Component {
    @property({type:Node})
    sp:Node | null = null;
    @property({type:Node})
    hl:Node | null = null;
    @property({type:Node})
    bomb:Node | null = null;
    @property({type:Node})
    spHorizontal: Node | null = null;
    @property({type:Node})
    spVertical: Node | null = null;
    speed = 0.3;
    //--control moving & avoid move douplicate
    moveCount = 0;
    isMoving = false;
    info = {
        row:0,
        col:0,
        idx:0,
        type:0,
    }
    start() {
        this.hl.active = false;
    }
    init(info:any){
        this.info = info;
    }
    setHL(isActive:boolean){
        this.sp.active = !isActive;
        this.hl.active = isActive;
    }
    setScaleAnim(isActive:boolean){
        if(isActive){
            tween(this.node)
            .repeatForever(
                tween(this.node)
                .to(0.5,{scale:new Vec3(1.1,0.8,1.1)})//,{easing:"quadIn"})
                .to(0.2,{scale:new Vec3(1,1,1)})//,{easing:"quadOut"})
            )
            .start();
        } else {
            Tween.stopAllByTarget(this.node.getComponent(UIOpacity));
            this.node.setScale(new Vec3(1,1,1));
        }
    }
    playDestroy(){
        this.sp.active = false;
        this.hl.active = true;
        this.bomb.active = false;
        this.node.getComponent(Animation).play('destroy');
    }
    destroyDone(){
        this.node.active = false;
        GameEvent.DispatchEvent("FRUIT_DESTROY_DONE",this.info);
        this.node.removeFromParent();
    }
    moveDown(){
        if(this.moveCount>0 && this.isMoving==false){
            console.log(`>>> item: ${this.info.row}:${this.info.col}-${this.moveCount}`)
            this.isMoving = true;
            tween(this.node)
            .to(this.speed,{position:new Vec3(this.node.position.x,this.node.position.y-this.node.getComponent(UITransform).height)})
            .call(()=>{
                this.isMoving = false;
                this.moveCount--;
                this.moveDown();
                this.info.row--;
                this.info.idx = this.info.row*8 + this.info.col;
                // if(this.moveCount==0){
                //     console.log(`type: ${this.info.type}, row: ${this.info.row}, col: ${this.info.col}, idx: ${this.info.idx}`)
                // }
                
                GameEvent.DispatchEvent("FRUIT_CHECK_MOVE_DONE",this.info);
            })
            .start();
        }
    }
    setMove(){
        this.moveDown();
    }
    // update(deltaTime: number) {
        
    // }
}

