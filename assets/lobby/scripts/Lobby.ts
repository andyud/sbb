import { _decorator, Button, Component, director, Label, Node,AudioClip } from 'cc';
import APIMgr from '../../core/APIMgr';
import { AudioMgr } from '../../core/AudioMgr';
import GameMgr from '../../core/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('Lobby')
export class Lobby extends Component {
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
        AudioMgr.inst.playOneShot(this.arrAudioClips[1]);
        director.loadScene('cowboy');
    }
    // update(deltaTime: number) {
        
    // }
}