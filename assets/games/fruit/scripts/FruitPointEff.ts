import { _decorator, Component, Node, Label, Color, UIOpacity, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FruitPointEff')
export class FruitPointEff extends Component {
    @property({type:Label})
    lb:Label | null = null;
    playEff(type:number, scrore:number){
        if(type==0){
            this.lb.color = new Color().fromHEX('#e01a2d');
        } else if(type==1){
            this.lb.color = new Color().fromHEX('#ef782b');
        }else if(type==2){
            this.lb.color = new Color().fromHEX('#ab26d5');
        }else if(type==3){
            this.lb.color = new Color().fromHEX('#6aba2b');
        }else if(type==4){
            this.lb.color = new Color().fromHEX('#206add');
        }else if(type==5){
            this.lb.color = new Color().fromHEX('#e5da3b');
        }else if(type==6){
            this.lb.color = new Color().fromHEX('#DFFFEA');
        }else if(type==7){
            this.lb.color = new Color().fromHEX('#DFFFEA');
        }
        this.lb.string = `+${scrore}`;
        this.lb.node.setPosition(0,-30);
        this.node.getComponent(UIOpacity).opacity = 0;
        this.node.scale = new Vec3(1,1,1);
        tween(this.node.getComponent(UIOpacity))
        .to(0.2,{opacity:255})
        .delay(0.2)
        .to(0.2,{opacity:0})
        .start()
        tween(this.lb.node)
        .to(0.2,{position:new Vec3(0,30),scale:new Vec3(1.1,1.1,1.1)})
        .delay(0.2)
        .to(0.2,{scale:new Vec3(2,2,2)})
        .call(()=>{
            this.node.removeFromParent();
        })
        .start();
    }
}

