import { _decorator, Button, Component, director, Label, Node,AudioClip, Prefab, instantiate } from 'cc';
import APIMgr from '../../core/APIMgr';
import { AudioMgr } from '../../core/AudioMgr';
import GameMgr from '../../core/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('Lobby')
export class Lobby extends Component {
    @property({ type: Prefab })
    pfShop: Prefab | null = null;
    private shop:Node = null;
    @property({type:Node})
    btnShop:Node | null = null;
    @property({type:Label})
    lbNickName:Label | null = null;

    @property({type:Label})
    lbBalance:Label | null = null;

    @property({type:Label})
    lbLevel:Label | null = null;

    @property({type:Label})
    lbDbDeviceId:Label | null = null;

    @property([Node])
    arrGames: Node[] = []
    @property([AudioClip])
    arrAudioClips: AudioClip[] = [];
    start() {
        //--add listener
        for(let i=0;i<this.arrGames.length;i++){
            this.arrGames[i].on(Button.EventType.CLICK,this.gameClickHandler,this);
        }

        this.loadPlayerInfo();
        this.connectLobby();
        if(GameMgr.instance.isDebugMode){
            this.lbDbDeviceId.node.active = true;
        } else {
            this.lbDbDeviceId.node.active = false;
        }
        AudioMgr.inst.setAudioSouce('main',this.arrAudioClips[1]);
        AudioMgr.inst.bgm.play();
        AudioMgr.inst.bgm.volume = 1;

        if (this.shop == null) {
            this.shop = instantiate(this.pfShop);
            this.node.parent.addChild(this.shop);
            this.shop.setPosition(0,0);
            this.shop.active = false;
        }
        this.btnShop.on(Button.EventType.CLICK,this.onClick,this);
    }
    loadPlayerInfo(){
        this.lbDbDeviceId.string = `Device Id: ${APIMgr.instance.deviceId}`
        this.lbBalance.string = GameMgr.instance.numberWithCommas(APIMgr.instance.signinRes.balance);
        this.lbLevel.string = `${APIMgr.instance.signinRes.level}`;
    }
    async connectLobby(){
        await APIMgr.instance.getGames();
    }
    gameClickHandler(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[2]);
        AudioMgr.inst.bgm.stop();
        AudioMgr.inst.bgm.clip = null;
        director.loadScene('cowboy');

    }
    // update(deltaTime: number) {
        
    // }

    onClick(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[2]);
        switch (button.node.name) {
            case 'btnShop':
                this.shop.active = true;
                break;
        }
    }
}