import { _decorator, Component, Node, Label,AudioClip } from 'cc';
const { ccclass, property } = _decorator;
import { AudioMgr } from '../../core/AudioMgr';
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
    lbTitle: Node | null = null;
    @property({ type: Label })
    lbSender: Node | null = null;
    @property({ type: Label })
    lbTime: Node | null = null;
    audioClip:AudioClip = null;
    isReceived: boolean = false;
    start() {
        this.iconChip.active = true;
        this.iconTicket.active = false;
        this.spReceive.active = true;
        this.spReceived.active = false;
    }
    init(audioClip: AudioClip){
        this.audioClip = audioClip;
    }
    onRecevice(){
        if(this.audioClip!=null){
            AudioMgr.inst.playOneShot(this.audioClip);
        }
    }
}

