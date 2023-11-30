import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CowboyItem')
export class CowboyItem extends Component {
    @property({type:Sprite})
    sprite:Sprite | null = null;
    
    setTexture(tex:SpriteFrame){
        this.sprite.spriteFrame = tex;
    }
}

