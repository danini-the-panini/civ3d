import Advance from './advances'
import { calcf } from './calc_helpers'
import City from './City'
import Game from './Game'
import BaseUnit from './units/BaseUnit'
import World, { DIRECTIONS, HEIGHT, NEIGHBOURS, Point, WIDTH } from './World'

export default class Player {
  game: Game;
  units: BaseUnit[] = []
  cities: City[] = []
  visible: boolean[][]
  currentAdvance?: Advance
  private _selectedIndex: number | null = null

  constructor(game: Game) {
    this.game = game
    this.visible = new Array(HEIGHT)
    for (let y = 0; y < HEIGHT; y++) {
      this.visible[y] = new Array(WIDTH)
      for (let x = 0; x < WIDTH; x++) {
        this.visible[y][x] = false
      }
    }
  }

  get world() : World {
    return this.game.world
  }

  set selectedIndex(value: number | null) {
    this._deselectCurrentUnit()
    if (value !== null && value >= 0 && value < this.units.length) {
      while (value < this.units.length && this.units[value].destroyed) {
        value++
      }
      if (value >= this.units.length) {
        this._selectedIndex = null
        return
      }
      this._selectedIndex = value
      this._selectCurrentUnit()
    } else {
      this._selectedIndex = null
    }
  }

  set selectedUnit(unit: BaseUnit | null) {
    this.selectedIndex = unit ? this.units.indexOf(unit) : null
  }

  get selectedUnit(): BaseUnit | null {
    if (this._selectedIndex === null) return null
    return this.units[this._selectedIndex]
  }

  selectNextUnit() {
    if (this._selectedIndex !== null) {
      this.selectedIndex = this._selectedIndex + 1
    } else {
      this.selectedIndex = 0
    }
  }

  revealMap([x, y]: Point) {
    this.revealTile([x, y])
    NEIGHBOURS.forEach(([dx, dy]) => {
      this.revealTile([x + dx, y + dy])
    })
  }

  revealTile([x, y]: Point) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return
    this.visible[y][x] = true
    let tile = this.world.get(x, y)
    let object = tile.object
    if (object && !tile.city) { object.visible = true }
    [[0, 0], ...DIRECTIONS].forEach(([dx, dy]) => {
      let x2 = x + dx
      let y2 = y + dy
      if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) return
      let t = this.world.get(x2, y2) 
      t.meshes.forEach(mesh => {
        mesh.material.uniforms.fog.value = calcf(this.world, [x2, y2], this.visible)
        mesh.material.uniformsNeedUpdate = true
      })
    })
  }

  isVisible([x, y]: Point): boolean {
    return this.visible[y][x]
  }

  startTurn() {
    this.units.filter(u => !u.destroyed).forEach(unit => unit.startTurn())
    this.cities.filter(u => !u.destroyed).forEach(city => city.startTurn())
    this.selectedIndex = 0
  }

  removeUnit() {
    this.selectedIndex = this._selectedIndex
  }

  removeCity(city: City) {
    this.cities.splice(this.cities.indexOf(city), 1)
  }

  removeDestroyedCities() {
    this.cities = this.cities.filter(c => !c.destroyed)
  }

  removeDestroyedUnits() {
    this.units = this.units.filter(u => !u.destroyed)
    this.cities.forEach(c => c.removeDestroyedUnits())
  }

  _deselectCurrentUnit() {
    if (this.selectedUnit) this.selectedUnit.selected = false
  }

  _selectCurrentUnit() {
    if (this.selectedUnit) this.selectedUnit.selected = true
    else this._selectedIndex = null
  }
}