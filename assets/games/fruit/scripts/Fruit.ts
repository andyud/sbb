import { _decorator, Component, EventTouch, Graphics, instantiate, Node, Prefab, SpriteFrame, UITransform, Vec2, AudioClip, director, Button, Label, Vec3, tween, UIOpacity } from 'cc';
import GameMgr from '../../../core/GameMgr';
import { FruitItem } from './FruitItem';
import { GameEvent } from '../../../core/GameEvent';
import { AudioMgr } from '../../../core/AudioMgr';
import { FruitTutorial } from './FruitTutorial';
import { FruitResult } from './FruitResult';
import { FruitQuest } from './FruitQuest';
import { FruitOutOfMove } from './FruitOutOfMove';
import { FruitItemTop } from './FruitItemTop';
import {FruitPointEff } from './FruitPointEff';
import APIMgr from '../../../core/APIMgr';
import { FruitPause } from './FruitPause';
import { FruitTextEffect } from './FruitTextEffect';
import { FruitLevels } from './FruitLevels';
const { ccclass, property } = _decorator;

@ccclass('Fruit')
export class Fruit extends Component {
    @property({ type: Node })
    board: Node | null = null;
    @property([Prefab])
    pfItems: Prefab[] = [];
    @property({ type: Prefab })
    pfItemTop: Prefab | null = null;
    @property({type:Node})
    infoNode: Node | null = null;
    @property({type:Node})
    blockNode: Node | null = null;
    @property({type:Node})
    tutorial: Node | null = null;
    @property({ type: Label })
    lbMoves: Label | null = null;
    @property([SpriteFrame])
    icons: SpriteFrame[] = []
    @property({type:Node})
    infoListItem:Node | null = null;

    @property({ type: Graphics })
    graphics1: Graphics | null = null;
    @property({ type: Graphics })
    graphics2: Graphics | null = null;
    @property({ type: Node })
    effLayer: Node | null = null;
    @property({ type: Label })
    lbScore: Label | null = null;
    @property({type:Node})
    progressbar:Node | null = null;
    @property({ type: Node })
    btnPause: Node | null = null;
    @property([AudioClip])
    arrAudioClips: AudioClip[] = [];
    startPoint: Vec2 = null;
    endPoint: Vec2 = null;

    //--loading --------------------
    @property({type:Node})
    loading:Node | null = null;
    @property({type:Node})
    loadingBar:Node | null = null;
    // @property({type:Node})
    // star:Node | null = null;
    private percent = 0;
    //--end loading ----------------
    @property({type:Node})
    ppResult: Node | null = null;
    @property({type:Node})
    ppQuest: Node | null = null;
    @property({type:Node})
    ppOutOfMove:Node | null = null;
    @property({type:Node})
    ppPause: Node | null = null;
    iCurrentLevel = 0;
    levels = null;

    //--effect
    @property({type:Prefab})
    pfPointEff:Prefab | null = null;
    @property({type:Node})
    textEff:Node | null = null;
    @property({type:Prefab})
    pfFlower:Prefab | null = null;

    private screenW: number = 1920;
    private screenH: number = 1080;
    private boardH: number = 800;
    private boardW: number = 800;
    private boardX: number = 0;
    private boardY: number = 0;
    readonly ITEM_PER_ROW = 8;
    readonly ITEM_PER_COL = 8;
    readonly ITEM_SIZE = 100;
    //--
    arrSelectedItems = [];//selected item
    iTotalScore: number = 0;
    SCORE_BASE = 100;
    iCountDestroy = 0;
    isEndGame = false;
    //--define
    ItemsTypes = {
        NONE: 0,
        VERTICAL_STRIPPED: 1,
        HORIZONTAL_STRIPPED: 2,
        PACKAGE: 3,
        CHOCOBOMB: 4,
        INGREDIENT: 5,
        BOMB: 6
    }
    MaxTrix = [
        [0,   1,  2,  3,  4,  5,  6,  7], //idx = col+row*8 
        [8,   9, 10, 11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20, 21, 22, 23],
        [24, 25, 26, 27, 28, 29, 30, 31],
        [32, 33, 34, 35, 36, 37, 38, 39],
        [40, 41, 42, 43, 44, 45, 46, 47],  //|row 2
        [48, 49, 50, 51, 52, 53, 54, 55],  //|row 1
        [56, 57, 58, 59, 60, 61, 62, 63]   //|row 0
        //col0, col1, col2,...........
    ];
    arrItems = [];//store items
    arrCorrectRow = [];
    isEnableTouch: boolean = true;
    isBackPressed: boolean = false;
    iMovesCount: number = 0;

    level = {
        MODE:2,
        SIZE:[7,5],
        LIMIT:[0,16],
        COLOR_LIMIT: 4,
        STARS:[500,1200,2100],
        COLLECT_ITEMS:[0,1,2,3],
        COLLECT_COUNT:[3,3,3,3],
        GETSTARS:3
    };

    //--mode 0, timer
    isEnableTimer = false;
    lastTimeUpdate= 0;

