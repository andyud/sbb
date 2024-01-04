import { _decorator, Component, Node, Label, Button, sys, native, Prefab, instantiate, UITransform } from 'cc';
import GameMgr from '../../../core/GameMgr';
import { ShopItemLong } from './ShopItemLong';
import { Notice } from '../../popups/scripts/Notice';
import APIMgr from '../../../core/APIMgr';
import { GameEvent } from '../../../core/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('Shop')
export class Shop extends Component {
    @property({ type: Label })
    lbPurchaseResult: Label | null = null;
    @property({ type: Node })
    purchaseResult: Node | null = null;
    @property([Node])
    arrItems: Node[] = [];
    @property({ type: Prefab })
    pfNotice: Prefab | null = null;
    private notice: Node = null;
    public selectedItem = { id: '1', name: '3,000,000 Chips', type: '', price: '', discount: 0 }
    public selectedIdx = 0;
    start() {
        this.purchaseResult.active = false;
        for (let i = 0; i < this.arrItems.length; i++) {
            this.arrItems[i].on(Button.EventType.CLICK, this.onClick, this);
            if (i < GameMgr.instance.IAB_PRODUCTS.length) {
                let itemInfo = GameMgr.instance.IAB_PRODUCTS[i];
                this.arrItems[i].getComponent(ShopItemLong).setInfo(itemInfo,i);
            } else {
                this.arrItems[i].active = false;
            }
        }
        if (sys.isNative) {
            native.jsbBridgeWrapper.addNativeEventListener("purchaseres", (res: string) => {
                console.log(`purchaseres: ` + res);
                if (res == 'error') {
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Invalid product!" }, () => { });
                } else if (res == 'cancel') {
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Purchase has canceled!" }, () => { });
                } else if (res == 'invalid') {
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Invalid payment!" }, () => { });
                } else {
                    this.lbPurchaseResult.string = this.selectedItem.name;
                    let platform = (sys.os == sys.OS.ANDROID) ? 1 : 2;
                    let arr = res.split('@');
                    let token = "";
                    let receipt = "";
                    if(arr.length>0){
                        receipt = arr[0];
                    }
                    if(arr.length>1){
                        token = arr[1];
                    }
                    let goods_id = this.selectedIdx+1;
                    let self = this;
                    APIMgr.instance.purchase(receipt, goods_id, token,platform, (isSuccess:boolean,chips:number)=>{
                        if(isSuccess){
                            self.purchaseResult.active = true;
                            GameMgr.instance.numberTo(self.lbPurchaseResult,0,chips,1000);
                            GameEvent.DispatchEvent("updatebalance",APIMgr.instance.purchaseRes.balance);
                        } else {
                            self.purchaseResult.active = false;
                            self.notice.getComponent(Notice).show({title: 'Notice', content: 'Purchase failed'},()=>{});
                        }
                    });
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
    onCloseShop() {
        this.node.active = false;
    }
    onClosePurchaseResult() {
        this.purchaseResult.active = false;
    }
    onClick(button: Button) {
        let itemInfo = button.node.getComponent(ShopItemLong).info;
        this.selectedItem = itemInfo;
        this.selectedIdx  = button.node.getComponent(ShopItemLong).idx;
        if (sys.isNative) {
            native.jsbBridgeWrapper.dispatchEventToNative('buyproduct', itemInfo.id);
        } else {
            this.notice.getComponent(Notice).show({ title: 'Notice', content: "Invalid payment!" }, () => { });

            //test iap
            // let str = "GPA.3351-3174-5970-74320@fpebnljpgaibpaafjlggpnkl.AO-J1OzXF2CgZJfIHdhTdnynXKUJSjNKwuEnu9mFhxV5z6WFH4fzLCERMqPyYjGp1HGjVXa7Q24GE4iiMMdSh0LufkvjyDhPeTkEMrawkpsc-gx-u9zM10Q@shop_chips_0.99";
            // let arr = str.split('@');
            // APIMgr.instance.purchase(arr[0],1,arr[1],1,(isSuccess:boolean,chips:number)=>{
            //     if(isSuccess){
            //         this.purchaseResult.active = true;
            //         GameMgr.instance.numberTo(this.lbPurchaseResult,0,chips,1000);
            //         GameEvent.DispatchEvent("updatebalance",APIMgr.instance.purchaseRes.balance);
            //     } else {
            //         this.purchaseResult.active = false;
            //         this.notice.getComponent(Notice).show({title: 'Notice', content: 'Purchase failed'},()=>{});
            //     }
            // });
        }
    }
}