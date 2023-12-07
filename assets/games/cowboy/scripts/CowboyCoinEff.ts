import { _decorator, Component, dragonBones, tween,Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CowboyCoinEff')
export class CowboyCoinEff extends Component {
    @property({type:dragonBones.ArmatureDisplay})
    coint: dragonBones.ArmatureDisplay | null = null;
	private changer = false;
	private startPos = new Vec3()
	private endPos = new Vec3()
	init(startPos:Vec3, endPos:Vec3) {
		this.startPos = startPos;
		this.endPos = endPos;
		this.coint.on(dragonBones.EventObject.LOOP_COMPLETE, this.COMPLETE, this);
		let x = startPos.x + Math.random()*100 - Math.random()*100;
		let y = startPos.y + Math.random()*100;
		this.changer = false;
		this.node.setPosition(x,y);
	}
	
	COMPLETE(){
		if (this.changer === false) {
			this.coint.playAnimation('rotation', 0);
			tween(this.node)
			.to(0.1,{position:this.endPos})
			.to(0.2,{scale:new Vec3(0.4,0.4,0.4)})
			.call(()=>{
				this.node.destroy();
			})
			.start()
		}
		this.changer = true;
	}
}

