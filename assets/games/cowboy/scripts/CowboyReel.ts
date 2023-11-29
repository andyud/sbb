import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CowboyReel')
export class CowboyReel extends Component {
    init(arr:any,icons:any){
        for(let i=0;i<arr.length;i++){
            let idx = arr[i];
            let icon = instantiate(icons[idx]);
            this.node.addChild(icon);   
        }
    }
    spin(index,speed){
        // this.node.stopAllActions();
        // var self = this;
        // var d = cc.moveTo(speed, cc.v2(this.node.x,-(this.node.height-396))).easing(cc.easeInOut(3));
        // var p2 = cc.callFunc(function() {
        //     if (index === 0) {
        //         this.RedT.copy();
        //     }
        //     this.node.y = 0;
        // }, this);

        // if (index === 4){
        //     var EF = cc.callFunc(function() {
        //         this.RedT.EF_vuathang();
        //         this.node.y = 0;
        //         this.RedT.random();
        //         this.RedT.hieuUng();
        //     }, this);
        //     this.node.runAction(cc.sequence(cc.delayTime(index*0.1), d, EF));
        // } else
        //     this.node.runAction(cc.sequence(cc.delayTime(index*0.1), d, p2));
    }
    stop(){
        // this.node.stopAllActions();
        // this.RedT.copy();
        // this.node.y = 0;
    }
}

