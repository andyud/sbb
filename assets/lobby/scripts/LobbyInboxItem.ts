import { _decorator, Component, Node, Label,AudioClip } from 'cc';
const { ccclass, property } = _decorator;
import { AudioMgr } from '../../core/AudioMgr';
import GameMgr from '../../core/GameMgr';
import APIMgr from '../../core/APIMgr';
@ccclass('LobbyInboxItem')
export class LobbyInboxItem extends Component {
    @property({ type: Node })
    iconChip: Node | null = null;
    @property({ type: Node })
    iconTicket: Node | null = null;
    @property({ type: Node })
    btnReceive: Node | null = null;
    @property({ type: Node })
    spReceive: Node | null = null;
    @property({ type: Node })
    spReceived: Node | null = null;
    @property({ type: Label })
    lbTitle: Label | null = null;
    @property({ type: Label })
    lbSender: Label | null = null;
    @property({ type: Label })
    lbTime: Label | null = null;
    audioClip:AudioClip = null;
    isReceived: boolean = false;
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
    info = {
        id: 1,
        balance:1000,
        message:'post massage',
        title:'title',
        name:'balance',
        bonusType:1,
        messageType:0
    }
    start() {
        this.iconChip.active = true;
        this.iconTicket.active = false;
        this.spReceive.active = true;
        this.spReceived.active = false;
    }
    init(audioClip: AudioClip,cb: (cmd:any) => void){
        this.audioClip = audioClip;
        this.callback = cb;
    }
    onRecevice(){
        if(this.audioClip!=null){
            AudioMgr.inst.playOneShot(this.audioClip);
            this.callback(this.info);
        }
    }
    setData(info:any){
        this.info = info;
        this.lbTitle.string = this.info.title;
        this.lbSender.string = this.info.name;
        this.lbTime.string = GameMgr.instance.numberWithCommas(this.info.balance);
        if(this.info.bonusType==this.bonusType.chips){
            this.iconTicket.active = false;
            this.iconChip.active = true;
        } else {
            this.iconTicket.active = true;
            this.iconChip.active = false;
        }
        if(this.info.messageType == this.messageType.gift){
            this.btnReceive.active = true;
        } else {
            this.btnReceive.active = false;
        }
    }
}

