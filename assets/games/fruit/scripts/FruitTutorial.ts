import { _decorator, Component, instantiate, Node, Prefab, tween, UITransform, Vec3 } from 'cc';
import { FruitItem } from './FruitItem';
const { ccclass, property } = _decorator;

@ccclass('FruitTutorial')
export class FruitTutorial extends Component {
    @property({type:Node})
    hand:Node | null = null;
    @property({type:Prefab})
    pfItemBg: Prefab | null = null;
    isDone = false;
    isCurrentId = 0;
    arrPath = [];
    start() {

    }
    setActiveTutorial(arr:any, pfItem: Prefab){
        this.isDone = false;
        this.arrPath = arr;
        this.playTutorial();
        if(this.arrPath.length>0){
            this.hand.setPosition(this.arrPath[0].x,this.arrPath[0].y);
            this.isCurrentId++;
        }
        //--add item
        for(let i=0;i<this.arrPath.length;i++){
            let item = instantiate(pfItem);
            let itembg = instantiate(this.pfItemBg);
            itembg.setPosition(this.arrPath[i].x,this.arrPath[i].y);
            // itembg.getComponent(UITransform).priority = 1;
            // itembg.setSiblingIndex(1);
            item.setPosition(this.arrPath[i].x,this.arrPath[i].y);
            // item.getComponent(UITransform).priority = 2;
            // item.setSiblingIndex(2);
            item.getComponent(FruitItem).setScaleAnim(true);
            this.node.addChild(itembg);
            this.node.addChild(item);
        }
        // this.hand.getComponent(UITransform).priority = 3;
        // this.hand.setSiblingIndex(3);
        this.hand.removeFromParent();
        this.node.addChild(this.hand);
    }
    playTutorial(){
        if(this.isDone) return;
        if(this.isCurrentId>=this.arrPath.length){
            this.isCurrentId = 0;
        }
        let p = this.arrPath[this.isCurrentId];
        let delay = 0.1;
        if(this.isCurrentId==this.arrPath.length-1){
            delay = 2;
        }
        tween(this.hand)
        .to(0.2, {position: new Vec3(p.x,p.y,0)})
        .delay(delay)
        .call(()=>{
            this.isCurrentId++;
            this.playTutorial();
        }).start();
    }
    // update(deltaTime: number) {
        
    // }
}