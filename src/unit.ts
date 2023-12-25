import { Object3D } from "three"
import Player from "./player"
import World, { Point } from "./world"
import { position3d } from "./helpers"

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
    this.position = [x, y]
    this.object.position.set(...position3d(x, y))
  }
}