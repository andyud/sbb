import { _decorator, AudioClip, Button, Component, director, Animation, instantiate, Label, Node, Prefab, SpriteFrame, Tween, UIOpacity, UITransform, tween } from 'cc';
import { GameEvent } from '../../../core/GameEvent';
import APIMgr from '../../../core/APIMgr';
import { Loading } from '../../../prefabs/loading/Loading';
import { AudioMgr } from '../../../core/AudioMgr';
import GameMgr from '../../../core/GameMgr';
import { CowboyReel } from './CowboyReel';
import { Notice } from '../../../prefabs/popups/scripts/Notice';
import { CowboySpinBtn } from './CowboySpinBtn';
import { CowboyItem } from './CowboyItem';
import { CowboyBonusItem } from './CowboyBonusItem';
const { ccclass, property } = _decorator;
declare var io: any;

@ccclass('Cowboy')
export class Cowboy extends Component {
    @property({ type: Prefab })
    pfLoading: Prefab | null = null;
    private loading: Node = null;
    @property({ type: Prefab })
    pfNotice: Prefab | null = null;
    private notice: Node = null;
    @property({ type: Node })
    jackpotNode: Node | null = null;
    @property({ type: Label })
    lbJackpotWinCoin: Label | null = null;
    @property({ type: Node })
    btnCloseJackpot: Node | null = null;

    @property({ type: Node })
    bonusResNode: Node | null = null;
    @property({ type: Node })
    bonusPlayNode: Node | null = null;
    @property({ type: Node })
    btnCloseBonusRes: Node | null = null;
    @property({ type: Label })
    lbBonusWinCoin: Label | null = null;

    @property({ type: Node })
    freeSpinNode: Node | null = null;
    @property({ type: Node })
    btnCloseFreeSpin: Node | null = null;
    @property({ type: Label })
    lbFreeSpinEff: Label | null = null;
    @property({ type: Label })
    lbFreeSpinCount: Label | null = null;
    //--freespin res
    @property({ type: Node })
    freeSpinResNode: Node | null = null;
    @property({ type: Label })
    lbFreeSpinWon: Label | null = null;
    @property({ type: Node })
    btnCloseFreeSpinRes: Node | null = null;

    @property({ type: Node })
    bigWinNode: Node | null = null;
    @property({ type: Node })
    btnCloseBigWin: Node | null = null;
    @property({ type: Label })
    lbBigWinCoin: Label | null = null;

    @property({ type: Node })
    btnMission: Node | null = null;
    @property({ type: Node })
    btnBetMinus: Node | null = null;
    @property({ type: Node })
    btnBetPlus: Node | null = null;
    @property({ type: Label })
    lbTotalBet: Label | null = null;
    @property({ type: Label })
    lbWin: Label | null = null;
    @property({ type: Node })
    btnMaxBet: Node | null = null;
    @property({ type: Node })
    btnSpin: Node | null = null;
    @property({ type: Node })
    btnAutoSpin: Node | null = null;
    @property({ type: Node })
    btnFreeSpin: Node | null = null;
    //--bonus
    @property({ type: Label })
    lbBonusRemain: Label | null = null;
    @property({ type: Label })
    lbBonusReward: Label | null = null;
    @property([Node])
    arrPlayBonusItem: Node[] = []
    private countBonusRemain = 0;

    //--top
    @property({ type: Node })
    btnBack: Node | null = null;
    @property({ type: Label })
    lbBalance: Label | null = null;
    @property({ type: Node })
    btnShop: Node | null = null;

    @property({ type: Label })
    lbLevel: Label | null = null;
    @property({ type: Node })
    levelProgress: Node | null = null;
    @property({ type: Node })
    btnMenu: Node | null = null;

    @property([Node])
    reels: Node[] = []
    @property([Prefab])
    items: Prefab[] = [];
    @property([SpriteFrame])
    icons: SpriteFrame[] = []
    @property([Node])
    lines: Node[] = [];
    lineEffects = [];
    lineEffectsIdx = -1;
    @property({ type: Node })
    lbCoinEff: Node | null = null;

    @property([AudioClip])
    arrAudioClips: AudioClip[] = []

