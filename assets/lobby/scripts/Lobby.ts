import { _decorator, Button, Component, director, Label, Node, AudioClip, Prefab, instantiate, UITransform } from 'cc';
import APIMgr from '../../core/APIMgr';
import { AudioMgr } from '../../core/AudioMgr';
import GameMgr from '../../core/GameMgr';
import { GameEvent } from '../../core/GameEvent';
import { Loading } from '../../prefabs/loading/Loading';
import { Notice } from '../../prefabs/popups/scripts/Notice';
const { ccclass, property } = _decorator;

@ccclass('Lobby')
export class Lobby extends Component {
    @property({ type: Prefab })
    pfLoading: Prefab | null = null;
    private loading: Node = null;
    @property({ type: Prefab })
    pfNotice: Prefab | null = null;
    private notice: Node = null;
    @property({ type: Prefab })
    pfShop: Prefab | null = null;
    private shop: Node = null;
    @property({ type: Node })
    btnShop: Node | null = null;
    @property({ type: Node })
    btnMenu: Node | null = null;
    @property({ type: Node })
    btnInbox: Node | null = null;
    @property({ type: Label })
    lbNickName: Label | null = null;
    @property({ type: Node })
    btnLuckyWheel: Node | null = null;
    @property({ type: Label })
    lbCountdown: Label | null = null;

    @property({type:Node})
    btnBack:Node | null = null;

    @property({ type: Label })
    lbBalance: Label | null = null;

    @property({ type: Label })
    lbLevel: Label | null = null;

    @property({ type: Label })
    lbDbDeviceId: Label | null = null;

    @property({type:Node})
    contentCenter: Node | null = null;
    @property([Node])
    arrGames: Node[] = []
    @property([AudioClip])
    arrAudioClips: AudioClip[] = [];
    @property([Label])
    jackpotPools: Label[] = [];
    private countUpdate = 0;
    start() {
        //--add listener
        for (let i = 0; i < this.arrGames.length; i++) {
            this.arrGames[i].on(Button.EventType.CLICK, this.gameClickHandler, this);
        }

        this.loadPlayerInfo();
        this.loadJackpotPool();
        if (GameMgr.instance.isDebugMode) {
            this.lbDbDeviceId.node.active = true;
        } else {
            this.lbDbDeviceId.node.active = false;
        }
        AudioMgr.inst.setAudioSouce('main', this.arrAudioClips[1]);
        AudioMgr.inst.bgm.play();
        AudioMgr.inst.bgm.volume = 1;

        if (this.shop == null) {
            this.shop = instantiate(this.pfShop);
            this.node.parent.addChild(this.shop);
            this.shop.setPosition(0, 0);
            this.shop.active = false;
        }
        this.btnShop.on(Button.EventType.CLICK, this.onClick, this);
        this.btnLuckyWheel.on(Button.EventType.CLICK, this.onClick, this);
        this.btnBack.on(Button.EventType.CLICK, this.onClick, this);
        this.btnMenu.on(Button.EventType.CLICK, this.onClick, this);
        this.btnInbox.on(Button.EventType.CLICK, this.onClick, this);
        //--get jackpot pool
        GameEvent.AddEventListener("updatebalance", (balance: number) => {
            GameMgr.instance.numberTo(this.lbBalance, 0, balance, 1000);
        });

        //--
        this.btnBack.getComponent(Button).interactable = false;
        if (this.loading == null) {
            this.loading = instantiate(this.pfLoading);
            this.node.addChild(this.loading);
            this.loading.getComponent(UITransform).setContentSize(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height);
        }
        if (this.notice == null) {
            this.notice = instantiate(this.pfNotice);
            this.node.addChild(this.notice);
            this.notice.getComponent(UITransform).setContentSize(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height);
            this.notice.getComponent(Notice).hide();
        }
        this.lbBalance.string = GameMgr.instance.numberWithCommas(APIMgr.instance.signinRes.balance);
    }
    loadPlayerInfo() {
        this.lbDbDeviceId.string = `Device Id: ${APIMgr.instance.deviceId}`
        this.lbBalance.string = GameMgr.instance.numberWithCommas(APIMgr.instance.signinRes.balance);
        this.lbLevel.string = `${APIMgr.instance.signinRes.level}`;
    }
    loadJackpotPool() {
        for (let i = 0; i < APIMgr.instance.gamesRes.list.length; i++) {
            GameMgr.instance.numberTo(this.jackpotPools[i], 0, APIMgr.instance.jackpotPoolRes[i], 2000);
        }
    }
    gameClickHandler(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[2]);
        
        this.loadNewScene(button.node.name)
    }
    loadNewScene(sceneName:string){
        this.loading.getComponent(Loading).show();
        AudioMgr.inst.bgm.stop();
        AudioMgr.inst.bgm.clip = null;
        this.removeListener();
        director.loadScene(sceneName);
    }
    removeListener() {
        GameEvent.RemoveEventListener("updatebalance");
    }
    onClick(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[2]);
        switch (button.node.name) {
            case 'btnShop':
                this.shop.active = true;
                break;
            case 'btnLuckyWheel':
                this.notice.getComponent(Notice).show({ title: 'Notice', content: "Comming soon!" }, () => {  });
                // this.loadNewScene('fruit');
                break;
            case 'btnBack':
                break;
            case 'btnMenu':
                this.notice.getComponent(Notice).show({ title: 'Notice', content: "Comming soon!" }, () => {  });
                break;
            case 'btnInbox':
                this.notice.getComponent(Notice).show({ title: 'Notice', content: "Comming soon!" }, () => {  });
                break;
        }
    }
    update(deltaTime: number) {
        if(this.countUpdate>10){
            this.countUpdate = 0;
            let date = new Date();
            let hour = date.getHours()<10? '0'+date.getHours() : date.getHours();
            let minutes = date.getMinutes()<10? '0'+date.getMinutes() : date.getMinutes();
            let seconds = date.getSeconds()<10? '0'+date.getSeconds() : date.getSeconds();
            this.lbCountdown.string = `${hour}:${minutes}:${seconds}`;
        }
        this.countUpdate++;
    }
}