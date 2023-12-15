import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShopItemLong')
export class ShopItemLong extends Component {
    @property({ type: Label })
    lbPrice: Label | null = null;
    @property({ type: Label })
    lbOldPrice: Node | null = null;
    @property({ type: Node })
    iconLineThrough: Node | null = null;
    @property({ type: Label })
    lbNewPrice: Node | null = null;
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
    start() {

    }

    onClick(){

    }
}

