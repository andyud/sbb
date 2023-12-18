import { _decorator, Component, Node, Label, Button, sys, native} from 'cc';
import GameMgr from '../../../core/GameMgr';
import { ShopItemLong } from './ShopItemLong';
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
            if(i<GameMgr.instance.IAB_PRODUCTS.length){
                let itemInfo = GameMgr.instance.IAB_PRODUCTS[i];
                this.arrItems[i].getComponent(ShopItemLong).setInfo(itemInfo);
            } else {
                this.arrItems[i].active = false;
            }
        }
        if(sys.os == sys.OS.ANDROID && sys.isNative){
            native.jsbBridgeWrapper.addNativeEventListener("purchaseres",(res: string)=>{
                console.log(`purchaseres: `+ res);
                if(res=='failed'){

                } else {
                    this.purchaseResult.active = true;
                }
            });
        }
    }
    onCloseShop(){
        this.node.active = false;
    }
    onClosePurchaseResult(){
        this.purchaseResult.active = false;
    }
    onClick(button: Button) {
        if(sys.os == sys.OS.ANDROID && sys.isNative){
            let itemInfo = button.node.getComponent(ShopItemLong).info;
            native.jsbBridgeWrapper.dispatchEventToNative('buyproduct',itemInfo.id);
        }
    }
}