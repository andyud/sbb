import { _decorator, Component, Node, Button, director,AudioClip,Prefab,UITransform, instantiate, sys, native} from 'cc';
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
    start() {
        this.btnGuest.on(Button.EventType.CLICK, this.onClick, this);
        this.btnFacebook.on(Button.EventType.CLICK, this.onClick, this);
        this.btnGoogle.on(Button.EventType.CLICK, this.onClick, this);
        this.btnCheck.on(Button.EventType.CLICK, this.onClick, this);

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
        if(sys.os == sys.OS.ANDROID && sys.isNative){
            native.jsbBridgeWrapper.addNativeEventListener("getdeviceid",(mydeviceid: string)=>{
                console.log(`getdeviceid ${mydeviceid}`);
                APIMgr.instance.deviceId = mydeviceid;
                this.signinToServer();
            })
            native.jsbBridgeWrapper.addNativeEventListener("getfacebookid",(mydeviceid: string)=>{
                console.log(`getfacebookid ${mydeviceid}`);
                if(mydeviceid=='cancel'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login cancel!" }, () => {  });
                    this.loading.getComponent(Loading).hide();
                } else if(mydeviceid=='error'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login error!" }, () => {  });
                    this.loading.getComponent(Loading).hide();
                } else if(mydeviceid=='success'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login success!" }, () => {  });
                    APIMgr.instance.deviceId = mydeviceid;
                    this.signinToServer();
                }
            })
            native.jsbBridgeWrapper.addNativeEventListener("getgoogleid",(mydeviceid: string)=>{
                console.log(`getgoogleid ${mydeviceid}`);
                if(mydeviceid=='cancel'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login cancel!" }, () => {  });
                    this.loading.getComponent(Loading).hide();
                } else if(mydeviceid=='error'){
                    this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login error!" }, () => {  });
                    this.loading.getComponent(Loading).hide();
                } else {//success
                    APIMgr.instance.deviceId = mydeviceid;
                    this.signinToServer();
                }
            })
        }
    }
    async signinToServer(){
        await APIMgr.instance.signin((res:boolean)=>{
            if(res){
                this.loading.getComponent(Loading).hide();
                director.loadScene('lobby');
            } else {
                this.notice.getComponent(Notice).show({ title: 'Notice', content: "Login error" }, () => {  });
            }
        });
    }
    onClick(button: Button) {
        AudioMgr.inst.playOneShot(this.arrAudioClips[1]);
        switch (button.node.name) {
            case 'btnPlayAsGuest':
                this.loading.getComponent(Loading).show();
                if(sys.os == sys.OS.ANDROID && sys.isNative){
                    native.jsbBridgeWrapper.dispatchEventToNative('javascript_to_java','getdeviceid');
                } else {//web
                    this.signinToServer();
                }
                break;
            case 'btnFacebook':
                this.loading.getComponent(Loading).show();
                if(sys.os == sys.OS.ANDROID && sys.isNative){
                    native.jsbBridgeWrapper.dispatchEventToNative('javascript_to_java','getfacebookid');
                } else {//web
                    this.signinToServer();
                }
                break;
            case 'btnGoogle':
                this.loading.getComponent(Loading).show();
                if(sys.os == sys.OS.ANDROID && sys.isNative){
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
    hideLoading() {
        this.loading.getComponent(Loading).hide();
    }
    loginDone(){
        this.hideLoading();
        director.loadScene('lobby');
    }
}

