import { _decorator, Component, Node, Label,AudioClip,Prefab, ScrollView, Button, Animation, UITransform, instantiate } from 'cc';
import { AudioMgr } from '../../core/AudioMgr';
import { LobbyRankingItem } from './LobbyRankingItem';
import GameMgr from '../../core/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('LobbyRanking')
export class LobbyRanking extends Component {
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
    @property({ type: Label })
    lbMyRank: Label | null = null;
    @property({ type: Label })
    lbMyUserName: Label | null = null;
    @property({ type: Label })
    lbMyScore: Label | null = null;
    @property({ type: Label })
    lbLeftTime: Label | null = null;
    res = {
        "userList": [
            {
                "userId": 1145,
                "rank": 1,
                "score": 2560,
                "username": "user_1145"
            }
        ],
        "myrank": 1,
        "finishtime": "2023-12-11T00:00:00.000Z"
    }
    start() {
        this.node.active = false;
        this.bg.active = false;
        this.pp.setPosition(0, -1400);
        this.btnClose.on(Button.EventType.CLICK, this.onClick, this);
    }
    init(audioClip: AudioClip) {
        this.audioClip = audioClip;
    }
    show(res:any) {
        this.node.active = true;
        this.bg.active = true;
        this.pp.getComponent(Animation).play('showpopup');
        this.res = res;
        this.scrollView.content.removeAllChildren();
        //--
        if(this.res && this.res.myrank){
            this.lbMyRank.string = `${this.res.myrank}`;
        }
        
        if(this.res && this.res.userList){
            let itemH = 124;
            let gap = 10;
            let numOfItem = this.res.userList.length;
            for(let i=0;i<this.res.userList.length;i++){
                let itemInfo = this.res.userList[i];
                if(this.res.myrank == itemInfo.rank){
                    this.lbMyScore.string = GameMgr.instance.numberWithCommas(itemInfo.score);
                    this.lbMyUserName.string = itemInfo.username;
                }
                let item = instantiate(this.pfItem);
                item.getComponent(LobbyRankingItem).setRank(itemInfo)
                if(i==0){
                    itemH = item.getComponent(UITransform).height;
                }
                this.scrollView.content.addChild(item);
            }
            this.scrollView.content.getComponent(UITransform).height = (itemH+gap)*numOfItem;
            //timeleft
            let currentTime = new Date().getTime();
            let endTime = new Date(this.res.finishtime).getTime();
            let remainMili = endTime - currentTime;
            if(remainMili<=0){
                this.lbLeftTime.string = 'End of Event';
            } else {
                let days = Math.ceil(remainMili/(24*60*60*1000));
                let remainMili2 = remainMili%(24*60*60*1000);
                let hours = Math.ceil(remainMili2/(60*60*1000));
                let remainMili3 = remainMili2%(60*60*1000);
                let minutes = Math.ceil(remainMili3/(60*1000));
                this.lbLeftTime.string = `${days} day ${hours}:${minutes}`;
            }
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
        }
    }
}

