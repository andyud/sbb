import { _decorator, Component, Node, Label, UITransform, Animation, AudioClip, Button } from 'cc';
import { AudioMgr } from '../../core/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('LobbyOption')
export class LobbyOption extends Component {
    @property({ type: Node })
    bg: Node | null = null;
    @property({ type: Node })
    pp: Node | null = null;
    @property({ type: Node })
    btnClose: Node | null = null;
    @property({ type: Label })
    lbUID: Label | null = null;
    @property({ type: Node })
    btnFBInvite: Node | null = null;
    @property({ type: Node })
    fbConnect: Node | null = null;
    @property({ type: Node })
    fbInvite: Node | null = null;
    private isFBConnected: boolean = false;
    @property({ type: Node })
    btnSound: Node | null = null;
    @property({ type: Node })
    soundOn: Node | null = null;
    @property({ type: Node })
    soundOff: Node | null = null;
    @property({ type: Node })
    btnTermOfService: Node | null = null;
    @property({ type: Node })
    btnPrivacyPolicy: Node | null = null;
    @property({ type: Label })
    lbVersion: Node | null = null;
    private audioClip: AudioClip = null;
    start() {
        this.node.active = false;
        this.bg.active = false;
        this.pp.setPosition(0, -1400);
        if (this.isFBConnected) {
            this.fbInvite.active = true;
            this.fbConnect.active = false;
        } else {
            this.fbInvite.active = false;
            this.fbConnect.active = true;
        }
        if (AudioMgr.inst.isSoundOn) {
            this.soundOff.active = false;
            this.soundOn.active = true;
        } else {
            this.soundOff.active = true;
            this.soundOn.active = false;
        }
        //--init touch listener
        this.btnClose.on(Button.EventType.CLICK, this.onClick, this);
        this.btnFBInvite.on(Button.EventType.CLICK, this.onClick, this);
        this.btnPrivacyPolicy.on(Button.EventType.CLICK, this.onClick, this);
        this.btnSound.on(Button.EventType.CLICK, this.onClick, this);
        this.btnTermOfService.on(Button.EventType.CLICK, this.onClick, this);
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
            case 'btnFBInvite':
                this.hide();
                break;
            case 'btnPrivacyPolicy':
                this.hide();
                break;
            case 'btnTermOfService':
                this.hide();
                break;
            case 'btnSound':
                AudioMgr.inst.setSoundOn();
                if(AudioMgr.inst.isSoundOn){
                    this.soundOff.active = false;
                    this.soundOn.active = true;
                } else {
                    this.soundOff.active = true;
                    this.soundOn.active = false;
                }
                break;

        }
    }
}

