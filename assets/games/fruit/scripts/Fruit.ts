import { _decorator, Component, EventTouch, Graphics, instantiate, LightingStage, Node, Prefab, SpriteFrame, tween, UITransform, Vec2, Vec3, AudioClip, director, Button, Label } from 'cc';
import GameMgr from '../../../core/GameMgr';
import { FruitItem } from './FruitItem';
import { GameEvent } from '../../../core/GameEvent';
import { AudioMgr } from '../../../core/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('Fruit')
export class Fruit extends Component {
    @property({ type: Node })
    board: Node | null = null;
    @property([Prefab])
    pfItems: Prefab[] = [];
    @property({ type: Prefab })
    pfItemTop: Prefab | null = null;
    @property({ type: Label })
    lbMoves: Label | null = null;
    @property({ type: Label })
    lbCount1: Label | null = null;
    @property({ type: Label })
    lbCount2: Label | null = null;
    @property({ type: Label })
    lbCount3: Label | null = null;
    @property({ type: Label })
    lbCount4: Label | null = null;
    // @property([SpriteFrame])
    // arrIcon: SpriteFrame[] = []
    // @property([SpriteFrame])
    // arrIconHL: SpriteFrame[] = []
    // @property([SpriteFrame])
    // arrBomb: SpriteFrame[] = []
    @property({ type: Graphics })
    graphics: Graphics | null = null;
    @property({ type: Node })
    btnBack: Node | null = null;
    @property([AudioClip])
    arrAudioClips: AudioClip[] = [];
    startPoint: Vec2 = null;
    endPoint: Vec2 = null;
    private screenW: number = 1920;
    private screenH: number = 1080;
    private boardH: number = 800;
    private boardW: number = 800;
    private boardX: number = 0;
    private boardY: number = 0;
    readonly ITEM_PER_ROW = 8;
    readonly ITEM_PER_COL = 8;
    //--
    arrSelectedItems = [];//selected item have order,
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
        [0, 1, 2, 3, 4, 5, 6, 7], //idx = col+row*8 
        [8, 9, 10, 11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20, 21, 22, 23],
        [24, 25, 26, 27, 28, 29, 30, 31],
        [32, 33, 34, 35, 36, 37, 38, 39],
        [40, 41, 42, 43, 44, 45, 46, 47],  //|row 2
        [48, 49, 50, 51, 52, 53, 54, 55],  //|row 1
        [56, 57, 58, 59, 60, 61, 62, 63]   //|row 0
        //col0, col1, col2,...........
    ];
    arrItems = [];//store items
    arrSpeed = [];
    isEnableTouch: boolean = true;
    isBackPressed: boolean = false;
    iMovesCount: number = 1000;
    start() {
        this.lbMoves.string = `${this.iMovesCount}`;
        this.initTables();
        this.board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            if (this.isEnableTouch == false) return;
            this.clearSelectedItem();
            this.startPoint = event.getUILocation().clone();
            this.getAvailabelCell(this.startPoint);
            for (let i = 0; i < this.arrItems.length; i++) {
                this.arrItems[i].getComponent(FruitItem).setScaleAnim(false);
            }
        }, this);
        this.board.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            if (this.isEnableTouch == false) return;
            let p = event.getUILocation().clone();
            //get available cell
            this.getAvailabelCell(p);
        }, this);
        this.board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            if (this.isEnableTouch == false) return;
            this.graphics.clear();
            //--check clear line //

            if (this.arrSelectedItems.length > 2) {
                for (let i = 0; i < this.arrSelectedItems.length; i++) {
                    let idx = this.arrSelectedItems[i];
                    let itemInfo = this.arrItems[idx].getComponent(FruitItem);
                    if (itemInfo.info.type == 1) {
                        let currentCount = parseInt(this.lbCount1.string);
                        currentCount++;
                        if (currentCount < 90) {
                            this.lbCount1.string = `${currentCount}`;
                        }
                    } else if (itemInfo.info.type == 2) {
                        let currentCount = parseInt(this.lbCount2.string);
                        currentCount++;
                        if (currentCount < 90) {
                            this.lbCount2.string = `${currentCount}`;
                        }

                    } else if (itemInfo.info.type == 3) {
                        let currentCount = parseInt(this.lbCount3.string);
                        currentCount++;
                        if (currentCount < 90) {
                            this.lbCount3.string = `${currentCount}`;
                        }
                    } else if (itemInfo.info.type == 4) {
                        let currentCount = parseInt(this.lbCount4.string);
                        currentCount++;
                        if (currentCount < 90) {
                            this.lbCount4.string = `${currentCount}`;
                        }
                    }
                    itemInfo.playDestroy();
                }
                this.iMovesCount--;
                this.lbMoves.string = `${this.iMovesCount}`;
            } else {
                this.clearSelectedItem();
            }
        }, this);
        this.board.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            if (this.isEnableTouch == false) return;
            this.graphics.clear();
            this.clearSelectedItem();
        }, this);

        //--init size
        this.screenW = this.node.getComponent(UITransform).width;
        this.screenH = this.node.getComponent(UITransform).height;
        this.boardW = this.board.getComponent(UITransform).width;
        this.boardH = this.board.getComponent(UITransform).height;
        this.boardX = this.board.getWorldPosition().x;
        this.boardY = this.board.getWorldPosition().y;
        console.log(`>>>W:${this.screenW}, H:${this.screenH}`);

        //--Auto suggest
        this.suggestLinkItems();

        //--
        GameEvent.AddEventListener("FRUIT_DESTROY_DONE", (info: any) => {
            let w = this.board.getComponent(UITransform).width;
            let h = this.board.getComponent(UITransform).height;
            //--add 1 item to top
            let texId = GameMgr.instance.getRandomInt(0, this.pfItems.length - 3);
            let newItem = instantiate(this.pfItems[texId]);
            newItem.getComponent(FruitItem).init({ row: this.ITEM_PER_ROW, col: info.col, idx: -1, type: texId });
            //--check row col
            let x = newItem.getComponent(FruitItem).info.col * 100;
            let y = newItem.getComponent(FruitItem).info.row * 100;
            newItem.setPosition(x - w / 2 + 50, y - h / 2 + 50);
            this.board.addChild(newItem);
            for (let i = 0; i < this.board.children.length; i++) {
                let item = this.board.children[i];
                let info2 = item.getComponent(FruitItem).info;
                if (info2.col == info.col && info2.row > info.row) {
                    item.getComponent(FruitItem).setMove();
                    // console.log(`item: ${info2.row},${info2.col}`)
                }
            }
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
                //--remove destroyed item
                // for(let i=0;i<this.board.children.length;i++){
                //     let item = this.board.children[i];
                //     if(item.active==false){//first item
                //         console.log(`>>> remove item: ${item.getComponent(FruitItem).info.idx}`)
                //         item.removeFromParent();
                //         // this.board.removeChild(item);
                //     }
                // }
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

                this.isEnableTouch = true;
                //--change info
                console.log("moving done>>>");

            }
        })

        //--
        this.btnBack.on(Button.EventType.CLICK, this.onButtonTouch, this);
    }
    initTables() {
        console.log(">>>initTables");
        // for(let i=0;i<this.icons.length;)
        // GameMgr.instance.random
        let row = 0;
        let col = 0;
        let w = this.board.getComponent(UITransform).width;
        let h = this.board.getComponent(UITransform).height;
        for (let i = 0; i < this.ITEM_PER_ROW * this.ITEM_PER_COL; i++) {
            let texId = GameMgr.instance.getRandomInt(0, this.pfItems.length - 3);
            let item = instantiate(this.pfItems[texId]);
            item.getComponent(FruitItem).init({ row: row, col: col, idx: i, type: texId });

            //--check row col
            let x = col * 100;
            let y = row * 100;
            item.setPosition(x - w / 2 + 50, y - h / 2 + 50);
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
    initSpeed() {
        this.arrSpeed = [];
        for (let i = 0; i < this.ITEM_PER_ROW; i++) {
            this.arrSpeed.push(0);
        }
    }
    getAvailabelCell(pos: Vec2) {//if cell ok -> add to list
        //1.get cell
        let selectedCell = -1;
        for (let i = 0; i < this.arrItems.length; i++) {
            let item = this.arrItems[i];
            let itemPos = item.getWorldPosition();
            let itemSize = item.getComponent(UITransform).contentSize;
            let left = itemPos.x - itemSize.width / 2;
            let right = itemPos.x + itemSize.width / 2;
            let top = itemPos.y + itemSize.height / 2;
            let bottom = itemPos.y - itemSize.height / 2;
            if (pos.x > left && pos.x < right && pos.y > bottom && pos.y < top) {
                selectedCell = i;
                break;
            }
        }
        if (selectedCell == -1) return;

        //1. check cell exists on list or not
        let itemType = -1;
        if (this.arrSelectedItems.length > 0) {
            itemType = this.arrItems[this.arrSelectedItems[0]].getComponent(FruitItem).info.type;
            if (this.arrItems[selectedCell].getComponent(FruitItem).info.type != itemType) {
                return;//difference type;
            }
        }
        for (let i = 0; i < this.arrSelectedItems.length; i++) {
            if (this.arrSelectedItems[i] == selectedCell) {
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
        //draw path
        this.graphics.clear();
        this.graphics.lineWidth = 10;
        this.graphics.fillColor.fromHEX('#54a0ed');
        this.graphics.strokeColor.fromHEX('#54a0ed');
        //
        let idx = this.arrSelectedItems[0];
        let item = this.arrItems[idx];
        this.graphics.moveTo(item.getWorldPosition().x - this.boardX, item.getWorldPosition().y - this.boardY);
        for (let i = 0; i < this.arrSelectedItems.length; i++) {
            idx = this.arrSelectedItems[i];
            item = this.arrItems[idx];
            this.graphics.lineTo(item.getWorldPosition().x - this.boardX, item.getWorldPosition().y - this.boardY);
            this.graphics.stroke();
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
            this.arrItems[this.arrSelectedItems[i]].getComponent(FruitItem).setHL(false);
        }
        this.arrSelectedItems = [];
    }
    //input 1 path, return new path
    // findNextNode(path:number):newpath{
    //     let cells = this.get8CellsAround(path[i])
    // }
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
            let random = GameMgr.instance.getRandomInt(0, this.arrSuggest.length - 1);
            let line = this.arrSuggest[random];
            for (let i = 0; i < line.length; i++) {
                let idx = line[i];
                this.arrItems[idx].getComponent(FruitItem).setScaleAnim(true);
            }
        }
    }
    onButtonTouch(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[0]);
        switch (button.node.name) {
            case 'btnBack':
                if (this.isBackPressed) return;
                this.isBackPressed = true;
                AudioMgr.inst.stop();
                AudioMgr.inst.bgm.clip = null;
                GameEvent.RemoveEventListener('FRUIT_DESTROY_DONE');
                GameEvent.RemoveEventListener('FRUIT_CHECK_MOVE_DONE');
                director.loadScene('lobby');
                break;
        }
    }
    // update(deltaTime: number) {

    // }
}

