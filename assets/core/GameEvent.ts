import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameEvent')
export class GameEvent{
    public static _eventDictionary = new Map();
    public static AddEventListener(eventName:string, callback, target = null)
    {
        let cbs = this._eventDictionary.get(eventName);
        if(cbs!=null){
            cbs.push(callback);
        }else{
            this._eventDictionary.set(eventName, [callback]);
        }
    }

    public static RemoveEventListener(eventName: string)
    {
        let cbs = this._eventDictionary.get(eventName);
        this._eventDictionary.delete(eventName);
    }

    public static DispatchEvent(eventName:string, data: any) {
        let cbs = this._eventDictionary.get(eventName);
        if(cbs!=null && cbs!=undefined){
            cbs.forEach(element => {
                element(data);
            })
        }
    }
}