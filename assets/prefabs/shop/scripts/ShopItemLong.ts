import { _decorator, Component, Node, Label } from 'cc';
import GameMgr from '../../../core/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('ShopItemLong')
export class ShopItemLong extends Component {
    @property({ type: Label })
    lbPrice: Label | null = null;
    @property({ type: Label })
    lbOldChip: Label | null = null;
    @property({ type: Node })
    iconLineThrough: Node | null = null;
    @property({ type: Label })
    lbNewChip: Label | null = null;
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
    info = {id:1,productId:'shop_chips_9.99',chips:3000000,payment:'9.99',bonus:1,flag:[]}
    idx = 0;
    start() {

    }
    setInfo(info:any, idx: number){
        this.info = info;
        this.idx  = idx;
        this.lbPrice.string = `$${info.payment}`;
        if(this.info.bonus>1){
            this.lbDiscountPercent.node.active = true;
            this.lbOldChip.node.active = true;
            this.lbOldChip.string = GameMgr.instance.numberWithCommas(this.info.chips);
            let newChip = this.info.chips * this.info.bonus;
            this.lbNewChip.string = GameMgr.instance.numberWithCommas(newChip);
            let percent = this.info.bonus*100;
            this.lbDiscountPercent.string = `${percent}%`;
            if(this.idx==2 || this.idx==3){
                this.iconArrow.active = true;
                this.lbDiscountPercent.node.active = true;
            } else {
                this.iconArrow.active = false;
                this.lbDiscountPercent.node.active = false;
            }
        } else {
            this.lbDiscountPercent.node.active = false;
            this.lbOldChip.node.active = false;
            this.iconArrow.active = false;
            this.lbNewChip.string = GameMgr.instance.numberWithCommas(this.info.chips);
        }
        this.bestValue.active = false;
        this.mostPopular.active = false;
        if(this.info.flag.length>0){
            if(this.info.flag[0]=='best' || this.info.flag[0]=='most'){
                if(this.idx == 2 || this.idx==3){
                    this.bestValue.active = true;
                } else {
                    this.mostPopular.active = true;
                }
            } else {
                this.bestValue.active = false;
                this.mostPopular.active = false;
            }
        }
    }
}

