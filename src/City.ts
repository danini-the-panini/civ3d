import { Mesh, MeshPhongMaterial, Object3D } from 'three'
import Player from './Player'
import { BFC, HEIGHT, Point, WIDTH } from './World'
import ResourceManager from './ResourceManager'
import { TextGeometry } from 'three/examples/jsm/Addons.js'
import { degToRad } from 'three/src/math/MathUtils.js'
import { position3d } from './helpers'
import BaseBuilding, { Building, BuildingClass } from './buildings/BaseBuilding'
import BaseUnit, { UnitClass } from './units/BaseUnit'
import BaseWonder, { WonderClass } from './wonders/BaseWonder'
import Tile from './Tile'
import Settlers from './units/Settlers'
import Militia from './units/Militia'

type Production = BuildingClass | WonderClass | UnitClass

export default class City {
  player: Player
  position: Point
  name: string
  food: number = 0
  shields: number = 0
  currentProduction: Production = Militia
  buildings: BaseBuilding[] = []
  wonders: BaseWonder[] = []
  units: BaseUnit[] = []
  cityTiles: Tile[] = []
  object: Object3D = new Object3D()
  destroyed = false
  private _resourceTiles: Tile[] = []
  private _size: number = 1
  private _sizeMesh!: Mesh

  constructor(player: Player, position: Point, name: string) {
    this.player = player
    this.position = position
    this.name = name
    BFC.forEach(([dx, dy]) => {
      let x = this.position[0] + dx
      let y = this.position[1] + dy
      if (y < 0 || y >= HEIGHT) return
      if (x < 0) x += WIDTH
      if (x >= WIDTH) x -= WIDTH

      this.cityTiles.push(this.world.get(x, y))
    })
    this.setResourceTiles()
  }

  static createSizeNumber(size: number): Mesh {
    let text = new Mesh(
      new TextGeometry(size.toString(), { font: ResourceManager.font, size: 1, height: 0.1 }),
      new MeshPhongMaterial({ color: 'black' })
    )
    text.rotateX(degToRad(-90))
    text.geometry.computeBoundingBox()
    text.position.x += 0.5 - text.geometry.boundingBox!.max.x / 2
    text.position.y += 0.1
    text.position.z -= 0.5 - text.geometry.boundingBox!.max.y / 2
    return text
  }

  static createObject(object = new Object3D()): Object3D {
    object.add(new Mesh(ResourceManager.citySlab.geom, new MeshPhongMaterial({ color: 'magenta' })))
    object.add(new Mesh(ResourceManager.cityGrid.geom, new MeshPhongMaterial({ color: '#822014' })))

    return object
  }

  static spawn(player: Player, position: Point, name: string) {
    let city = new City(player, [...position], name)
    
    City.createObject(city.object)
    city.updateSizeMesh()
    city.object.position.set(...position3d(...city.position))
    player.game.scene.add(city.object)
    
    player.world.get(...city.position).city = city
    player.cities.push(city)

    return city
  }

  get game() {
    return this.player.game
  }

  get world() {
    return this.game.world
  }

  get size() {
    return this._size
  }

  set size(value: number) {
    this._size = value
    this.updateSizeMesh()
    this.setResourceTiles()
    if (value === 0) {
      this.destroy()
      return
    }
  }

  get resourceTiles() {
    return [...this._resourceTiles, this.world.get(...this.position)]
  }

  get foodCosts(): number {
    let costs = this.size * 2
    // TODO: sum settler count, depending on government
    return costs
  }

  get foodTotal() {
    // TODO: modify food amount based on governement / railroad
    return this.resourceTiles.reduce((a, t) => a + t.food, 0)
  }

  get foodIncome(): number {
    return this.foodTotal - this.foodCosts
  }

  get foodRequired(): number {
    return (this._size + 1) * 10
  }

  get shieldCosts(): number {
    // TODO: sum units based on government
    return 0
  }

  get shieldTotal(): number {
    // TODO: modify shields amount based on government / railroad
    let shields = this.resourceTiles.reduce((a, t) => a + t.shields, 0)
    if (this.hasBuilding(Building.Factory)) {
      shields += Math.floor(shields * (this.hasBuilding(Building.NuclearPlant) ? 1.0 : 1.5))
    }
    if (this.hasBuilding(Building.MfgPlant)) {
      shields *= 2
    }
    return shields
  }

  get shieldIncome(): number {
    return this.shieldTotal - this.shieldCosts
  }

  get corruption(): number {
    // TODO: compute based on government, buildings, distance to capital, etc.
    return 0
  }

  get tradeTotal(): number {
    // TODO: modify trade value based on governement / railroad / wonders
    return this.resourceTiles.reduce((a, t) => a + t.trade, 0)
  }

  get tradeIncome(): number {
    return this.tradeTotal - this.corruption
  }

  get population(): number {
    let pop = 0;
    for (let i = 0; i < this.size; i++) {
      pop += 10000 * i
    }
    return pop
  }

