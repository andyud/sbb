import { _decorator, Component, easing, instantiate, Node, Prefab, tween, Tween, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CowboyReel')
export class CowboyReel extends Component {
    private x:number = 0;
    private w:number = 0;
    private h:number = 0;
    private parentH:number = 0;
    callback:()=>void;
    setReelCallback(cb:()=>void){
        this.callback = cb;
    }
    getSize() {
        this.x = this.node.getPosition().x;
        this.w = this.node.getComponent(UITransform).width;
        this.h = this.node.getComponent(UITransform).height;
        this.parentH = this.node.parent.getComponent(UITransform).height;
    }
    init(arr:any,icons:any){
        for(let i=0;i<arr.length;i++){
            let idx = arr[i];
            let icon = instantiate(icons[idx]);
            this.node.addChild(icon);   
        }
    }
    spin(index: number,speed: number){
        this.getSize();
        console.log(`Reel h=${this.h}, parentH = ${this.parentH}`)
        let self = this;
        tween(this.node)
        .delay(index*0.1)
        .to(speed,{position: new Vec3(this.x,-(this.h-this.parentH))},{easing:"elasticInOut"})
        .call(()=>{
            if(index==4){//final reels
                this.callback();
            }
        }).start();
        

        // if (index === 4){
        //     var EF = cc.callFunc(function() {
        //         this.RedT.EF_vuathang();
        //         this.node.y = 0;
        //         this.RedT.random();
        //         this.RedT.hieuUng();
        //     }, this);
        //     this.node.runAction(cc.sequence(cc.delayTime(index*0.1), d, EF));
        // } else
        //     this.node.runAction(cc.sequence(cc.delayTime(index*0.1), d, p2));

        // EF_vuathang: function(){
        //     this.showLineWin(true);
        //     this.vuathang.string       = helper.numberWithCommas(this.H_win);
        //     this.buttonSpin.active     = !this.H_free;
        //     this.buttonSpinSpeed.active     = !this.H_free;
        //     this.freeLabel.string      = 'Free: ' + this.H_free;
        //     this.freeLabel.node.active = !!this.H_free
        // },
        
    }
    stop(){
        Tween.stopAll();
        this.node.setPosition(this.x,0);
    }
}

