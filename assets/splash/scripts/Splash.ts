import { _decorator, Component, director, Node, UITransform, Vec3} from 'cc';
import APIMgr from '../../core/APIMgr';
const { ccclass, property } = _decorator;

@ccclass('Splash')
export class Splash extends Component {
    @property({type:Node})
    loadingBar:Node | null = null;
    @property({type:Node})
    star:Node | null = null;
    private percent = 0;
    
    start() {
        
    }

    private updateProgress(){
        if(this.loadingBar && this.loadingBar.parent){
            let w = this.loadingBar.parent.getComponent(UITransform).width;
            let progress = (this.percent/100) * w;
            this.loadingBar.getComponent(UITransform).width = progress;
            if(progress>w*0.975){
                progress = w*0.975;
                director.loadScene('login');
            }
            this.star.position    =  new Vec3(progress - w/2 , 0);
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