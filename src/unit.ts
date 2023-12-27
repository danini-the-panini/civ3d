import { Object3D } from 'three'
import Player from "./player"
import World, { Point } from "./world"
import { position3d } from "./helpers"
import { Easing, Tween } from 'three/examples/jsm/libs/tween.module.js'
import * as TweenHelper from './tween'

export enum UnitType {
  Settlers,
  Militia,
  Phalanx,
  Legion,
  Musketeers,
  Riflemen,
  Cavalry,
  Knights,
  Catapult,
  Cannon,
  Chariot,
  Armor,
  MechInf,
  Artillery,
  Diplomat,
  Caravan,
  Trireme,
  Sail,
  Frigate,
  Ironclad,
  Cruiser,
  Battleship,
  Submarine,
  Carrier,
  Transport,
  Fighter,
  Bomber,
  Nuclear
}

export default class Unit {
  world: World
  type: UnitType
  player: Player | undefined
  position: Point
  object: Object3D = new Object3D()
  private _flashInterval: number | undefined

  constructor(type: UnitType, position: Point, world: World) {
    this.type = type
    this.position = position
    this.world = world
  }

  set selected(value: boolean) {
    if (value) {
      this.player?.units.filter(unit => unit !== this).forEach(unit => unit.selected = false)
      this._flashInterval = setInterval(() => {
        if (this.object) {
          this.object.visible = !this.object.visible
          this.world.get(...this.position).unitVisible = this.object.visible
        }
      }, 125)
    } else {
      clearInterval(this._flashInterval)
      if (this.object) this.object.visible = true
      this.world.get(...this.position).unitVisible = true
    }
  }

  moveTo([x, y]: Point) {
    this.selected = false
    this.world.get(...this.position).unitVisible = false
    this.position = [x, y]

    let v = position3d(...this.position)
    let coords = { x: this.object.position.x, y: this.object.position.z }
    TweenHelper.addTween(
      new Tween(coords, false)
        .to({ x: v[0], y: v[2] }, 250)
        .easing(Easing.Linear.None)
        .onUpdate(() => {
          this.object.position.x = coords.x
          this.object.position.z = coords.y
        })
        .onComplete(() => {
          console.log('complete...')
          this.selected = true
          this.player?.revealMap(this.position)
        })
        .start()
    )
  }
}