    //--debug
    @property({ type: Node })
    btnDbBigWin: Node | null = null;
    @property({ type: Node })
    btnDbBonus: Node | null = null;
    @property({ type: Node })
    btnDbFreeSpin: Node | null = null;
    @property({ type: Node })
    btnDbJackpot: Node | null = null;


    private readonly gameName = 'cowboy';
    private webSocket: WebSocket | null = null;
    private isAutoSpin = false;
    private isSpin = false;//void press spin more time
    private isFreeSpin = false;
    private iTotalWinFreeSpin = 0;

    //--update
    private countUpdate = 0;
    private isUpdateLineWin = false;
    private isFirstStart = true;
    //--
    private loginRes = {
        "pid": "loginRes",
        "betOptions": [100],
        "maxBetLevel": 0,
        "balance": 1000222,
        "mission": [],
        "lineBet": 100,//The bet that the user currently choosesm
        "jackpotPool": [],
        "extendData": {},
        "restoreData": {
            "freeSpinData": [],
            "bank": []
        },
        "reelInfo": {
            "normal": [
                [
                    "5,9,0,10,6,7,8,2,4,10,5,7,9,10,6,2,7,9,10,7,2,0,6,7,2,7,2,6,8,7,10,10,11",
                    "5,1,9,2,10,6,4,10,5,0,2,10,6,2,10,8,0,2,10,6,2,10,11",
                    "10,1,2,5,8,9,2,10,10,0,7,5,10,8,7,10,2,0,7,10,4,2,7,2,7,10,8,7,5,11",
                    "10,1,2,5,8,4,10,10,6,2,8,10,0,10,2,10,6,7,5,10,0,2,9,6,5,11",
                    "7,1,9,7,2,9,10,4,8,5,2,7,5,10,0,8,6,0,10,7,5,9,10,10,11"
                ],
            ],
            "freeSpin": [
                [
                    "6,8,9,10,6,10,7,10,2,8,10,5,7,9,10,6,10,2,7,10,9,10,7,6",
                    "10,10,9,2,10,6,10,5,10,2,10,6,10,8,2,10,5,10,6,2,7,10",
                    "10,9,10,6,8,5,8,10,5,10,2,6,7,10,5,6,5,9",
                    "10,2,6,8,5,5,10,6,2,6,8,10,5,2,10,6,7,10,7,9",
                    "5,10,8,6,10,9,7,2,9,10,8,5,10,7,9,8,10"
                ],
            ]
        },
        "level": {
            "level": 1,
            "exp": 0,
            "maxExp": 20000,
            "nextReward": 0
        },
        "stack": [],
        "reelLevel": 0
    };
    private spinRes = {
        "winType": "",
        "linebet": 100,
        "prevBalance": 997722,
        "totalWinBalance": 0,
        "bonusPayout": [
            {
                "balance": 100,
                "bonusType": 'bonus',
                "extendData": [50, 10, 60],
                "matchCount": 3,
                "symbolName": 'bonus'
            }
        ],
        "pick": {},
        "reelList": [8, 15, 29, 8, 16],
        "mission": [],
        "level": {
            "level": 1,
            "isLevelUp": false,
            "exp": 5000,
            "maxExp": 20000,
            "balance": 0,
            "nextReward": 0
        },
        "balance": 995722,
        "spinType": "spin",
        "jackpotPool": [7500050],
        "reelWindow": [
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
        "lineKeys": [ //index of item
            [2, 4, 10],
            [10, 8, 0],
            [5, 11, 10],
            [10, 6, 2],
            [8, 6, 0]
        ],
        "reelLevel": 0,
        "bank": [0, 0],
        "freeSpin": {
            "count": 0,
            "start": false,
            "remain": 0,
            "play": false,
            "nextSpinType": "spin",
            "wins": 0,
            "resepin": { "total": 0, "remain": 0 }
        },
        "payoutList": [
            {
                "winSymbol": "J",
                "pay": 500,
                "lineNum": 24,
                "matchCount": 4,
                "symbolType": 0,
                "multiple": 1,
                "dividend": 5,
                "winPosition": [2, 3, 8, 9]
            }
        ],
        "scatterList": {
            "Scatter": [5, 14]
        },
        "bonusList": {
            "coin": [1],
            "Scatter": [5, 14]
        },
        "lockedPosition": {},
        "nextJackpotPool": [],
        "pid": "spinRes"
    };
    private tableMatrix = [
        [2, 2, 2, 2, 2],
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0]
    ];
    private serverMatrix = [
        [0, 3, 6, 9, 12],
        [1, 4, 7, 10, 13],
        [2, 5, 8, 11, 14]
    ]
    private lineMatrix = [
        [1, 1, 1, 1, 1],//0
        [2, 2, 2, 2, 2],
        [0, 0, 0, 0, 0],//2
        [0, 1, 2, 1, 0],
        [2, 1, 0, 1, 2],
        [1, 2, 2, 2, 1],
        [1, 0, 0, 0, 1],//6
        [2, 2, 1, 0, 0],
        [0, 0, 1, 2, 2],//8
        [1, 0, 1, 2, 1],//9
        [0, 0, 1, 2, 2],
        [2, 1, 1, 1, 2],//11
        [0, 1, 1, 1, 0],//12
        [2, 1, 2, 1, 2],//13
        [0, 1, 0, 1, 0],//14
        [1, 1, 2, 1, 1],//15
        [1, 1, 0, 1, 1],//16
        [2, 2, 0, 2, 2],//17
        [0, 0, 2, 0, 0],//18
        [2, 2, 0, 2, 2],//19
        [0, 2, 2, 2, 0],//20
        [1, 2, 0, 2, 0],//21    
        [1, 0, 2, 0, 1],//22
        [2, 0, 2, 0, 2],//23
        [0, 2, 0, 2, 0]//24
    ];
    //1. init ---------------------------------------------------------------------------------------------
    start() {
        this.webSocket = null;
        APIMgr.instance.setCurrentGame(this.gameName);
        GameEvent.AddEventListener('START_CONNECT', (data: any) => {
            if (this.gameName === APIMgr.instance.currentGame.gameName.toLowerCase()) {
                this.lbBalance.string = GameMgr.instance.numberWithCommas(APIMgr.instance.signinRes.balance);
                this.lbLevel.string = `lv: ${APIMgr.instance.signinRes.level}`;
                this.lbTotalBet.string = GameMgr.instance.numberWithCommas(this.loginRes.lineBet * 25);
                this.lbWin.string = '0';
                this.connect(data.url);
            }
        })
        //loading
        if (this.loading == null) {
            this.loading = instantiate(this.pfLoading);
            this.node.addChild(this.loading);
            this.loading.getComponent(UITransform).setContentSize(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height);
            this.loading.getComponent(Loading).show();
        }
        if (this.notice == null) {
            this.notice = instantiate(this.pfNotice);
            this.node.addChild(this.notice);
            this.notice.getComponent(UITransform).setContentSize(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height);
            this.notice.getComponent(Notice).hide();
        }
        //button
        this.btnCloseJackpot.on(Button.EventType.CLICK, this.onCloseEnd, this);
        this.jackpotNode.active = false;
        this.btnCloseBonusRes.on(Button.EventType.CLICK, this.onCloseEnd, this);
        this.bonusResNode.active = false;
        this.bonusPlayNode.active = false;

        this.btnCloseFreeSpin.on(Button.EventType.CLICK, this.onCloseContinue, this);
        this.freeSpinNode.active = false;
        this.btnCloseBigWin.on(Button.EventType.CLICK, this.onCloseEnd, this);
        this.bigWinNode.active = false;
        this.btnCloseFreeSpinRes.on(Button.EventType.CLICK, this.onCloseEnd, this);
        this.freeSpinResNode.active = false;

        //--
        this.btnBack.on(Button.EventType.CLICK, this.buttonHandler, this);
        this.btnBetMinus.on(Button.EventType.CLICK, this.buttonHandler, this);
        this.btnBetPlus.on(Button.EventType.CLICK, this.buttonHandler, this);
        this.btnMaxBet.on(Button.EventType.CLICK, this.buttonHandler, this);
        this.btnSpin.on(Button.EventType.CLICK, this.buttonHandler, this);
        this.btnFreeSpin.on(Button.EventType.CLICK, this.buttonHandler, this);
        this.btnSpin.getComponent(CowboySpinBtn).init((val) => {
            if (val == 0) {
            } else if (val == 1) {
                this.spin(false, []);
            } else if (val == 2) {
                this.setAutoSpin(true);
            }
        });
        this.btnAutoSpin.on(Button.EventType.CLICK, this.buttonHandler, this);
        //--debug
        this.btnDbBigWin.on(Button.EventType.CLICK, this.onClick, this);
        this.btnDbBonus.on(Button.EventType.CLICK, this.onClick, this);
        this.btnDbFreeSpin.on(Button.EventType.CLICK, this.onClick, this);
        this.btnDbJackpot.on(Button.EventType.CLICK, this.onClick, this);

        //--set temp reels
        let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 10, 1, 2, 3, 4, 5, 6];
        arr = GameMgr.instance.shuffle(arr);
        for (let i = 0; i < this.reels.length; i++) {
            arr = GameMgr.instance.shuffle(arr);
            this.reels[i].getComponent(CowboyReel).init(arr, this.items);
            this.reels[i].getComponent(CowboyReel).setReelCallback(this.endSpin.bind(this));
        }
        //--bonus
        for (let i = 0; i < this.arrPlayBonusItem.length; i++) {
            this.arrPlayBonusItem[i].getComponent(CowboyBonusItem).init((idx: number) => {
                //count to end
                this.countBonusRemain--;
                if (this.countBonusRemain == 0) {//end
                    const timeout = setTimeout(() => {
                        clearTimeout(timeout);
                        this.bonusPlayNode.active = false;
                        this.bonusResNode.active = true;
                        GameMgr.instance.numberTo(this.lbBonusWinCoin, 0, this.spinRes.totalWinBalance, 2000);
                        // AudioMgr.inst.playOneShot(this.arrAudioClips[3]);
                    }, 2000);
                } else {
                    this.lbBonusRemain.string = `${this.countBonusRemain}`;
                    let val = this.spinRes.bonusPayout[0].extendData[this.countBonusRemain - 1];
                    this.arrPlayBonusItem[idx].getComponent(CowboyBonusItem).setValue(val);
                }
            }, i);
        }
        this.isFirstStart = false;
        // AudioMgr.inst.play(this.arrAudioClips[0]);
    }
    //2. network -------------------------------------------------------------------------------------------
    private disconnect() {
        let wsk = this.webSocket;
        if (wsk) {
            wsk.onopen = null;
            wsk.onmessage = null;
            wsk.onerror = null;
            wsk.onclose = null;
            wsk.close();
        }
    }
    private connect(url: string) {
        const self = this;
        // this.webSocket = new WebSocket(`wss://slotk0w9ukeg.777invegas.com:8202`);
        this.webSocket = new WebSocket(`ws${url.replace('http', '')}`);
        // this.webSocket.binaryType = 'blob';
        this.webSocket.onopen = function (evt) {
            console.log('WebSocket: onopen!');
            self.wsLogin();
        };

        this.webSocket.onmessage = function (evt) {
            console.log(`WebSocket: onmessage: ${evt.data}`);
            const res = APIMgr.instance.decodeData(evt.data);
            const json = JSON.parse(res);
            if (json != null) {
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
    sendMessgage(data: string) {
        console.log(`WebSocket: sent: ${data}`);
        if (!this.webSocket) { return; }
        if (this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.send(data);
        }
    }
    wsLogin() {
        const data = {
            pid: "login",
            token: APIMgr.instance.signinRes.authorization,
            gameId: APIMgr.instance.currentGame.id
        };
        this.sendMessgage(JSON.stringify(data));
    }
    wsSpin() {
        let data = {
            pid: "spin",
            lineBet: 100
        }
        const str = APIMgr.instance.encodeData(JSON.stringify(data));
        this.sendMessgage(str);
    }
    hideLoading() {
        this.loading.getComponent(Loading).hide();
    }
    wsSpinDebug(arr: any) {
        let data = {
            pid: "spinDebug",
            lineBet: 100,
            line: arr
        }
        const str = APIMgr.instance.encodeData(JSON.stringify(data));
        this.sendMessgage(str);
    }
    messageHandler(data: any) {
        console.log(JSON.stringify(data));
        switch (data.pid) {
            case "loginRes":
                this.loginRes = data;
                this.lbBalance.string = GameMgr.instance.numberWithCommas(this.loginRes.balance);
                // this.lbLevel.string = `lv: ${this.loginRes.level}`;
                this.lbTotalBet.string = GameMgr.instance.numberWithCommas(this.loginRes.lineBet * 25);
                //clear & add new
                if (this.loginRes && this.loginRes.reelInfo && this.loginRes.reelInfo.normal && this.loginRes.reelInfo.normal.length > 0) {
                    let arr = this.loginRes.reelInfo.normal[0];
                    for (let i = 0; i < arr.length; i++) {
                        this.reels[i].removeAllChildren();
                        let arrStr = arr[i].split(',');
                        let arrTemp = [];
                        for (let j = 0; j < arrStr.length; j++) {
                            arrTemp.push(parseInt(arrStr[j]));
                        }
                        this.reels[i].getComponent(CowboyReel).init(GameMgr.instance.shuffle(arrTemp), this.items);
                    }
                }
                break;
            case "spinRes":
                this.spinRes = data;
                //runReels
                let self = this;
                //--add result
                if (this.spinRes && this.spinRes.lineKeys && this.spinRes.lineKeys.length > 0) {
                    for (let i = 0; i < this.spinRes.lineKeys.length; i++) {
                        let arr = this.spinRes.lineKeys[i];
                        let startIdx = this.reels[i].children.length - 1;
                        for (let j = 0; j < arr.length; j++) {
                            const texId = arr[j]
                            const tex = this.icons[texId];
                            this.reels[i].children[startIdx - j].getComponent(CowboyItem).setTexture(tex);
                        }
                    }
                }
                Promise.all(self.reels.map(function (reel, index) {
                    reel.getComponent(CowboyReel).spin(index, 1);
                }))
                break;
            case "spinDebug":
                this.spinRes = data;
                break;
        }
        this.loading.getComponent(Loading).hide();
    }
    //3. action ---------------------------------------------------------------------------------
    onCloseEnd(button: Button) {
        switch (button.node.name) {
            case 'btnCloseJackpot':
                this.jackpotNode.active = false;
                break;
            case 'btnCloseBonusRes':
                this.bonusResNode.active = false;
                break;
            case 'btnCloseBigWin':
                this.bigWinNode.active = false;
                break;
            case 'btnCloseFreeSpinRes':
                this.freeSpinResNode.active = false;
                this.btnFreeSpin.active = false;
                this.setAutoSpin(true);
                break;
        }
        this.preSpin();
    }

    onCloseContinue(button: Button) {
        switch (button.node.name) {
            case 'btnCloseFreeSpin':
                this.freeSpinNode.active = false;
                this.setAutoSpin(true);
                this.preSpin();
                break;
        }
    }
    onClick(button: Button) {
        // AudioMgr.inst.playOneShot(this.arrAudioClips[1]);
        switch (button.node.name) {
            case 'btnDbBigWin':
                this.spin(true, [9, 7, 20, 6, 8]);
                break;
            case 'btnDbBonus':
                this.spin(true, [9, 7, 20, 6, 8]);
                break;
            case 'btnDbFreeSpin':
                this.spin(true, [3, 10, 17, 13, 15]);
                break;
            case 'btnDbJackpot':
                this.spin(true, [18, 3, 2, 2, 2]);
                break;
        }
    }
    buttonHandler(button: Button) {
        // AudioMgr.inst.playOneShot(this.arrAudioClips[1]);
        switch (button.node.name) {
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
            case 'btnMaxBet':
                this.loginRes.lineBet = this.loginRes.betOptions[this.loginRes.betOptions.length - 1];
                this.lbTotalBet.string = GameMgr.instance.numberWithCommas(this.loginRes.lineBet * 25);
                break;
            case 'btnAutoSpin':
                this.setAutoSpin(false);
                break;
            case 'btnFreeSpin':
                this.spin(false, []);
                break
        }
    }
    setButtonInteractable(isDisable: boolean) {
        this.btnSpin.getComponent(Button).interactable = isDisable;
    }
    setBettingLine(isPlus: boolean) {
        let currentIndex = -1;
        for (let i = 0; i < this.loginRes.betOptions.length; i++) {
            if (this.loginRes.betOptions[i] == this.loginRes.lineBet) {
                currentIndex = i;
                break;
            }
        }
        if (currentIndex == -1) return;
        if (isPlus) {
            currentIndex++;
            if (currentIndex >= this.loginRes.betOptions.length) {
                currentIndex = this.loginRes.betOptions.length - 1;
            }
        } else {
            currentIndex--;
            if (currentIndex <= 0) {
                currentIndex = 0;
            }
        }
        this.lbTotalBet.string = GameMgr.instance.numberWithCommas(this.loginRes.betOptions[currentIndex] * 25);
        this.loginRes.lineBet = this.loginRes.betOptions[currentIndex];
    }


    updateMainBalance() {
        this.lbBalance.string
    }
    setAutoSpin(isAuto: boolean) {
        this.isAutoSpin = isAuto;
        this.btnSpin.active = !isAuto;
        this.btnAutoSpin.active = isAuto;
    }

    onNoticeClose(data: string = "") {

    }

    updateLineWinEffect() {
        if(this.isUpdateLineWin){
            let timeout1 = setTimeout(()=>{//hide 500 -> show 500*2
                clearTimeout(timeout1);
                for (let i = 0; i < this.lineEffects.length; i++) {
                    this.lineEffects[i].active = false;
                }
            },500);
            
            let timeOut2 = setTimeout(()=>{
                clearTimeout(timeOut2);
                if(this.lineEffectsIdx<this.lineEffects.length){
                    this.lineEffects[this.lineEffectsIdx].active = true;
                    this.lineEffectsIdx++;
                    if (this.lineEffectsIdx >= this.lineEffects.length) {
                        this.lineEffectsIdx = 0;
                    }
                    this.updateLineWinEffect();
                }
            },1000)
        }
    }


    //4. core gameplay
    preSpin() {
        //active button spin
        this.isSpin = false;
        this.setButtonInteractable(true);
        //
        if (this.isAutoSpin) {
            const timeOut = setTimeout(() => {
                clearTimeout(timeOut);
                this.freeSpinNode.active = false;
                this.bigWinNode.active = false;
                this.bonusResNode.active = false;
                this.jackpotNode.active = false;
                this.spin(false, []);
            }, 2000)
        }
    }
    spin(isDebug: boolean = false, data: any) {
        //1--clear result
        //line effect
        this.isUpdateLineWin = false;
        for (let i = 0; i < this.lineEffects.length; i++) {
            this.lineEffects[i].active = false;
        }
        this.lineEffects = [];

        //hide line
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].active = false;
        }

        //eff
        this.lbCoinEff.getComponent(UIOpacity).opacity = 0;
        
        if (this.spinRes && this.spinRes.freeSpin && this.spinRes.freeSpin.remain && this.spinRes.freeSpin.remain > 1) {
            this.lbFreeSpinCount.string = `${this.spinRes.freeSpin.remain}`;
        }

        //2. update balance
        if (!this.isFreeSpin) {
            if (this.isFirstStart) {
                this.isFirstStart = false;
                let newBalance = this.loginRes.balance - this.loginRes.lineBet * 25;
                this.lbBalance.string = GameMgr.instance.numberWithCommas(newBalance);
            } else {
                let newBalance = this.spinRes.balance - this.spinRes.linebet * 25;
                this.lbBalance.string = GameMgr.instance.numberWithCommas(newBalance);
            }
        }

        //check balance
        if (this.loginRes.balance < this.loginRes.lineBet) {
            this.notice.getComponent(Notice).show({ title: 'Notice', content: 'Not enough balance' }, this.onNoticeClose.bind(this));
            return;
        }
        if (!this.isSpin) {
            this.isSpin = true;
            if (isDebug) {
                this.wsSpinDebug(data);
            } else {
                this.wsSpin();
            }
            this.setButtonInteractable(false);
            // AudioMgr.inst.playOneShot(this.arrAudioClips[9]);
        }
    }
    endSpin() {
        //1. set icon result (effect same icon -> move -> it not changed)
        if (this.spinRes && this.spinRes.lineKeys && this.spinRes.lineKeys.length > 0) {
            for (let i = 0; i < this.spinRes.lineKeys.length; i++) {
                let arr = this.spinRes.lineKeys[i];
                let startIdx = 2;
                for (let j = 0; j < arr.length; j++) {
                    const texId = arr[j]
                    const tex = this.icons[texId];
                    this.reels[i].children[startIdx - j].getComponent(CowboyItem).setTexture(tex);
                }
                this.reels[i].setPosition(this.reels[i].getPosition().x, 20);
            }

        } else {
            console.error('result error')
        }
        //2. show result
        //--main balance
        let totalWin = GameMgr.instance.numberWithCommas(this.spinRes.totalWinBalance);
        this.lbWin.string = totalWin;
        this.lbBalance.string = GameMgr.instance.numberWithCommas(this.spinRes.balance);

        //coin effect
        if (this.spinRes.totalWinBalance > 0) {
            this.lbCoinEff.getComponent(Label).string = `+${totalWin}`;
            this.lbCoinEff.getComponent(Animation).play();
        }

        //line win
        this.lineEffects = [];
        for (let i = 0; i < this.spinRes.payoutList.length; i++) {
            const lineIdx = this.spinRes.payoutList[i].lineNum;
            const line = this.lines[lineIdx];
            this.lineEffects.push(line);
            line.active = true;
        }
        //--run effect
        if (this.lineEffects.length > 0) {
            this.lineEffectsIdx = 0;
            this.isUpdateLineWin = true;
            this.updateLineWinEffect();
        }
        //--result type
        switch (this.spinRes.winType) {
            case 'Jackpot':
                this.jackpotNode.active = true;
                GameMgr.instance.numberTo(this.lbJackpotWinCoin, 0, this.spinRes.totalWinBalance, 2000);
                // AudioMgr.inst.playOneShot(this.arrAudioClips[6]);
                break;
            case 'Big Win':
            case 'Ultra':
            case 'Mega Win':
            case 'Super Win':
                this.bigWinNode.active = true;
                GameMgr.instance.numberTo(this.lbBigWinCoin, 0, this.spinRes.totalWinBalance, 2000);
                // AudioMgr.inst.playOneShot(this.arrAudioClips[6]);
                break;
            default:
                //freespin
                if (this.spinRes.freeSpin && this.spinRes.freeSpin.remain && this.spinRes.freeSpin.remain > 0) {
                    this.lbFreeSpinCount.string = `${this.spinRes.freeSpin.remain}`;
                    this.isFreeSpin = true;
                    if (this.spinRes.freeSpin.count === this.spinRes.freeSpin.remain) {//First
                        this.iTotalWinFreeSpin = 0;
                        this.freeSpinNode.active = true;
                        this.lbFreeSpinEff.string = `${this.spinRes.freeSpin.remain}`;
                        this.btnFreeSpin.active = true;
                        this.btnSpin.active = false;
                        this.btnAutoSpin.active = false;
                        // AudioMgr.inst.playOneShot(this.arrAudioClips[5]);
                    } else {
                        this.iTotalWinFreeSpin += this.spinRes.totalWinBalance;
                        if (this.btnFreeSpin.active == false) {
                            this.btnFreeSpin.active = true;
                            this.btnSpin.active = false;
                            this.btnAutoSpin.active = false;
                            if(!this.isAutoSpin){
                                this.setAutoSpin(true)
                            }
                        }
                        this.preSpin();
                    }
                } else if (this.isFreeSpin && this.spinRes.freeSpin.remain == 0) { //end free spin
                    this.isFreeSpin = false;
                    this.freeSpinResNode.active = true;
                    GameMgr.instance.numberTo(this.lbFreeSpinWon, 0, this.iTotalWinFreeSpin, 2000);
                    // AudioMgr.inst.playOneShot(this.arrAudioClips[5]);
                }
                else if (this.spinRes.bonusPayout && this.spinRes.bonusPayout.length>0 && this.spinRes.bonusPayout[0].extendData) {
                    this.bonusPlayNode.active = true;
                    this.countBonusRemain = this.spinRes.bonusPayout[0].extendData.length;
                    this.lbBonusRemain.string = `${this.countBonusRemain}`;
                    this.lbBonusReward.string = `${this.spinRes.bonusPayout[0].balance}`;
                    for(let i=0;i<this.arrPlayBonusItem.length;i++){
                        this.arrPlayBonusItem[i].getComponent(CowboyBonusItem).reset();
                    }
                } else {
                    this.preSpin();
                }
                break;
        }
    }
}