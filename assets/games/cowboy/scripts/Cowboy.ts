import { _decorator, assert, AudioClip, Button, Component, director, Game, instantiate, Label, Node, Prefab, SpriteFrame, UIOpacity, UITransform } from 'cc';
import { GameEvent } from '../../../core/GameEvent';
import APIMgr from '../../../core/APIMgr';
import { Loading } from '../../../prefabs/loading/Loading';
import { AudioMgr } from '../../../core/AudioMgr';
import GameMgr from '../../../core/GameMgr';
import { CowboyReel } from './CowboyReel';
const { ccclass, property } = _decorator;
declare var io:any;

@ccclass('Cowboy')
export class Cowboy extends Component {
    @property({type:Prefab})
    pfLoading:Prefab | null = null;
    private loading: Node = null;
    @property({type:Node})
    jackpotNode:Node | null = null;
    @property({type:Node})
    btnCloseJackpot:Node | null = null;
    @property({type:Node})
    bonusNode:Node | null = null;
    @property({type:Node})
    btnCloseBonus:Node | null = null;
    @property({type:Node})
    freeSpinNode:Node | null = null;
    @property({type:Node})
    btnCloseFreeSpin:Node | null = null;
    @property({type:Node})
    bigWinNode:Node | null = null;
    @property({type:Node})
    btnCloseBigWin:Node | null = null;

    @property({type:Node})
    btnMission:Node | null = null;
    @property({type:Node})
    btnBetMinus:Node | null = null;
    @property({type:Node})
    btnBetPlus:Node | null = null;
    @property({type:Label})
    lbTotalBet:Label | null = null;
    @property({type:Label})
    lbWin:Label | null = null;
    @property({type:Node})
    btnMaxBet:Node | null = null;
    @property({type:Node})
    btnSpin:Node | null = null;
    
    //--top
    @property({type:Node})
    btnBack:Node | null = null;
    @property({type:Label})
    lbBalance:Label | null = null;
    @property({type:Node})
    btnShop:Node | null = null;

    @property({type:Label})
    lbLevel:Label | null = null;
    @property({type:Node})
    levelProgress:Node | null = null;
    @property({type:Node})
    btnMenu:Node | null = null;

    @property([Node])
    reels:Node[] = []
    @property([Prefab])
    items:Prefab[] = [];

    @property([AudioClip])
    arrAudioClips:AudioClip[] = []
    
    private readonly gameName = 'cowboy';
    private  webSocket: WebSocket | null = null;
    //--
    private loginRes = {
        "pid":"loginRes",
        "betOptions":[100],
        "maxBetLevel":0,
        "balance":1000222,
        "mission":[],
        "lineBet":100,//The bet that the user currently choosesm
        "jackpotPool":[],
        "extendData":{},
        "restoreData":{
           "freeSpinData":[],
           "bank":[]
        },
        "reelInfo":{
           "normal":[
              [
                 "5,9,0,10,6,7,8,2,4,10,5,7,9,10,6,2,7,9,10,7,2,0,6,7,2,7,2,6,8,7,10,10,11",
                 "5,1,9,2,10,6,4,10,5,0,2,10,6,2,10,8,0,2,10,6,2,10,11",
                 "10,1,2,5,8,9,2,10,10,0,7,5,10,8,7,10,2,0,7,10,4,2,7,2,7,10,8,7,5,11",
                 "10,1,2,5,8,4,10,10,6,2,8,10,0,10,2,10,6,7,5,10,0,2,9,6,5,11",
                 "7,1,9,7,2,9,10,4,8,5,2,7,5,10,0,8,6,0,10,7,5,9,10,10,11"
              ],
           ],
           "freeSpin":[
              [
                 "6,8,9,10,6,10,7,10,2,8,10,5,7,9,10,6,10,2,7,10,9,10,7,6",
                 "10,10,9,2,10,6,10,5,10,2,10,6,10,8,2,10,5,10,6,2,7,10",
                 "10,9,10,6,8,5,8,10,5,10,2,6,7,10,5,6,5,9",
                 "10,2,6,8,5,5,10,6,2,6,8,10,5,2,10,6,7,10,7,9",
                 "5,10,8,6,10,9,7,2,9,10,8,5,10,7,9,8,10"
              ],
           ]
        },
        "level":{
           "level":1,
           "exp":0,
           "maxExp":20000,
           "nextReward":0
        },
        "stack":[],
        "reelLevel":0
    };
    private spinRes = {
        "winType":"",
        "linebet":100,
        "prevBalance":997722,
        "totalWinBalance":500,
        "bonusPayout":[],
        "pick":{ },
        "reelList":[8,15,29,8,16],
        "mission":[],
        "level":{
           "level":1,
           "isLevelUp":false,
           "exp":5000,
           "maxExp":20000,
           "balance":0,
           "nextReward":0
        },
        "balance":995722,
        "spinType":"spin",
        "jackpotPool":[7500050],
        "reelWindow":[
           [
              "K",
              "coin",
              "J"
           ],
           [
              "J",
              "A",
              "Scatter"
           ],
           [
              "hoof",
              "Jackpot",
              "J"
           ],
           [
              "J",
              "pistol",
              "K"
           ],
           [
              "A",
              "pistol",
              "Scatter"
           ]
        ],
        "lineKeys":[ //index of item
           [2,4,10],
           [10,8,0],
           [5,11,10],
           [10,6,2],
           [8,6,0]
        ],
        "reelLevel":0,
        "bank":[0,0],
        "freeSpin":{
           "count":0,
           "start":false,
           "remain":0,
           "play":false,
           "nextSpinType":"spin",
           "wins":0,
           "resepin":{"total":0,"remain":0}
        },
        "payoutList":[
           {
              "winSymbol":"J",
              "pay":500,
              "lineNum":24,
              "matchCount":4,
              "symbolType":0,
              "multiple":1,
              "dividend":5,
              "winPosition":[2,3,8,9]
           }
        ],
        "scatterList":{
           "Scatter":[5,14]
        },
        "bonusList":{
           "coin":[1],
           "Scatter":[5,14]
        },
        "lockedPosition":{ },
        "nextJackpotPool":[],
        "pid":"spinRes"
     };

