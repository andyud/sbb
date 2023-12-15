import { _decorator, Component, Node, Label, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Shop')
export class Shop extends Component {
    @property({ type: Label })
    lbPurchaseResult: Label | null = null;
    @property({ type: Node })
    purchaseResult: Node | null = null;
    @property([Node])
    arrItems:Node[] = [];
    
    start() {
        this.purchaseResult.active = false;
        for(let i=0;i<this.arrItems.length;i++){
            this.arrItems[i].on(Button.EventType.CLICK,this.onClick,this);
        }
    }
    onCloseShop(){
        this.node.active = false;
    }
    onClosePurchaseResult(){
        this.purchaseResult.active = false;
    }
    onClick(button: Button) {
        // switch (button.node.name) {
        //     case 'btnShop':
        //         this.shop.active = true;
        //         break;
        // }
        this.purchaseResult.active = true;
    }
}