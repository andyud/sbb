import { _decorator, Animation, Component, easing, Label, Node, Sprite, SpriteFrame, Tween, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { GameEvent } from '../../../core/GameEvent';
import GameMgr from '../../../core/GameMgr';
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
    bomSelection:Node | null = null;
    @property({type:Node})
    horizontalDirect:Node | null = null;
    @property({type:Node})
    horizontalBom:Node | null = null;
    @property({type:Node})
    verticalDirect:Node | null = null;
    @property({type:Node})
    verticalBom:Node | null = null;
    
    speed = 0.05;
    //--control moving & avoid move douplicate
    moveCount = 0;
    isMoving = false;
    BOM_TYPE = {
        NONE: 0,
        VETICAL:1,
        HORIZONTAL:2,
        BOTH:3
    }
    info = {
        row:0,
        col:0,
        idx:0,
        type:0,
        iBom:0
    }
    start() {
        this.hl.active = false;
        this.bomSelection.active = false;
        this.horizontalBom.active = false;
        this.verticalBom.active = false;
        this.horizontalDirect.active = false;
        this.verticalDirect.active = false;
    }
    init(info:any){
        this.info = info;
    }
    setBomSelection(){
        this.info.iBom = Math.random()>0.5?this.BOM_TYPE.HORIZONTAL:this.BOM_TYPE.VETICAL;
        if(this.info.iBom==this.BOM_TYPE.HORIZONTAL){
            this.horizontalDirect.active = true;
        } else {
            this.verticalDirect.active = true;
        }
        this.bomSelection.active = true;
        this.bomSelection.getComponent(Animation).play('bomselection');
    }
    setHL(isActive:boolean){
        this.sp.active = !isActive;
        this.hl.active = isActive;
    }
    clearSelected(){
        this.sp.active = true;
        this.hl.active = false;
        this.bomSelection.active = false;
        this.horizontalBom.active = false;
        this.verticalBom.active = false;
        this.horizontalDirect.active = false;
        this.verticalDirect.active = false;
        this.info.iBom = this.BOM_TYPE.NONE;
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
        if(this.info.iBom==this.BOM_TYPE.HORIZONTAL){
            this.bomSelection.getComponent(Animation).play('bomdestroy');
            this.verticalDirect.active = false;
            this.verticalBom.active = true;
            this.verticalBom.getComponent(Animation).play('bomverticle');
        } else if(this.info.iBom==this.BOM_TYPE.VETICAL){
            this.bomSelection.getComponent(Animation).play('bomdestroy');
            this.horizontalDirect.active = false;
            this.horizontalBom.active = true;
            this.horizontalBom.getComponent(Animation).play('bomhorizontal');
        }
        this.node.getComponent(Animation).play('destroy');
    }
    destroyDone(){
        this.node.active = false;
        GameEvent.DispatchEvent("FRUIT_DESTROY_DONE",{info:this.info,pos:this.node.getWorldPosition().clone()});
        this.node.removeFromParent();
    }
    moveDown(){
        if(this.moveCount>0 && this.isMoving==false){
            // console.log(`>>> item: ${this.info.row}:${this.info.col}-${this.moveCount}`)
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
}

