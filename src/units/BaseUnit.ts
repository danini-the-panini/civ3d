import { Mesh, MeshPhongMaterial, Object3D } from 'three'
import Player from '../Player'
import World, { Point } from '../World'
import { position3d } from '../helpers'
import ResourceManager from '../ResourceManager'
import Game from '../Game'
import { Easing, Tween } from 'three/examples/jsm/libs/tween.module.js'
import * as TweenHelper from '../tween'
import City from '../City'
import Advance from '../advances'

export enum Unit {
  Settlers='settlers',
  Militia='militia',
  Phalanx='phalanx',
  Legion='legion',
  Musketeers='musketeers',
  Riflemen='riflemen',
  Cavalry='cavalry',
  Knights='knights',
  Catapult='catapult',
  Cannon='cannon',
  Chariot='chariot',
  Armor='armor',
  MechInf='mech inf.',
  Artillery='artillery',
  Diplomat='diplomat',
  Caravan='caravan',
  Trireme='trireme',
  Sail='sail',
  Frigate='frigate',
  Ironclad='ironclad',
  Cruiser='cruiser',
  Battleship='battleship',
  Submarine='submarine',
  Carrier='carrier',
  Transport='transport',
  Fighter='fighter',
  Bomber='bomber',
  Nuclear='nuclear'
}

export enum MovementType {
  Land,
  Sea,
  Air
}

export type UnitClass = {
  type: Unit
  production: number
  price: number
  movementType: MovementType
  attack: number
  defense: number
  movement: number
  los: number
  capacity: number
  requires?: Advance
  new(...args: any[]): BaseUnit
  createObject(...args: any[]): Object3D
}

export default abstract class BaseUnit {
  static type: Unit
  static production: number
  static price: number
  static movementType: MovementType
  static attack: number
  static defense: number
  static movement: number
  static los: number
  static capacity: number
  static requires?: Advance

  player: Player
  position: Point
  object: Object3D = new Object3D()
  movementLeft: number = 0
  movementPart: number = 3
  destroyed = false
  veteran = false
  private _flashInterval?: number
  private _home: City | null = null

  constructor(position: Point, player: Player) {
    this.position = [...position]
    this.player = player

    this.spawn()
  }

  get class(): UnitClass {
    return this.constructor as UnitClass
  }

  get type() {
    return this.class.type
  }

  get home(): City | null {
    return this._home
  }

  set home(value: City | null) {
    if (this._home === value) return
    this._home?.removeUnit(this)
    this._home = value
    this._home?.units.push(this)
  }

  static createObject(object = new Object3D) : Object3D {
    object.add(new Mesh(ResourceManager.units[this.type].geom, ResourceManager.units[this.type].mat))
    let slabMesh = new Mesh(ResourceManager.slab.geom, new MeshPhongMaterial({ color: 'magenta' }))
    object.add(slabMesh)
    return object
  }

  spawn() {
    this.movementLeft = this.class.movement
    this.object.position.set(...position3d(...this.position))
    this.class.createObject(this.object)
    this.player.units.push(this)
    this.player.revealMap(this.position)
  }

  startTurn() {
    this.movementLeft = this.class.movement
    this.movementPart = 3
  }

  get world(): World {
    return this.player.world
  }

  get game(): Game {
    return this.player.game
  }

  set selected(value: boolean) {
    if (value) {
      this.game.eachUnitAt(this.position, unit => {
        if (unit !== this) unit.object.visible = false
      })
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

  sameTile(unit: BaseUnit): boolean {
    return this.position[0] === unit.position[0] && this.position[1] === unit.position[1]
  }

  moveTo([x, y]: Point, cb: (m: number) => void) {
    if (x == this.position[0] && y === this.position[1]) return
    if (Math.abs(x - this.position[0]) > 1 || Math.abs(y - this.position[1]) > 1) {
      // TODO: GoTo
      return
    }
    let tile = this.world.get(x, y)

    // TODO: allow moving into cities
    let isOcean = tile.isOcean
    if (MovementType.Land && isOcean) return
    if (MovementType.Sea && isOcean) return

    if (this.movementLeft <= 0) return

    this.selected = false
    this.world.get(...this.position).unitVisible = false
    let unit = this.game.unitAt(this.position, this)
    if (unit) unit.object.visible = true
    this.position = [x, y]

    let v = position3d(...this.position)
    let coords = { x: this.object.position.x, y: this.object.position.z }
    let tween = new Tween(coords, false)
        .to({ x: v[0], y: v[2] }, 250)
        .easing(Easing.Linear.None)
        .onUpdate(() => {
          this.object.position.x = coords.x
          this.object.position.z = coords.y
        })
        .onComplete(() => {
          this.selected = true
          this.player?.revealMap(this.position)

          // TODO: roads and railroads

          let moveCosts = tile.biome.movementCost
          if (this.movementLeft < moveCosts) this.movementLeft = 0
          else this.movementLeft -= moveCosts

          cb(this.movementLeft)

          TweenHelper.removeTween(tween)
        })
        .start()
    TweenHelper.addTween(tween)
  }

  destroy() {
    this.game.scene.remove(this.object)
    this.destroyed = true
    this.player.removeUnit()
  }
}