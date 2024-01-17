import { _decorator, Component, Node, Animation, UIOpacity, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FruitTextEffect')
export class FruitTextEffect extends Component {
    start() {

    }
    runEffect(combo:number){
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.scale = new Vec3(3,3,3);
        for(let i=0;i<this.node.children.length;i++){
            this.node.children[i].active = false;
        }
        if (combo>=8) {
            // gratzWords[2].SetActive(true);
            // SoundBase.Instance.PlaySound(SoundBase.Instance.soundText[2]);
            this.node.children[2].active = true;
        }else if (combo >= 6) {
            // gratzWords[1].SetActive(true);
            // SoundBase.Instance.PlaySound(SoundBase.Instance.soundText[1]);
            this.node.children[1].active = true;
        }
        else if (combo >= 4) {
            // gratzWords[0].SetActive(true);
            // SoundBase.Instance.PlaySound(SoundBase.Instance.soundText[0]);
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

