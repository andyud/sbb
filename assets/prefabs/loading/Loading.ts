import { _decorator, Component, dragonBones, Label, tween, UIOpacity, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Loading')
export class Loading extends Component {
    @property({type:Label})
    lb:Label | null = null;
    

    start() {
        this.lb.node.active = false;
        this.node.getComponent(UIOpacity).opacity = 0;
    }

    public show(){
        tween(this.node.getComponent(UIOpacity))
        .to(0.2,{opacity:255})
        .start()
    }
    public hide(){
        tween(this.node.getComponent(UIOpacity))
        .to(0.2,{opacity:0})
        .start()
    }
}

