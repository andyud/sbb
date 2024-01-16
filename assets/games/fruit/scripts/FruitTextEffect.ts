import { _decorator, Component, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FruitTextEffect')
export class FruitTextEffect extends Component {
    start() {

    }

    runEffect(idx:number){
        for(let i=0;i<this.node.children.length;i++){
            this.node.children[i].active = false;
        }
        this.node.children[idx].active = true;
        this.node.getComponent(Animation).play('Show');
    }
    animationDone(){
        
    }
}

