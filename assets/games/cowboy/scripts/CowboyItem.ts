import { _decorator, Component, Node, Sprite, SpriteFrame,Animation, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CowboyItem')
export class CowboyItem extends Component {
    @property({type:Sprite})
    sprite:Sprite | null = null;
    @property({type:Node})
    hlNode:Node | null = null;
    setTexture(tex:SpriteFrame){
        this.sprite.spriteFrame = tex;
    }
    zoomAnim(){
        this.sprite.node.getComponent(Animation).play('icon-zoom');
    }
    stopZoomAnim(){
        this.sprite.node.getComponent(Animation).stop();
        this.sprite.node.setScale(new Vec3(1,1,1));
        // this.hlNode.getComponent(Animation).stop();
        this.hlNode.active = false;
    }
    runSpecialEff(){
        this.hlNode.active = true;
        this.hlNode.getComponent(Animation).play('special-icon-idle');
    }
}

