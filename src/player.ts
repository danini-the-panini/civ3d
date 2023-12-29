import { calcf } from "./calc_helpers";
import Game from "./game";
import Unit from "./unit";
import World, { DIRECTIONS, HEIGHT, NEIGHBOURS, Point, WIDTH } from "./world";

export default class Player {
  game: Game;
  units: Unit[] = []
  visible: boolean[][]
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
      this._selectedIndex = value
      this._selectCurrentUnit()
    } else {
      this._selectedIndex = null
    }
  }

  set selectedUnit(unit: Unit | null) {
    this.selectedIndex = unit ? this.units.indexOf(unit) : null
  }

  get selectedUnit(): Unit | null {
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
    if (object) { object.visible = true }
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

  startTurn() {
    this.units.forEach(unit => unit.startTurn())
    this.selectedIndex = 0
  }

  _deselectCurrentUnit() {
    if (this.selectedUnit) this.selectedUnit.selected = false
  }

  _selectCurrentUnit() {
    if (this.selectedUnit) this.selectedUnit.selected = true
    else this._selectedIndex = null
  }
}