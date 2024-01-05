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
    public selectedItem = {id:1,productId:'shop_chips_9.99',chips:3000000,payment:'9.99',bonus:1,flag:[]};
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
                } else if (res == 'failed') {
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Purchase has failed!" }, () => { });
                }
                else {
                    let newChips = GameMgr.instance.IAB_PRODUCTS[this.selectedIdx].chips*GameMgr.instance.IAB_PRODUCTS[this.selectedIdx].bonus;
                    this.lbPurchaseResult.string = GameMgr.instance.numberWithCommas(newChips);
                    this.purchaseResult.active = true;
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
                    let goods_id = GameMgr.instance.IAB_PRODUCTS[this.selectedIdx].id;
                    APIMgr.instance.purchase(receipt, goods_id, token,platform);
                    GameMgr.instance.numberTo(this.lbPurchaseResult,0,newChips,1000);
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
            native.jsbBridgeWrapper.dispatchEventToNative('buyproduct', itemInfo.productId);
        } else {
            this.notice.getComponent(Notice).show({ title: 'Notice', content: "Invalid payment!" }, () => { });

            //test iap
            // let str = "GPA.3376-9552-2976-57039@debhbblcllbmpojhfpgimgoo.AO-J1Oz_5-Sg5PAJy2Lt2m073Z5XYLOujH5oNLl_tmqaYlNOoXNUuTIcz0KmW2LKTJxPmT8_QGulJpglnpQxUEZYS-vaMc6OTqWSbE5MF39LUXZS2amF2U8";
            // let arr = str.split('@');
            // APIMgr.instance.purchase(arr[0],1,arr[1],1);
        }
    }
}