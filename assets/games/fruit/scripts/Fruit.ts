import { _decorator, Component, EventTouch, Graphics, instantiate, LightingStage, Node, Prefab,SpriteFrame, UITransform, Vec2 } from 'cc';
import GameMgr from '../../../core/GameMgr';
import { FruitItem } from './FruitItem';
const { ccclass, property } = _decorator;

@ccclass('Fruit')
export class Fruit extends Component {
    @property({type:Node})
    board: Node | null = null;
    @property({type:Prefab})
    pfItem: Prefab | null = null;
    @property({type:Prefab})
    pfItemTop: Prefab | null = null;
    @property([SpriteFrame])
    arrIcon:SpriteFrame[] = []
    @property([SpriteFrame])
    arrIconHL:SpriteFrame[] = []
    @property([SpriteFrame])
    arrBomb:SpriteFrame[] = []
    @property({type:Graphics})
    graphics:Graphics | null = null;
    startPoint:Vec2 = null;
    endPoint:Vec2 = null;
    private screenW:number = 1920;
    private screenH:number = 1080;
    private boardH:number=800;
    private boardW:number=800;
    private boardX:number=0;
    private boardY:number=0;
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
        [0,     1,      2,      3,      4,      5,      6,      7],
        [8,     9,      10,     11,     12,     13,     14,     15],
        [16,    17,     18,     19,     20,     21,     22,     23],
        [24,    25,     26,     27,     28,     29,     30,     31],
        [32,    33,     34,     35,     36,     37,     38,     39],    
        [40,    41,     42,     43,     44,     45,     46,     47],  //|row 2
        [48,    49,     50,     51,     52,     53,     54,     55],  //|row 1
        [56,    57,     58,     59,     60,     61,     62,     63]   //|row 0
      //col0, col1, col2,...........
    ]
    start() {
        this.initTables();
        this.board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            this.clearSelectedItem();
            this.startPoint = event.getUILocation().clone();
            this.getAvailabelCell(this.startPoint);
        }, this);
        this.board.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            let p = event.getUILocation().clone();
            //get available cell
            this.getAvailabelCell(p);

        }, this);
        this.board.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            // this.endPoint = event.getUILocation().clone();
            this.graphics.clear();
            this.clearSelectedItem();
        }, this);
        this.board.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
           this.graphics.clear();
           this.clearSelectedItem();
        }, this);

        //--init size
        this.screenW = this.node.getComponent(UITransform).width;
        this.screenH = this.node.getComponent(UITransform).height;
        this.boardW  = this.board.getComponent(UITransform).width;
        this.boardH  = this.board.getComponent(UITransform).height;
        this.boardX  = this.screenW/2;
        this.boardY  = this.boardH/2;
        console.log(`>>>W:${this.screenW}, H:${this.screenH}`);
    }
    initTables(){
        // for(let i=0;i<this.icons.length;)
        // GameMgr.instance.random
        let row = 0;
        let col = 0;
        let w = this.board.getComponent(UITransform).width;
        let h = this.board.getComponent(UITransform).height;
        for(let i=0;i<this.ITEM_PER_ROW*this.ITEM_PER_COL;i++){
            let texId = GameMgr.instance.getRandomInt(0, this.arrIcon.length-3);
            let tex = this.arrIcon[texId];
            let texHL = this.arrIconHL[texId];
            let texBomB = this.arrBomb[texId];
            let item = instantiate(this.pfItem);
            item.getComponent(FruitItem).init(tex,texHL,texBomB,{row:row,col:col,idx:i,type:tex});

            //--check row col
            let x = col*100;
            let y = row*100;
            item.setPosition(x-w/2+50,y-h/2+50);
            this.board.addChild(item);
            col++;
            if(col==this.ITEM_PER_COL){
                col = 0;
                row++;
            }
            // console.log(`>>>id:${i}, x:${item.getWorldPosition().x},y:${item.getWorldPosition().y}`);
        }
    }
    getAvailabelCell(pos:Vec2){//if cell ok -> add to list
        //1.get cell
        let selectedCell = -1;
        for(let i=0;i<this.board.children.length;i++){
            let item = this.board.children[i];
            let itemPos = item.getWorldPosition();
            let itemSize = item.getComponent(UITransform).contentSize;
            let left = itemPos.x - itemSize.width/2;
            let right= itemPos.x + itemSize.width/2;
            let top  = itemPos.y + itemSize.height/2;
            let bottom=itemPos.y - itemSize.height/2;
            if(pos.x>left && pos.x<right && pos.y>bottom && pos.y<top){
                selectedCell = i;
                break;
            }
        }
        if(selectedCell==-1) return;

         //1. check cell exists on list or not
        let itemType = -1;
        if(this.arrSelectedItems.length>0){
             itemType = this.board.children[this.arrSelectedItems[0]].getComponent(FruitItem).info.type;
             if(this.board.children[selectedCell].getComponent(FruitItem).info.type!=itemType){
                 return;//difference type;
             }
        }
        let checkExist=(idx:number)=>{
            for(let i=0;i<this.arrSelectedItems.length;i++){
                if(this.arrSelectedItems[i]==idx){
                    return true;
                }
            }
            return false;
        };
        if(checkExist(selectedCell)) return;

        //--3.check dieu kien co the highlight kg
        let isHighLight = false;
        /*                 .row direction
                1   2   3 /|\
                0  cell 4  |
                7   6   5  |---->col direction
        */
        let info = this.board.children[selectedCell].getComponent(FruitItem).info;
        let cells=[
            {row:info.row,col:info.col-1},//cell0
            {row:info.row+1,col:info.col-1},//cell1
            {row:info.row+1,col:info.col},
            {row:info.row+1,col:info.col+1},
            {row:info.row,col:info.col+1},
            {row:info.row-1,col:info.col+1},//5
            {row:info.row-1,col:info.col},
            {row:info.row-1,col:info.col-1}//7
        ];

        //--check cell is avaliable
        let preIdx  = -1;
        for(let i=0;i<cells.length;i++){
            let cell = cells[i];
            if(cell.col<0 || cell.col>=this.ITEM_PER_COL)continue;//skip
            if(cell.row<0 || cell.row>=this.ITEM_PER_ROW)continue;//skip
            let idx = this.MaxTrix[cell.row][cell.col];
            if(checkExist(idx)){//hop le
                if(idx==this.arrSelectedItems[this.arrSelectedItems.length-1]){
                    preIdx = idx;
                    break;
                }
            }
        }

        if(preIdx==-1 && this.arrSelectedItems.length>0) return;
        //--all passed
        this.arrSelectedItems.push(selectedCell);
        //highlight
        this.board.children[selectedCell].getComponent(FruitItem).setHL(true);
        //draw path
        this.graphics.clear();
        this.graphics.lineWidth = 10;
        this.graphics.fillColor.fromHEX('#54a0ed');
        this.graphics.strokeColor.fromHEX('#54a0ed');
        //
        let idx= this.arrSelectedItems[0];
        let item = this.board.children[idx];
        this.graphics.moveTo(item.getWorldPosition().x-this.boardX,item.getWorldPosition().y-this.boardY);
        for(let i=0;i<this.arrSelectedItems.length;i++){
            idx = this.arrSelectedItems[i];
            item = this.board.children[idx];
            this.graphics.lineTo(item.getWorldPosition().x-this.boardX,item.getWorldPosition().y-this.boardY);
            this.graphics.stroke();
        }
    }
    clearSelectedItem(){
        for(let i=0;i<this.arrSelectedItems.length;i++){
            this.board.children[this.arrSelectedItems[i]].getComponent(FruitItem).setHL(false);
        }
        this.arrSelectedItems = [];
    }
    suggestLinkItem(){
        
    }
    // update(deltaTime: number) {
        
    // }
}

