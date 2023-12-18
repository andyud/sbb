import { _decorator, Component, director, Node, UITransform, Vec3, sys, native, Game} from 'cc';
import APIMgr from '../../core/APIMgr';
import GameMgr from '../../core/GameMgr';
const { ccclass, property } = _decorator;

@ccclass('Splash')
export class Splash extends Component {
    @property({type:Node})
    loadingBar:Node | null = null;
    @property({type:Node})
    star:Node | null = null;
    private percent = 0;
    private isCheckingDone = false;
    start() {
        //--get product id list
        if(sys.os == sys.OS.ANDROID && sys.isNative){
            native.jsbBridgeWrapper.addNativeEventListener("getproductlist",(products: string)=>{
                console.log(`getproductlist ${products}`);
                if(this.isCheckingDone==false){
                    this.isCheckingDone = true;
                    GameMgr.instance.IAB_PRODUCTS = [];
                    let arr = products.split('@');

                    for(let i=0;i<arr.length;i++){
                        let arr2 = arr[i].split('#');
                        if(arr2.length==4){
                            let item = {
                                id: arr2[0],
                                name:arr2[1],
                                type:arr2[2],
                                price:`${arr2[3]}`,
                                discount:0
                            };
                            GameMgr.instance.IAB_PRODUCTS.push(item);
                        }
                    }
                    console.log(JSON.stringify(GameMgr.instance.IAB_PRODUCTS));
                    if(this.percent>=100){
                        director.loadScene('login');
                    }
                }

            });
            if(sys.os == sys.OS.ANDROID && sys.isNative){
                let str = '';
                for(let i=0;i<GameMgr.instance.IAB_PRODUCTS.length;i++){
                    if(i>0){
                        str+='@';
                    }
                    str+=GameMgr.instance.IAB_PRODUCTS[i].id;
                }
                GameMgr.instance.IAB_PRODUCTS = [];
                native.jsbBridgeWrapper.dispatchEventToNative('getproductlist',str);
            } else {//web
                // this.signinToServer();
                this.isCheckingDone = true;
                if(this.percent>=100){
                    director.loadScene('login');
                }
            }
        } else {
            this.isCheckingDone = true;
        }
    }

    private updateProgress(){
        if(this.loadingBar && this.loadingBar.parent){
            let w = this.loadingBar.parent.getComponent(UITransform).width;
            let progress = (this.percent/100) * w;
            this.loadingBar.getComponent(UITransform).width = progress;
            if(progress>w*0.99){
                progress = w*0.99;
                if(this.isCheckingDone){
                    director.loadScene('login');
                }
            }
            this.star.position    =  new Vec3(progress - w/2 - this.star.getComponent(UITransform).width/2, 0);
        } else {
            this.percent = 0;
        }
	}
    update(deltaTime: number) {
        if(this.percent<100){
            this.percent++;
            this.updateProgress()
        }
    }
}