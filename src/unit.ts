import { Mesh, MeshPhongMaterial, Object3D } from 'three'
import Player from "./player"
import World, { Point } from "./world"
import { position3d } from "./helpers"
import { Easing, Tween } from 'three/examples/jsm/libs/tween.module.js'
import * as TweenHelper from './tween'
import { Thing } from './gltf_helpers'
import Game from './game'

export enum UnitType {
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

export function cost(type: UnitType): [number, number] {
  switch (type) {
    //                               PROD  PRICE
    case UnitType.Militia:    return [ 10,   50]
    case UnitType.Phalanx:
    case UnitType.Legion:
    case UnitType.Cavalry:    return [ 20,  120]
    case UnitType.Musketeers:
    case UnitType.Riflemen:
    case UnitType.Diplomat:   return [ 30,  210]
    case UnitType.Settlers:
    case UnitType.Knights:
    case UnitType.Catapult:
    case UnitType.Cannon:
    case UnitType.Chariot:
    case UnitType.Trireme:
    case UnitType.Sail:
    case UnitType.Frigate:    return [ 40,  320]
    case UnitType.MechInf:
    case UnitType.Caravan:
    case UnitType.Submarine:
    case UnitType.Transport:  return [ 50,  450]
    case UnitType.Artillery:
    case UnitType.Ironclad:
    case UnitType.Fighter:    return [ 60,  600]
    case UnitType.Armor:
    case UnitType.Cruiser:    return [ 80,  960]
    case UnitType.Bomber:     return [120, 1920]
    case UnitType.Battleship:
    case UnitType.Carrier:
    case UnitType.Nuclear:    return [160, 3200]
  }
}

export enum MovementType {
  Land,
  Sea,
  Air
}

export default class Unit {
  type: UnitType
  player: Player
  position: Point
  object: Object3D = new Object3D()
  movement: number = 0
  movementPart: number = 3
  private _flashInterval: number | undefined

  constructor(type: UnitType, position: Point, player: Player) {
    this.type = type
    this.position = position
    this.player = player
    this.movement = this.stats[2]
  }

  static spawn(type: UnitType, position: Point, player: Player, units: Record<string, Thing>, slab: Thing) {
    let unit = new Unit(type, position, player)
    unit.player = player
    unit.object.position.set(...position3d(...position))
    unit.object.add(new Mesh(units[type].geom, units[type].mat))
    let slabMesh = new Mesh(slab.geom, new MeshPhongMaterial({ color: 'magenta' }))
    unit.object.add(slabMesh)
    player.units.push(unit)
    player.revealMap(position)
    return unit
  }

  startTurn() {
    this.movement = this.stats[2]
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

  sameTile(unit: Unit): boolean {
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

    if (this.movement <= 0) return

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
          if (this.movement < moveCosts) this.movement = 0
          else this.movement -= moveCosts

          cb(this.movement)

          TweenHelper.removeTween(tween)
        })
        .start()
    TweenHelper.addTween(tween)
  }

  remove() {
    this.game.scene.remove(this.object)
    this.player.removeUnit(this)
  }

  get stats(): [number, number, number] {
    switch (this.type) {
      //                                 A   D   M
      case UnitType.Settlers:   return [ 0,  1,  1]
      case UnitType.Militia:    return [ 1,  1,  1]
      case UnitType.Phalanx:    return [ 1,  2,  1]
      case UnitType.Legion:     return [ 3,  1,  1]
      case UnitType.Musketeers: return [ 2,  3,  1]
      case UnitType.Riflemen:   return [ 3,  5,  1]
      case UnitType.Cavalry:    return [ 2,  1,  2]
      case UnitType.Knights:    return [ 4,  2,  2]
      case UnitType.Catapult:   return [ 6,  1,  1]
      case UnitType.Cannon:     return [ 8,  1,  1]
      case UnitType.Chariot:    return [ 4,  1,  2]
      case UnitType.Armor:      return [10,  5,  3]
      case UnitType.MechInf:    return [ 6,  6,  3]
      case UnitType.Artillery:  return [12,  2,  2]
      case UnitType.Diplomat:   return [ 0,  0,  2]
      case UnitType.Caravan:    return [ 0,  1,  1]
      case UnitType.Trireme:    return [ 1,  0,  3]
      case UnitType.Sail:       return [ 1,  1,  3]
      case UnitType.Frigate:    return [ 2,  2,  3]
      case UnitType.Ironclad:   return [ 4,  4,  4]
      case UnitType.Cruiser:    return [ 6,  6,  6]
      case UnitType.Battleship: return [18, 12,  4]
      case UnitType.Submarine:  return [ 8,  2,  3]
      case UnitType.Carrier:    return [ 1, 12,  5]
      case UnitType.Transport:  return [ 0,  3,  4]
      case UnitType.Fighter:    return [ 4,  2, 10]
      case UnitType.Bomber:     return [12,  1,  8]
      case UnitType.Nuclear:    return [99,  0, 16]
    }
  }

  get movementType(): MovementType {
    switch (this.type) {
      case UnitType.Trireme:
      case UnitType.Sail:
      case UnitType.Frigate:
      case UnitType.Ironclad:
      case UnitType.Cruiser:
      case UnitType.Battleship:
      case UnitType.Submarine:
      case UnitType.Carrier:
      case UnitType.Transport:  return MovementType.Sea

      case UnitType.Fighter:
      case UnitType.Bomber:
      case UnitType.Nuclear:    return MovementType.Air

      default: return MovementType.Land
    }
  }

  get los(): number {
    switch(this.type) {
      case UnitType.Cruiser:
      case UnitType.Battleship:
      case UnitType.Submarine:
      case UnitType.Carrier:
      case UnitType.Bomber:
      case UnitType.Fighter: return 2
      default: return 1
    }
  }

  get capacity(): number {
    switch(this.type) {
      case UnitType.Trireme:    return 2
      case UnitType.Sail:       return 3
      case UnitType.Frigate:    return 4
      case UnitType.Carrier:    return 8
      case UnitType.Transport:  return 8
      default: return 0
    }
  }
}