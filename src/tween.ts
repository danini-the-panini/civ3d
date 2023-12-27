import { Tween } from "three/examples/jsm/libs/tween.module.js";

let tweens: Tween<any>[] = []

export function addTween(tween: Tween<any>)  {
  tweens.push(tween)
}

export function removeTween(tween: Tween<any>) {
  tweens.splice(tweens.indexOf(tween), 1)
}

export function update(time: number) {
  tweens.forEach(tween => tween.update(time))
}