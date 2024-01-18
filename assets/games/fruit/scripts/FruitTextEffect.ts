import { _decorator, Component, Node, Animation, UIOpacity, tween, Vec3 } from 'cc';
import { AudioMgr } from '../../../core/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('FruitTextEffect')
export class FruitTextEffect extends Component {
    start() {

    }
    runEffect(combo:number,audios:any){
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.scale = new Vec3(3,3,3);
        for(let i=0;i<this.node.children.length;i++){
            this.node.children[i].active = false;
        }
        if (combo>=10) {
            AudioMgr.inst.playOneShot2(audios[22]);
            this.node.children[2].active = true;
        }else if (combo >= 7) {
            AudioMgr.inst.playOneShot2(audios[21])
            this.node.children[1].active = true;
        }
        else if (combo >= 5) {
            AudioMgr.inst.playOneShot2(audios[20])
            this.node.children[0].active = true;
        } else {
            return;
        }
        tween(this.node)
            .to(0.2,{scale:new Vec3(1,1,1)})
            .delay(0.1)
            // .to(0.1,{scale:new Vec3(1,1,1),position:new Vec3(0,0)})
            .start();
            tween(this.node.getComponent(UIOpacity))
            .to(0.2,{opacity:255})
            .delay(0.2)
            .to(0.3,{opacity:0})
            .start();
    }
}

