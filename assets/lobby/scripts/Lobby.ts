import { _decorator, Button, Component, director, Label, Node } from 'cc';
import APIMgr from '../../core/APIMgr';
const { ccclass, property } = _decorator;

@ccclass('Lobby')
export class Lobby extends Component {
    @property({type:Label})
    lbNickName:Label | null = null;

    @property({type:Label})
    lbBalance:Label | null = null;

    @property({type:Label})
    lbLevel:Label | null = null;

    @property([Node])
    arrGames: Node[] = []
    start() {
        //--add listener
        for(let i=0;i<this.arrGames.length;i++){
            this.arrGames[i].on(Button.EventType.CLICK,this.gameClickHandler,this);
        }

        this.loadPlayerInfo();
        this.connectLobby();
    }
    loadPlayerInfo(){
        this.lbBalance.string = `${APIMgr.instance.signinRes.balance}`;
        this.lbLevel.string = `${APIMgr.instance.signinRes.level}`;
    }
    async connectLobby(){
        await APIMgr.instance.getGames();
    }
    gameClickHandler(button: Button) {
        // SoundMgr.instance.playButtonClick();
        // console.log(button.node.name);
        switch (button.node.name) {
            case 'demthuonghai':
                director.loadScene('demthuonghai')
                APIMgr.instance.setCurrentGame('demthuonghai');
                break;
        //     case 'cowboy':
        //         director.loadScene('cowboy')
        //         APIMgr.instance.setCurrentGame('demthuonghai');
        //         APIMgr.instance.getGameInfo(`${APIMgr.instance.gamesRes.list[0].id}`);
        //         break;
            case 'panda':
                director.loadScene('cowboy')
                APIMgr.instance.setCurrentGame('demthuonghai');
                break;
            case 'tayduky':
                director.loadScene('cowboy')
                APIMgr.instance.setCurrentGame('demthuonghai');
                break;
        }
        director.loadScene(button.node.name);
    }
    // update(deltaTime: number) {
        
    // }
}