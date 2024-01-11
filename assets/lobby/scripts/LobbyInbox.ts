import { _decorator, Component, Node, Button, AudioClip, Animation, Prefab, ScrollView, instantiate, UITransform } from 'cc';
import { AudioMgr } from '../../core/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('LobbyInbox')
export class LobbyInbox extends Component {
    @property({ type: Node })
    bg: Node | null = null;
    @property({ type: Node })
    pp: Node | null = null;
    @property({ type: Node })
    btnClose: Node | null = null;
    audioClip: AudioClip = null;
    @property({type: Prefab})
    pfItem: Prefab | null = null;
    @property({type: ScrollView})
    scrollView: ScrollView | null = null; 
    start() {
        this.node.active = false;
        this.bg.active = false;
        this.pp.setPosition(0, -1400);
        this.btnClose.on(Button.EventType.CLICK, this.onClick, this);

        //--generate 100 item
        let itemH = 117;
        let gap = 10;
        let numOfItem = 150;
        for(let i=0;i<numOfItem;i++){
            let item = instantiate(this.pfItem);
            if(i==0){
                itemH = item.getComponent(UITransform).height;
            }
            this.scrollView.content.addChild(item);
        }
        this.scrollView.content.getComponent(UITransform).height = (itemH+gap)*numOfItem;
    }
    init(audioClip: AudioClip) {
        this.audioClip = audioClip;
    }
    show() {
        this.node.active = true;
        this.bg.active = true;
        this.pp.getComponent(Animation).play('showpopup');
    }
    hide() {
        this.pp.getComponent(Animation).play('hidepopup');
        this.bg.active = false;
        let timeout1 = setTimeout(() => {
            clearTimeout(timeout1);
            this.node.active = false;
        }, 200);
    }
    onClick(button: Button) {
        AudioMgr.inst.playOneShot(this.audioClip);
        switch (button.node.name) {
            case 'btnClose':
                this.hide();
                break;
        }
    }
}