    start() {
        this.webSocket = null;
        GameEvent.AddEventListener('START_CONNECT',(data:any)=>{
            if(this.gameName===APIMgr.instance.currentGame.gameName.toLowerCase()){
                this.lbBalance.string = GameMgr.instance.numberWithCommas(APIMgr.instance.signinRes.balance);
                this.lbLevel.string = `lv: ${APIMgr.instance.signinRes.level}`;
                this.lbTotalBet.string = GameMgr.instance.numberWithCommas(this.loginRes.lineBet);
                this.lbWin.string = '';
                this.connect(data.url);
            }
        })
        //loading
        if(this.loading==null){
            this.loading = instantiate(this.pfLoading);
            this.loading.setPosition(0,0);
            this.loading.setRotation(0,0,0,0);
            this.node.addChild(this.loading);
            this.loading.getComponent(UITransform).setContentSize(this.node.getComponent(UITransform).width,this.node.getComponent(UITransform).height);
        }
        //button
        this.btnCloseJackpot.on(Button.EventType.CLICK,this.buttonHandler,this);
        this.jackpotNode.active = false;
        this.btnCloseBonus.on(Button.EventType.CLICK,this.buttonHandler,this);
        this.bonusNode.active = false;
        this.btnCloseFreeSpin.on(Button.EventType.CLICK,this.buttonHandler,this);
        this.freeSpinNode.active = false;
        this.btnCloseBigWin.on(Button.EventType.CLICK,this.buttonHandler,this);
        this.bigWinNode.active = false;

        //--
        this.btnBack.on(Button.EventType.CLICK, this.buttonHandler,this);
        this.btnBetMinus.on(Button.EventType.CLICK, this.buttonHandler,this);
        this.btnBetPlus.on(Button.EventType.CLICK, this.buttonHandler,this);

        //--init reels
        this.initReels();
        
        //
        AudioMgr.inst.play(this.arrAudioClips[0]);
    }
    private disconnect(){
        let wsk = this.webSocket;
        if (wsk) {
            wsk.onopen = null;
            wsk.onmessage = null;
            wsk.onerror = null;
            wsk.onclose = null;
            wsk.close();
        }
    }

    private connect (url: string) {
        const self = this;
        // this.webSocket = new WebSocket(`wss://slotk0w9ukeg.777invegas.com:8202`);
        this.webSocket = new WebSocket(`ws${url.replace('http','')}`);
        // this.webSocket.binaryType = 'blob';
        this.webSocket.onopen = function (evt) {
            console.log('WebSocket: onopen!');
            self.wsLogin();
        };

        this.webSocket.onmessage = function (evt) {
            console.log(`WebSocket: onmessage: ${evt.data}`);
            const res = APIMgr.instance.decodeData(evt.data);
            const json= JSON.parse(res);
            if(json!=null){
                self.messageHandler(json);
            }
            console.log(`WebSocket: res=${res}!`)
            // respLabel.string = binaryStr;
            // websocketLabel.string = 'WebSocket: onmessage'
        };

        this.webSocket.onerror = function (evt) {
           console.log('WebSocket: onerror');
        };

        this.webSocket.onclose = function (evt) {
            console.log('WebSocket: onclose');
            // After close, it's no longer possible to use it again,
            // if you want to send another request, you need to create a new websocket instance
            self.webSocket = null;
        };
    }

