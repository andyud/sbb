import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShopItemLong')
export class ShopItemLong extends Component {
    @property({ type: Label })
    lbName: Label | null = null;
    @property({ type: Label })
    lbOldPrice: Label | null = null;
    @property({ type: Node })
    iconLineThrough: Node | null = null;
    @property({ type: Label })
    lbNewPrice: Label | null = null;
    @property({ type: Label })
    lbDiscountPercent: Label | null = null;
    @property({ type: Node })
    iconCoin: Node | null = null;
    @property({ type: Node })
    iconArrow: Node | null = null;
    @property({ type: Node })
    bestValue: Node | null = null;
    @property({ type: Node })
    mostPopular: Node | null = null;
    info = {id:'1',name:'',type:'',price:'',discount:0}
    idx = 0;
    start() {

    }
    setInfo(info:any, idx: number){
        this.info = info;
        this.idx  = idx;
        this.lbName.string = info.name;
        if(this.info.discount>0){
            this.lbDiscountPercent.node.active = true;
            this.lbDiscountPercent.string = `${info.discount}%`;
            this.lbOldPrice.node.active = true;
            this.lbOldPrice.string = `${info.price.replace(' Chips(Shop)','')}`;
        } else {
            // this.lbDiscountPercent.node.active = false;
            // this.lbOldPrice.node.active = false;
            // this.iconArrow.active = false;
        }
        this.lbNewPrice.string = `${info.price.replace(' Chips(Shop)','')}`;
        let arrInfo = info.price.split(' ');
        if(arrInfo.length>2){
            this.lbName.string = arrInfo[0];
            this.lbNewPrice.string = arrInfo[2];
        }
    }
}

