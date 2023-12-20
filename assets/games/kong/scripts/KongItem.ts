import { _decorator, Component, Node, Sprite, SpriteFrame,Animation, Vec3, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KongItem')
export class KongItem extends Component {
    @property({type:Sprite})
    sprite:Sprite | null = null;
    @property({type:Node})
    hlNode:Node | null = null;
    idx:number = 0;//item id
    setTexture(tex:SpriteFrame,idx:number){
        this.sprite.spriteFrame = tex;
        this.idx = idx;
    }
    zoomAnim(){
        this.sprite.node.getComponent(Animation).play('icon-zoom');
    }
    stopZoomAnim(){
        this.sprite.node.getComponent(Animation).stop();
        this.sprite.node.setScale(new Vec3(1,1,1));
        // this.hlNode.getComponent(Animation).stop();
        this.hlNode.active = false;
        this.sprite.node.removeAllChildren();
    }
    runSpecialEff(){
        // this.hlNode.active = true;
        // this.hlNode.getComponent(Animation).play('special-icon-idle');
    }
    runScatter(items:any){
        let scatter = instantiate(items[11]);
        this.sprite.node.addChild(scatter);
        scatter.setPosition(0,0,0);
    }
    runWanted(items:any){
        let wanted = instantiate(items[12]);
        this.sprite.node.addChild(wanted);
        wanted.setPosition(0,0,0);
    }
    runWild(items:any){
        let wild = instantiate(items[13]);
        this.sprite.node.addChild(wild);
        wild.setPosition(0,0,0);
    }
    runJackpot(items:any){
        let jackpot = instantiate(items[14]);
        this.sprite.node.addChild(jackpot);
        jackpot.setPosition(0,0,0);
    }
}