    sendMessgage (data:string) {
        console.log(`WebSocket: sent: ${data}`);
        if (!this.webSocket) { return; }
        if (this.webSocket.readyState === WebSocket.OPEN){
            this.webSocket.send(data);
        }
    }
    wsLogin(){
        const data = {
            pid:"login",
            token:APIMgr.instance.signinRes.authorization,
            gameId:APIMgr.instance.currentGame.id
        };
        this.sendMessgage(JSON.stringify(data));
        this.loading.getComponent(Loading).show();
    }
    wsSpin(){
        // let data = {
        //     pid:"spin",
        //     lineBet:100
        // }
        // const str = APIMgr.instance.encodeData(JSON.stringify(data));
        // this.sendMessgage(str);
        // this.jackpotNode.active = true;
        this.bigWinNode.active = true;
    }
    hideLoading(){
        this.loading.getComponent(Loading).hide();
    }
    wsSpinDebug(){
        let data = {
            pid:"spinDebug",
            lineBet:100,
            line:[0,0,0,0,0]
        }
        const str = APIMgr.instance.encodeData(JSON.stringify(data));
        this.sendMessgage(str);
    }
    wsJackpotPool(){
        let data = {
            pid:"jackpotPool",
            lineBet:100,
        }
        const str = APIMgr.instance.encodeData(JSON.stringify(data));
        this.sendMessgage(str);
    }
    messageHandler(data:any){
        switch(data.pid){
            case "loginRes":
                this.loginRes = data;
                this.lbBalance.string = GameMgr.instance.numberWithCommas(this.loginRes.balance);
                // this.lbLevel.string = `lv: ${this.loginRes.level}`;
                this.lbTotalBet.string = GameMgr.instance.numberWithCommas(this.loginRes.lineBet);
                break;
            case "spinRes":
                this.spinRes = data;
                break;
            case "spinDebug":
                this.spinRes = data;
                break;
            
        }
        this.loading.getComponent(Loading).hide();
    }

    setBettingLine(isPlus:boolean){
        let currentIndex = -1;
        for(let i=0;i<this.loginRes.betOptions.length;i++){
            if(this.loginRes.betOptions[i]==this.loginRes.lineBet){
                currentIndex = i;
                break;
            }
        }
        if(currentIndex==-1)return;
        if(isPlus){
            currentIndex++;
            if(currentIndex>=this.loginRes.betOptions.length){
                currentIndex = this.loginRes.betOptions.length-1;
            }
        } else {
            currentIndex--;
            if(currentIndex<=0){
                currentIndex = 0;
            }
        }
        this.lbTotalBet.string = GameMgr.instance.numberWithCommas(this.loginRes.betOptions[currentIndex]);
        this.loginRes.lineBet = this.loginRes.betOptions[currentIndex];
    }
    initReels(){
        let arr = [0,1,2,3,4,5,6,7,8,9,10,0,1,2,3,4,5,6];
        arr = GameMgr.instance.shuffle(arr);
        for(let i =0;i<this.reels.length;i++){
            arr = GameMgr.instance.shuffle(arr);
            this.reels[i].getComponent(CowboyReel).init(arr,this.items);
        }
    }
    buttonHandler(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[1]);
        switch (button.node.name) {
            case 'btnCloseJackpot':
                this.jackpotNode.active = false;
                break;
            case 'btnCloseBonus':
                this.bonusNode.active = false;
                break;
            case 'btnCloseFreeSpin':
                this.freeSpinNode.active = false;
                break;
            case 'btnCloseBigWin':
                this.bigWinNode.active = false;
                break;
            case 'btnBack':
                this.disconnect();
                director.loadScene('lobby');
                break;
            case 'btnBetMinus':
                this.setBettingLine(false);
                break;
            case 'btnBetPlus':
                this.setBettingLine(true);
                break;
        //     case 'tayduky':
        //         director.loadScene('cowboy')
        //         APIMgr.instance.setCurrentGame('demthuonghai');
        //         break;
        }
    }




    // update(deltaTime: number) {
        
    // }
}