    start() {
        if(GameMgr.instance.readFruitLevel()){
            this.iCurrentLevel = GameMgr.instance.readFruitLevel();
        }
        this.levels = this.getComponent(FruitLevels).levels;
        this.level = this.levels[this.iCurrentLevel];
        this.tutorial.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            AudioMgr.inst.playOneShot(this.arrAudioClips[11]);
            this.tutorial.getComponent(FruitTutorial).isDone = true;
            this.tutorial.active = false;
            GameMgr.instance.saveFruitTutorial(1);
        });
        this.board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            if (!this.isEnableTouch) return;
            this.clearSelectedItem();
            this.startPoint = event.getUILocation().clone();
            this.getAvailabelCell(this.startPoint);
            for (let i = 0; i < this.arrItems.length; i++) {
                this.arrItems[i].getComponent(FruitItem).setScaleAnim(false);
            }
            this.resetSpeed();
            AudioMgr.inst.bgm.volume = 1;
        }, this);
        this.board.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            if (!this.isEnableTouch) return;
            let p = event.getUILocation().clone();
            //get available cell
            this.getAvailabelCell(p);
        }, this);
        this.board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            if (!this.isEnableTouch) return;
            //1. disable touch & clear graphics
            this.isEnableTouch = false;
            this.graphics1.clear();
            this.graphics2.clear();
            //2. check combo
            let combo = this.arrSelectedItems.length;
            if (combo > 2) {
                //3. get all items can destroy
                for (let i = 0; i < combo; i++) {
                    let idx = this.arrSelectedItems[i];
                    let itemInfo = this.arrItems[idx].getComponent(FruitItem);
                    if(itemInfo.info.iBom==1){
                        for(let j=0;j<this.arrItems.length;j++){
                            let isExists = false;
                            for(let k=0;k<this.arrSelectedItems.length;k++){
                                if(j==this.arrSelectedItems[k]){
                                    isExists = true;
                                    break;
                                }
                            }
                            if(isExists){//skip
                                continue;
                            } else {
                                if(this.arrItems[j].getComponent(FruitItem).info.row == itemInfo.info.row){
                                    this.arrSelectedItems.push(j);
                                }
                            }
                        }
                    } else if(itemInfo.info.iBom==2){
                        for(let j=0;j<this.arrItems.length;j++){
                            let isExists = false;
                            for(let k=0;k<this.arrSelectedItems.length;k++){
                                if(j==this.arrSelectedItems[k]){
                                    isExists = true;
                                    break;
                                }
                            }
                            if(isExists){//skip
                                continue;
                            } else {
                                if(this.arrItems[j].getComponent(FruitItem).info.col == itemInfo.info.col){
                                    this.arrSelectedItems.push(j);
                                }
                            }
                        }
                    }
                }
                //4. add new items to selectedItem, it's not on combo -> don't set to combo
                for (let i = 0; i < this.arrSelectedItems.length; i++) {
                    let idx = this.arrSelectedItems[i];
                    let itemInfo = this.arrItems[idx].getComponent(FruitItem);
                    if(this.arrItems[idx].active == true){
                        itemInfo.playDestroy();
                        let pointEff = instantiate(this.pfPointEff);
                        pointEff.getComponent(FruitPointEff).playEff(itemInfo.info.type,this.SCORE_BASE);
                        this.effLayer.addChild(pointEff);
                        pointEff.setPosition(itemInfo.node.position);
                        if(itemInfo.info.iBom>0){
                            let timeout = setTimeout(()=>{
                                clearTimeout(timeout);
                                AudioMgr.inst.playOneShot2(this.arrAudioClips[28]);
                            },i*20)
                        } else {
                            let timeout5 = setTimeout(()=>{
                                clearTimeout(timeout5);
                                AudioMgr.inst.playOneShot(this.arrAudioClips[12+i%4]);
                            },i*50)
                        }
                        
                    }
                }
                //5. show combo effect
                this.textEff.getComponent(FruitTextEffect).runEffect(combo,this.arrAudioClips);
                
                //6. update move count
                if(this.level.MODE==0){//timer

                } else if(this.level.MODE==2){
                    this.iMovesCount--;
                    this.lbMoves.string = `${this.iMovesCount}`;
                }
            } else {
                this.clearSelectedItem();
            }
            AudioMgr.inst.bgm.volume = 1;
        }, this);
        this.board.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            if (!this.isEnableTouch) return;
            this.graphics1.clear();
            this.graphics2.clear();
            this.clearSelectedItem();
            AudioMgr.inst.bgm.volume = 1;
        }, this);

        //--init size
        this.screenW = this.node.getComponent(UITransform).width;
        this.screenH = this.node.getComponent(UITransform).height;
        this.boardW = this.board.getComponent(UITransform).width;
        this.boardH = this.board.getComponent(UITransform).height;
        this.boardX = this.board.getWorldPosition().x;
        this.boardY = this.board.getWorldPosition().y;
        //console.log(`>>>W:${this.screenW}, H:${this.screenH}`);
        //--
        GameEvent.AddEventListener("FRUIT_DESTROY_DONE", (data: any) => {
            //1. Add 1 item on top: if 1 item destroy
            let w = this.board.getComponent(UITransform).width;
            let h = this.board.getComponent(UITransform).height;
            //--add 1 item to top
            let texId = GameMgr.instance.getRandomInt(0,this.level.COLOR_LIMIT);
            let newItem = instantiate(this.pfItems[texId]);
            newItem.getComponent(FruitItem).init({ row: this.ITEM_PER_ROW + this.arrCorrectRow[data.info.col], col: data.info.col, idx: -1, type: texId });
            //--check row col
            let x = newItem.getComponent(FruitItem).info.col * this.ITEM_SIZE;
            let y = newItem.getComponent(FruitItem).info.row * this.ITEM_SIZE;
            newItem.getComponent(FruitItem).moveCount = this.arrCorrectRow[data.info.col]; //items need to move == num of item has destroy
            
            newItem.setPosition(x - w / 2 + 50, y - h / 2 + 50);
            this.board.addChild(newItem);
            this.arrCorrectRow[data.info.col]++;//stack if more items added

            //2. Nhung item nam phia tren items bi destroy se duoc ++ move
            for (let i = 0; i < this.board.children.length; i++) {
                let item = this.board.children[i];
                let info2 = item.getComponent(FruitItem).info;
                if (info2.col == data.info.col && info2.row > data.info.row) {
                    item.getComponent(FruitItem).moveCount++;
                }
            }

            //3.create item move to pos
            //check item need to move or not
            let pos2 = new Vec3();
            let updateCountIdx = -1;
            if(this.level.MODE==0){
                
            } else if(this.level.MODE==2){
                for(let i=0;i<this.infoListItem.children.length;i++){
                    let itemTop = this.infoListItem.children[i].getComponent(FruitItemTop);
                    if(data.info.type == itemTop.info.type){
                        pos2 = this.infoListItem.children[i].getWorldPosition().clone();
                        if(itemTop.info.count>itemTop.currentCount){//not full, if full don't move
                            updateCountIdx = i;
                            break;
                        }
                    }
                }
            }

            if(updateCountIdx!=-1){
                //--7. inscrease count
                this.infoListItem.children[updateCountIdx].getComponent(FruitItemTop).setIncreaseCount();

                //8. update progress bar, progress bar base on quest complete or not
                let maxCount = 0;
                for(let i=0;i<this.level.COLLECT_COUNT.length;i++){
                    maxCount+=this.level.COLLECT_COUNT[i];
                }
                let currentCount = 0;
                for(let i=0;i<this.infoListItem.children.length;i++){
                    currentCount+=this.infoListItem.children[i].getComponent(FruitItemTop).currentCount;
                }
                let maxWidth = this.progressbar.parent.getComponent(UITransform).width;
                this.progressbar.getComponent(UITransform).width = (currentCount/maxCount)*maxWidth;

                //--move effect
                let tempItem = instantiate(this.pfItems[data.info.type]);
                this.node.addChild(tempItem);
                tempItem.setPosition(data.pos);

                tween(tempItem)
                .to(0.1,{scale:new Vec3(0.5,0.5,0.5),position: new Vec3(data.pos.x,data.pos.y+50)})
                .to(0.1,{})
                .to(0.8,{position:pos2,scale:new Vec3(0.3,0.3,0.3)},{easing:'backInOut'})
                .delay(0.1)
                .call(()=>{
                    tempItem.removeFromParent();
                })
                .start();
                tween(tempItem)
                .to(0.5,{angle:360})
                .by(0.3,{angle:720})
                .start();
                tween(tempItem.getComponent(UIOpacity))
                .delay(0.8)
                .to(0.2,{opacity:0})
                .start();
            }
            //--end move effect

            this.iCountDestroy++;
            if(this.iCountDestroy==this.arrSelectedItems.length){
                //7. update total score
                let newScore = this.iTotalScore + this.arrSelectedItems.length * this.SCORE_BASE;//score base on total item destroy
                GameMgr.instance.numberTo(this.lbScore,this.iTotalScore,newScore,1000);
                this.iTotalScore = newScore;

                if(this.level.MODE==0){
                    //--7. inscrease count
                    let totalStar = 0;
                    let maxScore  = this.level.STARS[this.level.STARS.length-1];
                    if(this.iTotalScore>maxScore){
                        maxScore = this.iTotalScore;
                    }

                    for(let i=0;i<this.level.STARS.length;i++){
                        if(this.iTotalScore>this.level.STARS[i]){
                            totalStar++;
                        }
                    }
                    if(this.infoListItem.children[0].getComponent(FruitItemTop).currentCount < totalStar){
                        this.infoListItem.children[0].getComponent(FruitItemTop).setIncreaseCount();
                    }
                    
                    //8. update progress bar, progress bar base on quest complete or not
                    let maxWidth = this.progressbar.parent.getComponent(UITransform).width;
                    this.progressbar.getComponent(UITransform).width = (this.iTotalScore/maxScore)*maxWidth;

                } else if(this.level.MODE==2){

                }

                //move
                for (let i = 0; i < this.board.children.length; i++) {
                    this.board.children[i].getComponent(FruitItem).moveDown();
                }
            }
            //--check can move

        });
        GameEvent.AddEventListener("FRUIT_CHECK_MOVE_DONE", (info: any) => {
            //--update info for row
            let movingDone = true;
            for (let i = 0; i < this.board.children.length; i++) {
                let item = this.board.children[i];
                let itemInfo = item.getComponent(FruitItem);
                if (itemInfo.isMoving) {
                    movingDone = false;
                    break;
                }
            }
            if (movingDone) {
                this.arrItems = [];
                //--make a new array
                let count = 0;
                while (count < this.ITEM_PER_COL * this.ITEM_PER_ROW) {
                    for (let i = 0; i < this.board.children.length; i++) {
                        if (this.board.children[i].getComponent(FruitItem).info.idx == count) {
                            this.arrItems.push(this.board.children[i]);
                            break;
                        }
                    }
                    count++;
                }
                //--change info
                console.log("moving done>>>");
                if(this.level.MODE==0){
                    let totalStar = 0;
                    for(let i=0;i<this.level.STARS.length;i++){
                        if(this.iTotalScore>this.level.STARS[i]){
                            totalStar++;
                        }
                    }
                    if(totalStar>=this.level.GETSTARS){
                        this.showWinResult();
                    } else {
                        this.clearSelectedItem();
                    }
                } else if(this.level.MODE==2){
                    if(this.isEndGame){
                        this.showWinResult();
                    } else {
                        this.clearSelectedItem();
                        this.checkEndGame();
                    }
                }
            }
        })

        //--buttons
        this.btnPause.on(Button.EventType.CLICK, this.onClick, this);

        //--
        this.loading.active = true;

        //--popup
        this.ppResult.getComponent(FruitResult).init(this.arrAudioClips[11],(cmd:number)=>{
            if(cmd==1){
                //back to lobby
                this.backToLobby();
            } if(cmd==2){//restart game //-random new level
                this.iCurrentLevel++;
                if(this.iCurrentLevel>=this.levels.length){
                    this.iCurrentLevel = 0;
                }
                GameMgr.instance.saveFruitLevel(this.iCurrentLevel);
                this.level = this.levels[this.iCurrentLevel];
                this.showQuest();
            }
        });
        this.ppQuest.getComponent(FruitQuest).init(this.arrAudioClips[11],this.icons,(cmd:number)=>{
            if(cmd==1){
                //back to lobby
                this.backToLobby();
            } if(cmd==2){//restart game
                this.restartGame();
            }
        });
        this.ppOutOfMove.getComponent(FruitOutOfMove).init(this.arrAudioClips[11],(cmd:number)=>{
            if(cmd==1){
                //back to lobby
                this.backToLobby();
            } else if(cmd==2){//restart game
                this.restartGame();
            }
        });
        this.ppPause.getComponent(FruitPause).init(this.arrAudioClips[11],(cmd:number)=>{
            if(cmd==1){
                //back to lobby
                this.backToLobby();
            } else if(cmd==2){//restart game
                this.restartGame();
            }
        });

        //--
        if(GameMgr.instance.readFruitTutorial()){
            this.tutorial.active = false;
            this.tutorial.getComponent(FruitTutorial).isDone = true;
            this.tutorial.getComponent(FruitTutorial).clearTutorial();
        }
        //--sound
        AudioMgr.inst.setAudioSouce('main',this.arrAudioClips[0]);
        AudioMgr.inst.setAudioSouce('spin',this.arrAudioClips[0]);//play other sound
        AudioMgr.inst.setAudioSouce('freespin',this.arrAudioClips[0]);//play other sound
        AudioMgr.inst.playBgm();
    }
    checkEndGame(){
        //--check done
        let isDone = true;
        let totalStar = 0;
        for(let i=0;i<this.level.STARS.length;i++){
            if(this.iTotalScore>=this.level.STARS[i]){
                totalStar++;
            }
        }
        if(this.level.MODE==0){//star collect
            if(totalStar<this.level.GETSTARS){
                isDone = false;
            } 
        } else if(this.level.MODE==2){
            for(let i=0;i<this.infoListItem.children.length;i++){
                let item = this.infoListItem.children[i].getComponent(FruitItemTop);
                if(item.currentCount<item.info.count){
                    isDone = false;
                }
            }
        }

        if(isDone){
            this.isEndGame = true;
            this.isEnableTouch = false;
            let timeout4 = setTimeout(()=>{
                clearTimeout(timeout4);
                
            // APIMgr.instance.puzzleResult(this.iTotalScore,(iSuccess:boolean,res:any)=>{
            //     if(iSuccess){
            //         if(this.iMovesCount>0){
            //             this.runRemainEffect();
            //         } else {
            //             this.showWinResult();
            //         }
            //     }
            // });

                if(this.iMovesCount>0){
                    this.runRemainEffect();
                } else {
                    this.showWinResult();
                }
            },1000);
            
        } else {//check num of move
            if(this.iMovesCount<=0){
                //--game over
                AudioMgr.inst.playOneShot3(this.arrAudioClips[24]);
                this.ppOutOfMove.active = true;
                this.ppOutOfMove.getComponent(FruitOutOfMove).bg.active = true;
                this.ppOutOfMove.getComponent(FruitOutOfMove).show(this.iTotalScore,totalStar,this.arrAudioClips);
            } else {//continue

            }
        }
    }
    runRemainEffect(){
        if(this.iMovesCount>0){
            this.iMovesCount--;
            this.lbMoves.string = `${this.iMovesCount}`;
            let flower = instantiate(this.pfFlower);
            let p1 = this.lbMoves.node.getWorldPosition();
            let rIdx = GameMgr.instance.getRandomInt(0,this.arrItems.length-1);
            let item = this.arrItems[rIdx];
            let p2 = item.getWorldPosition();
            this.node.addChild(flower);
            flower.setPosition(p1);
            tween(flower)
            .to(0.2,{position:p2,scale: new Vec3(1.5,1.5,1.5)})
            .call(()=>{AudioMgr.inst.playOneShot2(this.arrAudioClips[16])})
            .delay(0.2)
            .to(0.1,{scale:new Vec3(0.1,0.1,0.1)})
            .call(()=>{
                flower.removeFromParent();
                AudioMgr.inst.playOneShot2(this.arrAudioClips[27]);
                item.getComponent(FruitItem).setBomSelection();
            })
            .start();
            tween(flower)
            .repeatForever(tween(flower)
            .delay(0.01)
            .call(()=>{
                flower.angle = flower.angle+10;
            }))
            .start();
            let timeout3 = setTimeout(()=>{
                clearTimeout(timeout3);
                this.runRemainEffect();
            },500)
        } else {
            this.clearBoard();
            //this.showWinResult();
        }
    }
    clearBoard(){
        this.arrSelectedItems = [];
        for (let i = 0; i < this.arrItems.length; i++) {
            let item = this.arrItems[i];
            let info = item.getComponent(FruitItem).info;
            if(info.iBom!=0){ //if bom item -> add
                this.arrSelectedItems.push(item);
            }
        }
        //--get all item same rol, col
        for (let i = 0; i < this.arrSelectedItems.length; i++) {
            let item = this.arrSelectedItems[i];
            let info = item.getComponent(FruitItem).info;
            if(info.iBom==1){ //if bom item -> add
                for(let j=0;j<this.arrItems.length;j++){
                    let item2 = this.arrItems[j];
                    let info2 = item2.getComponent(FruitItem).info;
                    if(info.row == info2.row){
                        //--check exists
                        let isExists = false;
                        for(let k=0;k<this.arrSelectedItems.length;k++){
                            let item3 = this.arrSelectedItems[k];
                            let info3 = item3.getComponent(FruitItem).info;
                            if(info2.idx==info3.idx){
                                isExists = true;
                                break;
                            }
                        }
                        if(!isExists){
                            this.arrSelectedItems.push(item2);
                        }
                    }
                }
            } else if(info.iBom==2){
                for(let j=0;j<this.arrItems.length;j++){
                    let item2 = this.arrItems[j];
                    let info2 = item2.getComponent(FruitItem).info;
                    if(info.col == info2.col){
                        //--check exists
                        let isExists = false;
                        for(let k=0;k<this.arrSelectedItems.length;k++){
                            let item3 = this.arrSelectedItems[k];
                            let info3 = item3.getComponent(FruitItem).info;
                            if(info2.idx==info3.idx){
                                isExists = true;
                                break;
                            }
                        }
                        if(!isExists){
                            this.arrSelectedItems.push(item2);
                        }
                    }
                }
            }
        }
        //--run destroy animation
        for (let i = 0; i < this.arrSelectedItems.length; i++) {
            let item = this.arrSelectedItems[i];
            let info = item.getComponent(FruitItem).info;
            if(this.arrSelectedItems[i].active == true){
                this.arrSelectedItems[i].getComponent(FruitItem).playDestroy();
                let pointEff = instantiate(this.pfPointEff);
                pointEff.getComponent(FruitPointEff).playEff(info.type,this.SCORE_BASE);
                this.effLayer.addChild(pointEff);
                pointEff.setPosition(item.position);
                if(info.iBom>0){
                    let timeout = setTimeout(()=>{
                        clearTimeout(timeout);
                        AudioMgr.inst.playOneShot(this.arrAudioClips[28]);
                    },i*10)
                }
            }
        }
        
        let newScore = this.iTotalScore + this.arrSelectedItems.length * this.SCORE_BASE;
        GameMgr.instance.numberTo(this.lbScore,this.iTotalScore,newScore,1000);
        this.iTotalScore = newScore;
    }
    showWinResult(){
        this.isEnableTimer = false;
        let totalStar = 0;
        AudioMgr.inst.playOneShot3(this.arrAudioClips[25]);
        for(let i=0;i<this.level.STARS.length;i++){
            if(this.iTotalScore>=this.level.STARS[i]){
                totalStar++;
            }
        }
        let timeout1= setTimeout(()=>{
            clearTimeout(timeout1)
            this.ppResult.active = true;
            this.ppResult.getComponent(FruitResult).bg.active = true;
            this.ppResult.getComponent(FruitResult).show(this.iTotalScore,totalStar,this.arrAudioClips);
        },500);
    }

    restartGame(){
        this.isEnableTimer = false;
        this.isEndGame = false;
        //1. show info and blocks
        this.infoNode.active = true;
        this.blockNode.active = true;
        
        //--
        let maxScore = 0;
        this.infoListItem.removeAllChildren();
        if(this.level.MODE==0){//collect stars
            //2. update info
            this.iMovesCount = this.level.LIMIT[1];
            this.updateTimer();
            let item = instantiate(this.pfItemTop);
            let idx  = 8;
            let count= this.level.GETSTARS;
            maxScore+=this.level.STARS[this.level.STARS.length-1];
            item.getComponent(FruitItemTop).init(this.icons[idx],{idx:0, type:idx,count:count});
            this.infoListItem.addChild(item);
            this.isEnableTimer = true;
            this.lastTimeUpdate = new Date().getTime();
        } else if(this.level.MODE==2){//collect items
            //2. update info
            this.iMovesCount = this.level.LIMIT[1];
            GameMgr.instance.numberTo(this.lbMoves,0,this.iMovesCount,1000);
            for(let i=0;i<this.level.COLLECT_ITEMS.length;i++){
                let item = instantiate(this.pfItemTop);
                let idx  = this.level.COLLECT_ITEMS[i];
                let count= this.level.COLLECT_COUNT[i];
                maxScore+=this.level.COLLECT_COUNT[i]*this.SCORE_BASE;
                item.getComponent(FruitItemTop).init(this.icons[idx],{idx:i, type:idx,count:count});
                this.infoListItem.addChild(item);
            }
        }
        
        //--score
        this.iTotalScore = 0;
        this.lbScore.string  = `${this.iTotalScore}`;
        //level
        let maxWidth = this.progressbar.parent.getComponent(UITransform).width; //<=>100
        this.progressbar.getComponent(UITransform).width = (this.iTotalScore/maxScore)*maxWidth;
        //--
        this.initTables();
        this.arrSelectedItems = [];
        this.clearSelectedItem();
        this.arrSuggest = [];
        this.tutorial.getComponent(FruitTutorial).clearTutorial();
        //--Auto suggest
        this.suggestLinkItems();
    }
    updateTimer(){
        let minutes = Math.floor(this.iMovesCount/60);
        let strMinutes = minutes<10?`0${minutes}`:`${minutes}`;
        let second  = this.iMovesCount - minutes*60;
        let strSeconds = second<10?`0${second}`:`${second}`;
        this.lbMoves.string = `${strMinutes}:${strSeconds}`;
    }
    initTables() {
        console.log(">>>initTables");
        this.arrItems = [];
        this.board.removeAllChildren();

        let row = 0;
        let col = 0;
        let w = this.board.getComponent(UITransform).width;
        let h = this.board.getComponent(UITransform).height;
        for (let i = 0; i < this.ITEM_PER_ROW * this.ITEM_PER_COL; i++) {
            let texId = GameMgr.instance.getRandomInt(0, this.level.COLOR_LIMIT);
            let item = instantiate(this.pfItems[texId]);
            item.getComponent(FruitItem).init({ row: row, col: col, idx: i, type: texId });

            //--check row col
            let x = col * this.ITEM_SIZE;
            let y = row * this.ITEM_SIZE;
            item.setPosition(x - w / 2 +  this.ITEM_SIZE/2 , y - h / 2 +  this.ITEM_SIZE/2);
            this.arrItems.push(item);
            this.board.addChild(item);
            col++;
            if (col == this.ITEM_PER_COL) {
                col = 0;
                row++;
            }
            // console.log(`>>>id:${i}, x:${item.getWorldPosition().x},y:${item.getWorldPosition().y}`);
        }
    }
    resetSpeed() {
        this.arrCorrectRow = [];
        for (let i = 0; i < this.ITEM_PER_ROW; i++) {
            this.arrCorrectRow.push(0);
        }
    }
    getAvailabelCell(pos: Vec2) {//if cell ok -> add to list
        //1.get cell
        let selectedCell = -1;
        for (let i = 0; i < this.arrItems.length; i++) {
            let item = this.arrItems[i];
            let itemPos = item.getWorldPosition();
            let left = itemPos.x - this.ITEM_SIZE / 2;
            let right = itemPos.x + this.ITEM_SIZE / 2;
            let top = itemPos.y + this.ITEM_SIZE / 2;
            let bottom = itemPos.y - this.ITEM_SIZE / 2;
            if (pos.x > left && pos.x < right && pos.y > bottom && pos.y < top) {
                selectedCell = i;
                break;
            }
        }
        if (selectedCell == -1) return;

        //2. check same type
        let itemType = -1;
        if (this.arrSelectedItems.length > 0) {
            itemType = this.arrItems[this.arrSelectedItems[0]].getComponent(FruitItem).info.type;
            if (this.arrItems[selectedCell].getComponent(FruitItem).info.type != itemType) {
                return;//difference type;
            }
        }
        //cell exists on list or not
        for (let i = 0; i < this.arrSelectedItems.length; i++) {
            if (this.arrSelectedItems[i] == selectedCell) {
                if(i==(this.arrSelectedItems.length-2)){//drag back
                    let lastItem = this.arrSelectedItems[this.arrSelectedItems.length-1];
                    this.arrItems[lastItem].getComponent(FruitItem).clearSelected();
                    let temp = [...this.arrSelectedItems];
                    this.arrSelectedItems = [];
                    for(let j=0;j<temp.length-1;j++){
                        this.arrSelectedItems.push(temp[j]);
                    }
                    
                    this.drawPath();
                }
                return;
            }
        }

        //--3.check dieu kien co the highlight kg
        let cells = this.get8CellsAround(selectedCell);

        //--check cell is avaliable
        let preIdx = -1;
        for (let i = 0; i < cells.length; i++) {
            let idx = cells[i];
            if (idx == this.arrSelectedItems[this.arrSelectedItems.length - 1]) {
                preIdx = idx;
                break;
            }
        }

        if (preIdx == -1 && this.arrSelectedItems.length > 0) return;
        //--all passed
        this.arrSelectedItems.push(selectedCell);
        
        //highlight
        this.arrItems[selectedCell].getComponent(FruitItem).setHL(true);
        if(this.arrSelectedItems.length==6){//change to bom if index == 4
            AudioMgr.inst.playOneShot2(this.arrAudioClips[27]);
            this.arrItems[selectedCell].getComponent(FruitItem).setBomSelection();
        }
        if(this.arrSelectedItems.length>0){
            console.log(`play combo audio: ${this.arrSelectedItems.length}`);
            if(this.arrSelectedItems.length>10){
                AudioMgr.inst.playOneShot(this.arrAudioClips[10]);
            }
            else{
                AudioMgr.inst.playOneShot(this.arrAudioClips[this.arrSelectedItems.length]);
            }
        }

        //draw path
        this.drawPath();
    }
    drawPath(){
        this.graphics1.clear();
        this.graphics1.lineWidth = 10;
        this.graphics1.strokeColor.fromHEX('#54a0ed');
        this.graphics1.fillColor.fromHEX('#54a0ed');
        this.graphics2.clear();
        this.graphics2.lineWidth = 20;
        this.graphics2.strokeColor.fromHEX('#B9DCFF');
        this.graphics2.fillColor.fromHEX('#B9DCFF');
        //
        let idx = this.arrSelectedItems[0];
        let item = this.arrItems[idx];
        this.graphics1.moveTo(item.getWorldPosition().x - this.boardX, item.getWorldPosition().y - this.boardY);
        this.graphics2.moveTo(item.getWorldPosition().x - this.boardX, item.getWorldPosition().y - this.boardY);
        for (let i = 0; i < this.arrSelectedItems.length; i++) {
            idx = this.arrSelectedItems[i];
            item = this.arrItems[idx];
            this.graphics1.lineTo(item.getWorldPosition().x - this.boardX, item.getWorldPosition().y - this.boardY);
            this.graphics1.stroke();
            this.graphics2.lineTo(item.getWorldPosition().x - this.boardX, item.getWorldPosition().y - this.boardY);
            this.graphics2.stroke();
        }
    }
    get8CellsAround(idx: number) {
        /*                 .row direction
               1   2   3 /|\
               0  cell 4  |
               7   6   5  |---->col direction
       */
        if (idx < 0 || idx >= this.arrItems.length) return [];
        let cells = [];
        let info = this.arrItems[idx].getComponent(FruitItem).info;
        let cell0 = { row: info.row, col: info.col - 1 };
        let checkAvailable = (cell: any) => {
            if (cell.col >= 0 && cell.col < this.ITEM_PER_COL && cell.row >= 0 && cell.row < this.ITEM_PER_ROW) {
                return true;
            }
            return false;
        }
        if (checkAvailable(cell0)) cells.push(this.MaxTrix[cell0.row][cell0.col]);


        let cell1 = { row: info.row + 1, col: info.col - 1 };
        if (checkAvailable(cell1)) cells.push(this.MaxTrix[cell1.row][cell1.col]);

        let cell2 = { row: info.row + 1, col: info.col };
        if (checkAvailable(cell2)) cells.push(this.MaxTrix[cell2.row][cell2.col]);

        let cell3 = { row: info.row + 1, col: info.col + 1 };
        if (checkAvailable(cell3)) cells.push(this.MaxTrix[cell3.row][cell3.col]);

        let cell4 = { row: info.row, col: info.col + 1 };
        if (checkAvailable(cell4)) cells.push(this.MaxTrix[cell4.row][cell4.col]);

        let cell5 = { row: info.row - 1, col: info.col + 1 };
        if (checkAvailable(cell5)) cells.push(this.MaxTrix[cell5.row][cell5.col]);

        let cell6 = { row: info.row - 1, col: info.col };
        if (checkAvailable(cell6)) cells.push(this.MaxTrix[cell6.row][cell6.col]);

        let cell7 = { row: info.row - 1, col: info.col - 1 };
        if (checkAvailable(cell7)) cells.push(this.MaxTrix[cell7.row][cell7.col]);
        return cells;
    }
    clearSelectedItem() {
        for (let i = 0; i < this.arrSelectedItems.length; i++) {
            if(this.arrItems[this.arrSelectedItems[i]]!=null){
                this.arrItems[this.arrSelectedItems[i]].getComponent(FruitItem).clearSelected();
            }
        }
        this.arrSelectedItems = [];
        this.iCountDestroy = 0;
        console.log('clear data :done')
        this.isEnableTouch = true;
    }
    arrSuggest = [];//level 0: root
    printArray(arr: any) {
        let str = "";
        for (let i = 0; i < arr.length; i++) {
            str += `${arr[i]},`;
        }
        console.log(str);
    }
    getLinkItem(path: any) {
        let idx = path[path.length - 1];
        let cells = this.get8CellsAround(idx);
        //depth = 3
        if (path.length > 3) {
            this.arrSuggest.push(path);
            return;
        }

        if (cells.length == 0) {//het duong di -> stop
            if (path.length > 2) {
                this.arrSuggest.push(path);
                // this.printArray(path);
            }
            return;
        }
        //--check type

        let type = this.arrItems[idx].getComponent(FruitItem).info.type;
        let newCells = [];
        for (let i = 0; i < cells.length; i++) {
            let idx2 = cells[i];
            let type2 = this.arrItems[cells[i]].getComponent(FruitItem).info.type;
            if (type2 == type) {
                newCells.push(idx2);
            }
        }
        cells = newCells;

        for (let j = 0; j < cells.length; j++) {
            let idx2 = cells[j];
            let isExists = false;
            for (let k = 0; k < path.length; k++) {
                if (idx2 == path[k]) {
                    isExists = true;
                    break;
                }
            }
            if (isExists) {
                if (path.length > 2) {
                    this.arrSuggest.push(path);
                    // this.printArray(path);
                }
            } else {
                let newPath = [...path, idx2];
                this.getLinkItem(newPath);
            }
        }
    }
    suggestLinkItems() {
        for (let i = 0; i < this.arrItems.length; i++) {
            this.getLinkItem([i]);
        }
        //--
        if (this.arrSuggest.length > 0) {
            let idx = this.arrSuggest.length-1;
            let line = this.arrSuggest[idx];
            let arrPoint =  [];
            let w = this.board.getComponent(UITransform).width;
            let h = this.board.getComponent(UITransform).height;
            let type = 0;
            for (let i = 0; i < line.length; i++) {
                let idx = line[i];
                let fruitItem = this.arrItems[idx].getComponent(FruitItem);
                fruitItem.setScaleAnim(true);
                let x = fruitItem.info.col * this.ITEM_SIZE - w/2 + this.ITEM_SIZE/2;
                let y = fruitItem.info.row * this.ITEM_SIZE - h/2 + this.ITEM_SIZE/2;
                arrPoint.push({x:x,y:y});
                type = fruitItem.info.type;
            }
            if(arrPoint.length>0 && GameMgr.instance.readFruitTutorial()==false){
                this.tutorial.active = true;
                this.tutorial.getComponent(FruitTutorial).setActiveTutorial(arrPoint,this.pfItems[type]);
            }
        }
    }
    onClick(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[11]);
        switch (button.node.name) {
            case 'btnPause':
                this.ppPause.active = true;
                this.ppPause.getComponent(FruitPause).bg.active = true;
                this.ppPause.getComponent(FruitPause).show();
                break;
        }
    }
    backToLobby(){
        if (this.isBackPressed) return;
        this.isBackPressed = true;
        AudioMgr.inst.stop();
        GameEvent.RemoveEventListener('FRUIT_DESTROY_DONE');
        GameEvent.RemoveEventListener('FRUIT_CHECK_MOVE_DONE');
        director.loadScene('lobby');
    }
    showQuest(){
        AudioMgr.inst.playOneShot3(this.arrAudioClips[26]);
        this.infoNode.active = false;
        this.blockNode.active = false;
        this.ppQuest.active = true;
        this.ppQuest.getComponent(FruitQuest).bg.active = true;
        this.ppQuest.getComponent(FruitQuest).show(this.level);
    }
    private updateProgress(){
        if(this.loadingBar && this.loadingBar.parent){
            let w = this.loadingBar.parent.getComponent(UITransform).width;
            let progress = (this.percent/100) * w;
            this.loadingBar.getComponent(UITransform).width = progress;
            if(progress>w*0.99){
                progress = w*0.99;
                this.loading.active = false;
                this.showQuest();
            }
            // this.star.position    =  new Vec3(progress - w/2 - this.star.getComponent(UITransform).width/2, 0);
        } else {
            this.percent = 0;
        }
	}
    update(deltaTime: number) {
        if(this.percent<100){
            this.percent++;
            this.updateProgress()
        }
        //
        if(this.isEnableTimer){
            let currentTime = new Date().getTime();
            if(currentTime - this.lastTimeUpdate>1000){
                this.lastTimeUpdate = currentTime;
                this.iMovesCount--;
                this.updateTimer();
                if(this.iMovesCount==3){
                    AudioMgr.inst.playOneShot3(this.arrAudioClips[29])
                }
                if(this.iMovesCount<=0){
                    this.isEnableTimer = false;//end game
                    this.checkEndGame();
                }
            }
        }
    }
}

/*  DEV NOTE
1. Load level
2. Load board
3. Process gameplay
    |__1. Check combo > 2
    |__2. Check all combo, all items from bom if have 1
    |__3. show combo effect
    |__4. update score
    |__5. update progress bar
    |__6. update star
    |__7. check end game
4. Restart new game
    |__new level
    |__play again
*/