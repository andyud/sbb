import { _decorator, AudioClip, Component, Node, Button, Animation, Prefab, SpriteFrame, instantiate } from 'cc';
import { AudioMgr } from '../../../core/AudioMgr';
import { FruitItemQuest } from './FruitItemQuest';
const { ccclass, property } = _decorator;

@ccclass('FruitQuest')
export class FruitQuest extends Component {
    @property({ type: Node })
    bg: Node | null = null;
    @property({ type: Node })
    pp: Node | null = null;
    @property({ type: Node })
    btnClose: Node | null = null;
    @property({ type: Node })
    btnPlay: Node | null = null;
    @property({ type: Node })
    questList: Node | null = null;
    @property({type:Prefab})
    pfItem:Prefab | null = null;
    icons = [];
    audioClip: AudioClip = null;
    callback: (cmd:number) => void;
    level = {
        MODE:2,
        SIZE:[7,5],
        LIMIT:[0,16],
        COLOR_LIMIT: 4,
        STARS:[500,1200,2100],
        COLLECT_ITEMS:[0,1,2,3],
        COLLECT_COUNT:[3,3,3,3],
        MATRIX:[[10, 10, 10, 10, 10, 10, 10],
                [10, 10, 10, 10, 10, 10, 10],
                [10, 10, 10, 10, 10, 10, 10],
                [10, 10, 10, 10, 10, 10, 10],
                [10, 10, 10, 10, 10, 10, 10]]
    };
    start() {
        this.node.active = false;
        this.bg.active = false;
        this.pp.setPosition(0, -1400);
        this.btnPlay.on(Button.EventType.CLICK, this.onClick, this);
        this.btnClose.on(Button.EventType.CLICK, this.onClick, this);
    }

    init(audioClip: AudioClip, level:any, icons:any ,cb:(cmd:number) => void) {
        this.audioClip = audioClip;
        this.level = level;
        this.icons = icons;
        this.callback = cb;
        this.questList.removeAllChildren();
        for(let i=0;i<this.level.COLLECT_ITEMS.length;i++){
            let item = instantiate(this.pfItem);
            let idx  = this.level.COLLECT_ITEMS[i];
            let count= this.level.COLLECT_COUNT[i];
            item.getComponent(FruitItemQuest).init(this.icons[idx],{idx:i, type:idx,count:count});
            this.questList.addChild(item);
        }
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
                this.pp.getComponent(Animation).play('hidepopup');
                this.bg.active = false;
                let timeout1 = setTimeout(() => {
                    clearTimeout(timeout1);
                    this.node.active = false;
                    //--back to lobby
                    this.callback(1);
                }, 200);
                break;
            case 'btnPlay':
                this.pp.getComponent(Animation).play('hidepopup');
                this.bg.active = false;
                let timeout2 = setTimeout(() => {
                    clearTimeout(timeout2);
                    this.node.active = false;
                    this.callback(2);
                }, 200);
                break;
        }
    }
}

