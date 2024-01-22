import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FruitLevels')
export class FruitLevels extends Component {
    levels = [
        {//1
        MODE:2,
        SIZE:[7,5],
        LIMIT:[0,16],
        COLOR_LIMIT: 4,
        STARS:[500,1200,2100],
        COLLECT_ITEMS:[0,1,2,3],
        COLLECT_COUNT:[3,3,3,3]
        },
        {//2
        MODE:0,
        SIZE:[7,5],
        LIMIT:[1,70],
        COLOR_LIMIT:4,
        STARS:[500,1200,2300],
        GETSTARS:3
        },
        {//15
        MODE:2,
        SIZE:[7,8],
        LIMIT:[0,10],
        COLOR_LIMIT:4,
        STARS:[2000,2800,3600],
        COLLECT_ITEMS: [0],
        COLLECT_COUNT:[22]
        },
        {//113
            MODE:2,
            SIZE:[7,8],
            LIMIT:[1,40],
            COLOR_LIMIT:4,
            STARS:[4000,9700,16700],
            COLLECT_ITEMS:[0],
            COLLECT_COUNT:[25]
        },
        {//116
            MODE:0,
            SIZE:[7,8],
            LIMIT:[1,35],
            COLOR_LIMIT:4,
            STARS:[4700,10300,17000],
            GETSTARS:2
        },
        {//118
            MODE:2,
            SIZE:[7,8],
            LIMIT:[0,10],
            COLOR_LIMIT:4,
            STARS:[4700,10300,17000],
            COLLECT_ITEMS:[2],
            COLLECT_COUNT:[30]
        },
        {//119
            MODE:0,
            SIZE:[7,8],
            LIMIT:[1,30],
            COLOR_LIMIT:4,
            STARS:[4700,10300,17000],
            GETSTARS:2
        },
        {//121
            MODE:2,
            SIZE:[7,7],
            LIMIT:[1,50],
            COLOR_LIMIT:4,
            STARS:[4700,10300,17000],
            COLLECT_ITEMS:[0,1],
            COLLECT_COUNT:[8,10]
        },
        {//122
            MODE: 2,
            SIZE: [7,7],
            LIMIT:[0,50],
            COLOR_LIMIT:4,
            STARS:[4700,10300,17000],
            COLLECT_ITEMS:[0,1],
            COLLECT_COUNT:[4,5]
        }
    ]
}

