import { _decorator, Button, Component, Label, Node, tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Notice')
export class Notice extends Component {
    @property({type:Label})
    lbTitle:Label | null = null;

    @property({type:Label})
    lbContent:Label | null = null;
    
    @property({type:Node})
    btnCloseNotice:Node | null = null;
    
    public cb: (data:string)=>void;

    start() {
        this.btnCloseNotice.on(Button.EventType.CLICK,this.onClick,this);
        this.node.getComponent(UIOpacity).opacity = 0;
    }
    show(data:any,cb:(data:string)=>void){
        this.lbTitle.string = data.title;
        this.lbContent.string = data.content;
        this.cb = cb;
        tween(this.node)
        .to(0.4,{position:new Vec3(0,0,0),scale: new Vec3(1,1,1)})
        .start()
        tween(this.node.getComponent(UIOpacity))
        .to(0.2,{opacity:255})
        .start()
    }
	hide(){
		this.node.getComponent(UIOpacity).opacity = 0;
		this.node.setPosition(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height,0);
		this.node.setScale(0,0,0)
	}
    onClick(button: Button) {
		if(this.node.getComponent(UIOpacity).opacity===0)return;
        switch(button.node.name){
            case "btnCloseNotice":
                tween(this.node)
                .to(0.4,{position:new Vec3(this.node.getComponent(UITransform).width, this.node.getComponent(UITransform).height,0),scale: new Vec3(0,0,0)})
                .start()
                tween(this.node.getComponent(UIOpacity))
                .to(0.2,{opacity:0})
                .call(()=>this.cb(''))
                .start()
                break;
        }
    }
}
/*

cc.Class({
	extends: cc.Component,

	properties: {
		nodeButton: {
			default: null,
			type: cc.Node,
		},
		title: {
			default: null,
			type: cc.Label,
		},
		text: {
			default: null,
			type: cc.Label,
		},
		button: {
			default: null,
			type: cc.Label,
		},
	},
	onDisable: function () {
		this.clean();
	},
	show: function(data) {
		this.node.active = true;
		if (void 0 !== data.load) {
			cc.RedT.inGame.loading.active = !1;
		}
		if (void 0 !== data.title) {
			this.title.string = data.title;
		}
		if (void 0 !== data.text) {
			this.text.string = data.text;
		}
		if (void 0 !== data.button) {
			this.text.node.y   = 8;
			this.type          = data.button.type;
			this.button.string = data.button.text;
			this.nodeButton.active = true;
		}else{
			this.nodeButton.active = false;
			this.text.node.y = -14;
		}
	},
	close: function(){
		cc.RedT.audio.playUnClick();
		this.node.active = false;
	},
	onClickButton: function(){
		cc.RedT.audio.playClick();
		switch(this.type) {
			case 'sign_out':
				this.node.active = false;
				cc.RedT.send({user:{signOut:true}});
				cc.RedT.inGame.resetAuth();
				setTimeout(function(){
					cc.RedT._socket.close();
				}, 100);
			break;
			case 'reg_otp':
				this.node.active = false;
				if (cc.RedT.inGame.dialog.objShow != null) {
					cc.RedT.inGame.dialog.profile.node.previous = cc.RedT.inGame.dialog.objShow;
					cc.RedT.inGame.dialog.objShow.active = false;
				}
				cc.RedT.inGame.dialog.showProfile(null, 'BaoMat');
				cc.RedT.inGame.dialog.profile.BaoMat.onSelectHead(null, 'DangKyOTP');
			break;
		}
	},
	clean: function(){
		this.title.string = this.text.string = this.button.string = '';
	},
});

*/
