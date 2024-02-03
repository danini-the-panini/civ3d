import Tile from "./Tile"

let lastId = 1

export default class Continent {
  id: number
  tiles: Tile[]
  size: number = 0

  constructor(tiles = []) {
    this.id = ++lastId
    this.tiles = tiles
  }

  addTile(tile: Tile) {
    if (tile.continent == this) return
    if (tile.continent && tile.continent !== this) {
      this.merge(tile.continent)
      return
    }
    tile.continent = this
    this.tiles.push(tile)
    this.size++
  }

  merge(other: Continent) {
    if (other === this) return

    other.tiles.forEach(tile => {
      this.tiles.push(tile)
      tile.continent = this
    })
    other.tiles = []
    this.size += other.size
    other.size = 0
  }
}