  startTurn() {
    // TODO: disorder
    
    // TODO: ZERO if in disorder
    this.food += this.foodIncome

    if (this.food < 0) {
      this.food = 0
      this.size--
    } else if (this.food > this.foodRequired) {
      this.food -= this.foodRequired

      if (this.size === 10 && !this.hasBuilding(Building.Aqueduct)) {
        // TODO: needs aqueduct to grow futher!
      } else {
        this.size++
      }

      if (this.hasBuilding(Building.Granary) && this.food < (this.foodRequired / 2)) {
        this.food = this.foodRequired / 2
      }
    }

    if (this.shieldIncome < 0) {
      // TODO: disband unit
    } else if (this.shieldIncome > 0) {
      // TODO: ZERO if in disorder
      this.shields += this.shieldIncome
    }
    console.log(`SHIELDS: ${this.shields}`)

    if (this.currentProduction && this.shields >= this.currentProduction.production) {
      if (this.currentProduction === Settlers && this.size === 1 && false /* TODO: this.game.difficulty === Difficulty.Chieftan */) {
        // On Chieftain level, it's not possible to create a Settlers in a city of size 1
      } else if (this.currentProduction.prototype instanceof BaseUnit) {
        this.shields = 0
        let unit = new this.currentProduction(this.position, this.player) as BaseUnit
        unit.veteran = this.hasBuilding(Building.Barracks)
        unit.home = this
        if (this.currentProduction === Settlers) {
          if (this.size === 1 && this.player.cities.filter(c => !c.destroyed).length === 1) this.size++
          if (this.size === 1) unit.home = null
          this.size--
        }
        // TODO: message if unit is settlers / diplomat / caravan
      } else if (this.currentProduction.prototype instanceof BaseBuilding && !this.hasBuilding(this.currentProduction.type as Building)) {
        this.shields = 0
        // TODO: space ship
        if (false /* space ship */) {

        } else if (this.currentProduction.type === Building.Palace) {
          this.player.cities.forEach(city => {
            city.removeBuilding(Building.Palace)
          })
          if (this.hasBuilding(Building.Courthouse)) {
            this.buildings = this.buildings.filter(c => c.type === Building.Courthouse)
          }
          this.buildings.push(new this.currentProduction(this) as BaseBuilding)
          // TODO: capital has moved!
        } else {
          this.buildings.push(new this.currentProduction(this) as BaseBuilding)
          // TODO notify player that building is built
        }
      } else if (this.currentProduction.prototype instanceof BaseWonder) {
        this.shields = 0
        this.wonders.push(new this.currentProduction(this) as BaseWonder)
        // TODO: notify player that wonder is built
      }
    }

    // this.gold += this.taxes
    // this.gold -= this.totalMaintenance
    // this.player.science += this.science
  }

  isResourceTile(tile: Tile): boolean {
    return this.resourceTiles.includes(tile)
  }

  setResourceTiles() {
    while (this._resourceTiles.length > this.size) {
      this._resourceTiles.pop()
    }
    if (this._resourceTiles.length === this.size) return
    if (this._resourceTiles.length < this.size) {
      let tiles = this.cityTiles
        .filter(tile => !this.occupiedTile(tile) && !this.isResourceTile(tile))
        .sort((a, b) => b.food - a.food || b.shields - a.shields || b.trade - a.shields)
      if (tiles.length > 0) {
        this._resourceTiles.push(tiles[0])
      }
    }

    this.updateSpecialists()
  }

  resetResourceTiles() {
    this._resourceTiles = []
    for (let i = 0; i < this.size; i++) {
      this.setResourceTiles()
    }
  }

  removeResourceTile(tile: Tile) {
    this._resourceTiles.splice(this._resourceTiles.indexOf(tile), 1)
    this.updateSpecialists()
  }

  setResourceTile(tile: Tile) {
    if (this._resourceTiles.length < this.size && !this.isResourceTile(tile) && !this.invalidTile(tile)) {
      this._resourceTiles.push(tile)
      this.updateSpecialists()
      return true
    }
    return false
  }

  occupiedTile(tile: Tile): boolean {
    if (this._resourceTiles.includes(tile)) return false
    return this.invalidTile(tile)
  }

  invalidTile(tile: Tile): boolean {
    let invalid = false
    if (!this.player.isVisible(tile.position)) return true
    this.game.eachCity(city => {
      if (city === this) return
      if (city.isResourceTile(tile)) invalid = true
    })
    if (invalid) return true
    tile.eachUnit(unit => {
      if (unit.player !== this.player) invalid = true
    })
    return invalid
  }

  updateSpecialists() {
    // TODO: add entertainers
  }

  hasBuilding(building: Building) {
    return this.buildings.some(b => b.type === building)
  }

  removeBuilding(building: Building) {
    this.buildings = this.buildings.filter(c => c.type === building)
  }

  removeUnit(unit: BaseUnit) {
    this.units.splice(this.units.indexOf(unit), 1)
  }

  removeDestroyedUnits() {
    this.units = this.units.filter(u => !u.destroyed)
  }

  updateSizeMesh() {
    if (this._sizeMesh) {
      this.object.remove(this._sizeMesh)
    }
    this._sizeMesh = City.createSizeNumber(this.size)
    this.object.add(this._sizeMesh)
  }

  destroy() {
    this.game.scene.remove(this.object)
    this.units.forEach(unit => unit.destroy())
    this.destroyed = true
  }
}