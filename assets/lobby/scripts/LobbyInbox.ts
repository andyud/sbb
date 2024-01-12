import { _decorator, Component, Node, Button, AudioClip, Animation, Prefab, ScrollView, instantiate, UITransform } from 'cc';
import { AudioMgr } from '../../core/AudioMgr';
import { LobbyInboxItem } from './LobbyInboxItem';
const { ccclass, property } = _decorator;

@ccclass('LobbyInbox')
export class LobbyInbox extends Component {
    @property({ type: Node })
    bg: Node | null = null;
    @property({ type: Node })
    pp: Node | null = null;
    @property({ type: Node })
    btnClose: Node | null = null;
    @property({ type: Node })
    btnReceiveAll: Node | null = null;
    @property({type:Node})
    spReceive:Node | null = null;
    @property({type:Node})
    spReceived:Node | null = null;
    audioClip: AudioClip = null;
    @property({type: Prefab})
    pfItem: Prefab | null = null;
    @property({type: ScrollView})
    scrollView: ScrollView | null = null;
    callback: (cmd:any) => void;
    bonusType = {
        chips:1,
        exp:2,
        ticket:3
    };
    messageType ={
        gift:0,
        message:1
    }
    res = {
        statusCode: 0,
        list:[
            {
                id: 1,
                balance:1000,
                message:'post massage',
                title:'title',
                name:'balance',
                bonusType:1,
                messageType:0
            }
        ]
    }
    start() {
        this.node.active = false;
        this.bg.active = false;
        this.pp.setPosition(0, -1400);
        this.btnClose.on(Button.EventType.CLICK, this.onClick, this);
        this.btnReceiveAll.on(Button.EventType.CLICK, this.onClick, this);
        //--generate 100 item
    }
    init(audioClip: AudioClip,cb: (cmd:any) => void) {
        this.audioClip = audioClip;
        this.callback = cb;
    }
    show(res:any) {
        this.node.active = true;
        this.bg.active = true;
        this.pp.getComponent(Animation).play('showpopup');
        this.res = res;

        //--show data
        this.scrollView.content.removeAllChildren();
        let itemH = 117;
        let gap = 10;
        for(let i=0;i<this.res.list.length;i++){
            let item = instantiate(this.pfItem);
            item.getComponent(LobbyInboxItem).init(this.audioClip,(data:any)=>{
                this.callback(data);
            });
            item.getComponent(LobbyInboxItem).setData(this.res.list[i]);
            if(i==0){
                itemH = item.getComponent(UITransform).height;
            }
            this.scrollView.content.addChild(item);
        }
        this.scrollView.content.getComponent(UITransform).height = (itemH+gap)*this.res.list.length;


        //--check active item
        if(this.res.list.length>0){
            this.btnReceiveAll.active = true;
            //check received or not
        } else {
            this.btnReceiveAll.active = false;
        }
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
            case 'btnReceiveAll':
                this.callback(this.res.list[0]);
                break;
        }
    }
}

