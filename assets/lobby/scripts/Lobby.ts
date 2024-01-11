import { _decorator, Button, Component, director, Label, Node, AudioClip, Prefab, instantiate, UITransform, ScrollView, Animation } from 'cc';
import APIMgr from '../../core/APIMgr';
import { AudioMgr } from '../../core/AudioMgr';
import GameMgr from '../../core/GameMgr';
import { GameEvent } from '../../core/GameEvent';
import { Loading } from '../../prefabs/loading/Loading';
import { Notice } from '../../prefabs/popups/scripts/Notice';
import { LobbyStage } from './LobbyStage';
import { LobbyOption } from './LobbyOption';
import { LobbyInbox } from './LobbyInbox';
import { LobbyRanking } from './LobbyRanking';
import { LobbyMiniGame } from './LobbyMiniGame';
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
    btnGift: Node | null = null;
    @property({ type: Node })
    btnMenu: Node | null = null;
    @property({type:Node})
    btnMiniGame: Node | null = null;
    @property({type:Node})
    btnMission: Node | null = null;
    @property({ type: Node })
    btnInbox: Node | null = null;
    @property({ type: Node })
    btnRanking: Node | null = null;
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
    @property({ type: Node })
    levelProgress: Node | null = null;
    @property({type:Node})
    btnTicket:Node |null = null;
    @property({type:Label})
    lbTicket:Label | null = null;

    @property({ type: Label })
    lbDbDeviceId: Label | null = null;

    @property({type:Node})
    contentCenter: Node | null = null;
    @property([AudioClip])
    arrAudioClips: AudioClip[] = [];
    @property([Label])
    jackpotPools: Label[] = [];
    private countUpdate = 0;
    @property([Node])
    arrGame:Node[] = []
    @property({type:ScrollView})
    maps:ScrollView | null = null;
    //--minigame
    @property({type:Node})
    ppMiniGame: Node | null = null;
    @property({type:Node})
    ppOption:Node | null = null;
    @property({type:Node})
    ppInbox:Node | null = null;
    @property({type:Node})
    ppRanking:Node | null = null;
    start() {
        //--add listener
        for (let i = 0; i < this.arrGame.length; i++) {
            this.arrGame[i].on(Button.EventType.CLICK, this.gameClickHandler, this);
        }

        this.loadPlayerInfo();
        this.loadJackpotPool();
        if (GameMgr.instance.isDebugMode) {
            this.lbDbDeviceId.node.active = true;
        } else {
            this.lbDbDeviceId.node.active = false;
        }
        AudioMgr.inst.setAudioSouce('main', this.arrAudioClips[1]);
        AudioMgr.inst.playBgm();
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
        this.btnRanking.on(Button.EventType.CLICK, this.onClick, this);
        this.btnMiniGame.on(Button.EventType.CLICK, this.onClick, this);
        this.btnTicket.on(Button.EventType.CLICK, this.onClick, this);
        this.btnMission.on(Button.EventType.CLICK, this.onClick, this);
        //--get jackpot pool
        GameEvent.AddEventListener("updatebalance", (balance: number) => {
            GameMgr.instance.numberTo(this.lbBalance, 0, balance, 1000);
        });
        this.btnGift.active = false;
        this.btnGift.on(Button.EventType.CLICK, this.onClick, this);
        GameEvent.AddEventListener("rewardlist", (arr: any) => {
            if(arr.length>0){
                this.btnGift.active = true;
            } else {
                this.btnGift.active = false;
            }
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

        //--responsive size
        let width = this.maps.getComponent(UITransform).width;
        let height= this.maps.getComponent(UITransform).height;
        this.maps.content.getComponent(UITransform).width = width*3;
        for(let i=0;i<this.maps.content.children.length;i++){
            this.maps.content.children[i].setPosition(width/2 + i*width,0);
            this.maps.content.children[i].getComponent(UITransform).setContentSize(width,height);
            this.maps.content.children[i].children[0].setPosition(0,0);
        }

        APIMgr.instance.getReward();

        //--menu option
        this.ppMiniGame.getComponent(LobbyMiniGame).init(this.arrAudioClips[2],()=>{
            this.loadNewScene('fruit');
        });
        this.ppOption.getComponent(LobbyOption).init(this.arrAudioClips[2]);
        this.ppInbox.getComponent(LobbyInbox).init(this.arrAudioClips[2]);
        this.ppRanking.getComponent(LobbyRanking).init(this.arrAudioClips[2]);

        //get balance
        this.loading.getComponent(Loading).show();
        APIMgr.instance.getUserInfo((success:boolean,res:any)=>{
            if(success){
                GameMgr.instance.numberTo(this.lbBalance,0,res.balance,1000);
                this.lbLevel.string = `lv: ${res.level}`;
                let maxWidth = this.levelProgress.parent.getComponent(UITransform).width; //<=>100
                if(res.maxExp<res.exp){
                    res.maxExp = res.exp;
                }
                this.levelProgress.getComponent(UITransform).width = (res.exp/res.maxExp)*maxWidth;
                this.lbTicket.string = `${res.ticket>0?res.ticket:0}`;
            }
            this.loading.getComponent(Loading).hide();
        })
    }
    loadPlayerInfo() {
        this.lbDbDeviceId.string = `Device Id: ${APIMgr.instance.deviceId}`
        this.lbBalance.string = GameMgr.instance.numberWithCommas(APIMgr.instance.signinRes.balance);
        this.lbLevel.string = `lv: ${APIMgr.instance.signinRes.level}`;
    }
    loadJackpotPool() {
        for (let i = 0; i < APIMgr.instance.gamesRes.list.length; i++) {
            GameMgr.instance.numberTo(this.jackpotPools[i], 0, APIMgr.instance.jackpotPoolRes[i], 2000);
        }
    }
    gameClickHandler(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[2]);
        let gameid = button.node.getComponent(LobbyStage).gameid;
        if(button.node.getComponent(LobbyStage).isLock()){
            this.notice.getComponent(Notice).show({ title: 'Notice', content: "Please unlock first!" }, () => {  });
            return;
        }
        if(gameid<20){
            this.loadNewScene('WildKong');
        } else if(gameid<30){
            this.loadNewScene('snowQueen');
        } else {
            this.loadNewScene('cowboy');
        }
    }
    openKong(){
        AudioMgr.inst.playOneShot(this.arrAudioClips[2]);
        this.loadNewScene('WildKong');
    }
    openSnow(){
        AudioMgr.inst.playOneShot(this.arrAudioClips[2]);
        this.loadNewScene('snowQueen');
    }
    openCowboy(){
        AudioMgr.inst.playOneShot(this.arrAudioClips[2]);
        this.loadNewScene('cowboy');
    }
    loadNewScene(sceneName:string){
        //--remove listener
        GameEvent.RemoveEventListener('updatebalance');
        GameEvent.RemoveEventListener('rewardlist');

        this.loading.getComponent(Loading).show();
        AudioMgr.inst.stop();
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
            case 'btnGift':
                this.btnGift.active = false;
                break;
            case 'btnLuckyWheel':
                this.notice.getComponent(Notice).show({ title: 'Notice', content: "Comming soon!" }, () => {  });
                break;
            case 'btnBack':
                break;
            case 'btnMenu':
                this.ppOption.active = true;
                this.ppOption.getComponent(LobbyOption).bg.active = true;
                this.ppOption.getComponent(LobbyOption).show();
                break;
            case 'btnInbox':
                this.ppInbox.active = true;
                this.ppInbox.getComponent(LobbyInbox).bg.active = true;
                this.ppInbox.getComponent(LobbyInbox).show();
                break;
            case 'btnRanking':
                this.ppRanking.active = true;
                this.ppRanking.getComponent(LobbyRanking).bg.active = true;
                this.ppRanking.getComponent(LobbyRanking).show();
                break;
            case 'mission':
                this.notice.getComponent(Notice).show({ title: 'Notice', content: "Comming soon!" }, () => {  });
                break;
            case 'minigame': case 'btnTicket':
                this.loading.getComponent(Loading).show();
                APIMgr.instance.puzzleStart((iSuccess:boolean,res:any)=>{
                    this.loading.getComponent(Loading).hide();
                    if(iSuccess){
                        if(res.ticket && res.ticket>0){
                            this.ppMiniGame.active = true;
                            this.ppMiniGame.getComponent(LobbyMiniGame).bg.active = true;
                            this.ppMiniGame.getComponent(LobbyMiniGame).show();
                            this.ppMiniGame.getComponent(LobbyMiniGame).lbTicket.string = `${res.ticket}`;
                        } else {
                            this.notice.getComponent(Notice).show({ title: 'System Info', content: 'There are no tickets!' }, () => {  });
                        }
                    } else {
                        this.notice.getComponent(Notice).show({ title: 'System Info', content: res }, () => {  });
                    }
                });
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