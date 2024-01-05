import { _decorator, Component, Node, Button, director,AudioClip,Prefab,UITransform, instantiate, sys, native, UIOpacity, tween, Vec3} from 'cc';
const { ccclass, property } = _decorator;
import { AudioMgr } from '../../core/AudioMgr';
import { Loading } from '../../prefabs/loading/Loading';
import APIMgr from '../../core/APIMgr';
import { Notice } from '../../prefabs/popups/scripts/Notice';
@ccclass('Login')
export class Login extends Component {
    @property({ type: Node })
    btnGuest: Node | null = null;
    @property({ type: Node })
    btnFacebook: Node | null = null;
    @property({ type: Node })
    btnGoogle: Node | null = null;
    @property({ type: Node })
    btnCheck: Node | null = null;
    @property({ type: Node })
    iconCheck: Node | null = null;
    @property([AudioClip])
    arrAudioClips: AudioClip[] = [];
    @property({ type: Prefab })
    pfLoading: Prefab | null = null;
    private loading: Node = null;
    @property({ type: Prefab })
    pfNotice: Prefab | null = null;
    private notice: Node = null;
    @property({ type: Node })
    loginNode: Node | null = null;
    @property({type:Node})
    loadingToLobby: Node = null;
    @property({type:Node})
    loadingBar:Node | null = null;
    @property({type:Node})
    star:Node | null = null;
    @property({type:Node})
    gameIcon:Node | null = null;

    private percent = 1000;
    start() {
        this.btnGuest.on(Button.EventType.CLICK, this.onClick, this);
        this.btnFacebook.on(Button.EventType.CLICK, this.onClick, this);
        this.btnGoogle.on(Button.EventType.CLICK, this.onClick, this);
        this.btnCheck.on(Button.EventType.CLICK, this.onClick, this);
        //--init loading
        this.gameIcon.getComponent(UIOpacity).opacity = 0;
        this.loadingToLobby.active = false;
        this.loginNode.getComponent(UIOpacity).opacity = 0;
		this.loginNode.setPosition(0,-1500);
        this.show();
        this.iconCheck.active = true;
        if (this.loading == null) {
            this.loading = instantiate(this.pfLoading);
            this.node.addChild(this.loading);
            this.loading.getComponent(UITransform).setContentSize(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height);
        }
        if (this.notice == null) {
            this.notice = instantiate(this.pfNotice);
            this.node.addChild(this.notice);
            this.notice.getComponent(UITransform).setContentSize(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height);
            this.notice.getComponent(Notice).hide();
        }

        //--get iap
        if(sys.isNative){
            native.jsbBridgeWrapper.addNativeEventListener("getdeviceid",(mydeviceid: string)=>{
                console.log(`getdeviceid ${mydeviceid}`);
                APIMgr.instance.deviceId = mydeviceid;
                this.signinToServer();
            })
            native.jsbBridgeWrapper.addNativeEventListener("getfacebookid",(mydeviceid: string)=>{
                console.log(`getfacebookid ${mydeviceid}`);
                if(mydeviceid=='cancel'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login cancel!" }, () => {  });
                    this.hideSmallLoading();
                } else if(mydeviceid=='error'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login error!" }, () => {  });
                    this.hideSmallLoading();
                } else {//success
                    APIMgr.instance.deviceId = mydeviceid;
                    this.signinToServer();
                }
            })
            native.jsbBridgeWrapper.addNativeEventListener("getgoogleid",(mydeviceid: string)=>{
                console.log(`getgoogleid ${mydeviceid}`);
                if(mydeviceid=='cancel'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login cancel!" }, () => {  });
                    this.hideSmallLoading();
                } else if(mydeviceid=='error'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login error!" }, () => {  });
                    this.hideSmallLoading();
                } else {//success
                    APIMgr.instance.deviceId = mydeviceid;
                    this.signinToServer();
                }
            })
        }
    }
    show(){
        tween(this.loginNode)
        .to(0.4,{position:new Vec3(0,0,0),scale: new Vec3(1,1,1)})
        .start()
        tween(this.loginNode.getComponent(UIOpacity))
        .to(0.2,{opacity:255})
        .start()
    }
	hide(){
        tween(this.loginNode)
        .to(0.4,{position:new Vec3(0,-1500,0),scale: new Vec3(1,1,1)})
        .start()
        tween(this.loginNode.getComponent(UIOpacity))
        .to(0.2,{opacity:0})
        .start()
	}
    async signinToServer(){
        await APIMgr.instance.signin((res:boolean)=>{
            if(res){
                this.hideSmallLoading();
                this.hide();
                this.loadingToLobby.active = true;
                this.percent = 0;
                tween(this.gameIcon.getComponent(UIOpacity))
                .to(1,{opacity:255})
                .start()
                this.connectLobby();
            } else {
                this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login error" }, () => {  });
            }
        });
    }
    async connectLobby(){
        await APIMgr.instance.getGames();
        await APIMgr.instance.getProductlist();
        for(let i=0;i<APIMgr.instance.gamesRes.list.length;i++){
            await APIMgr.instance.getJackpotPool(APIMgr.instance.gamesRes.list[i].id);
        }
        director.loadScene('lobby');
    }
    onClick(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[1]);
        switch (button.node.name) {
            case 'btnPlayAsGuest':
                if(!this.iconCheck.active){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Please accept agreement!" }, () => {  });
                    return;
                }
                this.showSmallLoading();
                if(sys.isNative){//android & ios
                    native.jsbBridgeWrapper.dispatchEventToNative('javascript_to_java','getdeviceid');
                } else {//web
                    this.signinToServer();
                }
                break;
            case 'btnFacebook':
                if(!this.iconCheck.active){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Please accept agreement!" }, () => {  });
                    return;
                }
                this.showSmallLoading();
                if(sys.isNative){
                    native.jsbBridgeWrapper.dispatchEventToNative('javascript_to_java','getfacebookid');
                } else {//web
                    this.signinToServer();
                }
                break;
            case 'btnGoogle':
                if(!this.iconCheck.active){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Please accept agreement!" }, () => {  });
                    return;
                }
                this.showSmallLoading();
                if(sys.isNative){
                    native.jsbBridgeWrapper.dispatchEventToNative('javascript_to_java','getgoogleid');
                } else {//web
                    this.signinToServer();
                }
                break;
            case 'btnCheck':
                this.iconCheck.active = !this.iconCheck.active;
                break;
        }
    }
    hideSmallLoading() {
        this.loading.getComponent(Loading).hide();
    }
    showSmallLoading(){
        this.loading.getComponent(Loading).show();
    }
    private updateProgress(){
        if(this.loadingBar && this.loadingBar.parent){
            let w = this.loadingBar.parent.getComponent(UITransform).width;
            let progress = (this.percent/300) * w;
            this.loadingBar.getComponent(UITransform).width = progress;
            if(progress>w*0.99){
                progress = w*0.99;
            }
            this.star.position    =  new Vec3(progress - w/2 - this.star.getComponent(UITransform).width/2, 0);
        } else {
            this.percent = 0;
        }
	}
    update(deltaTime: number) {
        if(this.percent<300){
            this.percent++;
            this.updateProgress()
        }
    }
}

