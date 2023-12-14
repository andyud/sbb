import { _decorator, Component, Node, Button, director,AudioClip } from 'cc';
const { ccclass, property } = _decorator;
import { AudioMgr } from '../../core/AudioMgr';
@ccclass('Login')
export class Login extends Component {
    @property({ type: Node })
    btnGuest: Node | null = null;
    @property({ type: Node })
    btnFacebook: Node | null = null;
    @property({ type: Node })
    btnGoogle: Node | null = null;
    @property({ type: Node })
    btnCheck: Node | null = null;
    @property({ type: Node })
    iconCheck: Node | null = null;
    @property([AudioClip])
    arrAudioClips: AudioClip[] = [];
    start() {
        this.btnGuest.on(Button.EventType.CLICK, this.onClick, this);
        this.btnFacebook.on(Button.EventType.CLICK, this.onClick, this);
        this.btnGoogle.on(Button.EventType.CLICK, this.onClick, this);
        this.btnCheck.on(Button.EventType.CLICK, this.onClick, this);
    }

    onClick(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[1]);
        switch (button.node.name) {
            case 'btnPlayAsGuest':
                director.loadScene('lobby');
                break;
            case 'btnFacebook':
                director.loadScene('lobby');
                break;
            case 'btnGoogle':
                director.loadScene('lobby');
                break;
            case 'btnCheck':
                this.iconCheck.active = !this.iconCheck.active;
                break;
        }
    }
}

