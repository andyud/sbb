import { _decorator, Component, Node, Label, Button, sys, native, Prefab, instantiate, UITransform} from 'cc';
import GameMgr from '../../../core/GameMgr';
import { ShopItemLong } from './ShopItemLong';
import { Notice } from '../../popups/scripts/Notice';
const { ccclass, property } = _decorator;

@ccclass('Shop')
export class Shop extends Component {
    @property({ type: Label })
    lbPurchaseResult: Label | null = null;
    @property({ type: Node })
    purchaseResult: Node | null = null;
    @property([Node])
    arrItems:Node[] = [];
    @property({ type: Prefab })
    pfNotice: Prefab | null = null;
    private notice: Node = null;
    public selectedItem = {id:'1',name:'3,000,000 Chips',type:'',price:'',discount:0}
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
        if(sys.isNative){
            native.jsbBridgeWrapper.addNativeEventListener("purchaseres",(res: string)=>{
                console.log(`purchaseres: `+ res);
                if(res=='error'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Invalid product!" }, () => {  });
                } else if(res=='cancel'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Purchase has canceled!" }, () => {  });
                } else if(res=='invalid'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Invalid payment!" }, () => {  });
                }  else {
                    this.purchaseResult.active = true;
                    this.lbPurchaseResult.string = this.selectedItem.name;
                }
            });
        }
        if (this.notice == null) {
            this.notice = instantiate(this.pfNotice);
            this.node.addChild(this.notice);
            this.notice.getComponent(UITransform).setContentSize(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height);
            this.notice.getComponent(Notice).hide();
        }
    }
    onCloseShop(){
        this.node.active = false;
    }
    onClosePurchaseResult(){
        this.purchaseResult.active = false;
    }
    onClick(button: Button) {
        let itemInfo = button.node.getComponent(ShopItemLong).info;
        this.selectedItem = itemInfo;
        if(sys.isNative){
            native.jsbBridgeWrapper.dispatchEventToNative('buyproduct',itemInfo.id);
        } else {
            // this.purchaseResult.active = true;
            // this.lbPurchaseResult.string = this.selectedItem.name;
            this.notice.getComponent(Notice).show({ title: 'Notice', content: "Invalid payment!" }, () => {  });
        }
    }
}