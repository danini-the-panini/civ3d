import Tile from "./tile"

export type Point = [number, number]

export const WIDTH: number = 80
export const HEIGHT: number = 50
export const DIRECTIONS: Point[] = [[0, -1], [1, 0], [0, 1], [-1, 0]]
export const DIAGONALS: Point[] = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
export const NEIGHBOURS: Point[] = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]
export const BIG_FAT_CROSS: Point[] = [
            [-2, -1], [-2,  0], [-2,  1],
  [-1, -2], [-1, -1], [-1,  0], [-1,  1],  [-1,  2],
  [ 0, -2], [ 0, -1],           [ 0,  1],  [ 0,  2],
  [ 1, -2], [ 1, -1], [ 1,  0], [ 1,  1],  [ 1,  2],
            [ 2, -1], [ 2,  0], [ 2,  1],
]
export const BFC = BIG_FAT_CROSS
export const BFC_W_CENTRE = [[0, 0], ...BFC]

export default class World {
  tiles: Tile[][]

  constructor(setter: (p: Point) => Tile) {
    this.tiles = new Array(HEIGHT)
    for (let y = 0; y < HEIGHT; y++) {
      let row = new Array(WIDTH)
      for (let x = 0; x < WIDTH; x++) {
        row[x] = setter([x, y])
      }
      this.tiles[y] = row
    }
  }

  get(x: number, y: number): Tile {
    if (x < 0) x += WIDTH
    if (x >= WIDTH) x -= WIDTH
    if (y < 0) y = 0
    if (y >= HEIGHT) y = HEIGHT - 1
    return this.tiles[y][x]
  }

  eachTile(f: (t: Tile, p: Point) => void) {
    this.tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        f(tile, [x, y])
      })
    })
  }

  static eachPoint(f: (p: Point) => void) {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        f([x, y])
      }
    }
  }

  eachRelative([x, y]: Point, deltas: Point[], f: (t: Tile, p: Point) => void) {
    deltas.forEach(([dx, dy]) => {
      let x2 = x + dx
      let y2 = y + dy
      if (y2 < 0 || y2 >= HEIGHT) return
      if (x2 < 0) x2 += WIDTH
      if (x2 >= WIDTH) x2 -= WIDTH
      f(this.get(x2, y2), [x2, y2])
    })
  }

  static deltaX(x1: number, x2: number): number {
    let d = x2 - x1
    let d2 = (x2 - WIDTH) - x1
    let d3 = x2 - (x1 - HEIGHT)
    if (Math.abs(d2) < Math.abs(d)) d = d2
    if (Math.abs(d3) < Math.abs(d)) d = d3
    return d
  }

  static deltaY(y1: number, y2: number): number {
    return y2 - y1
  }

  static delta(p1: Point, p2: Point): Point {
    return [World.deltaX(p1[0], p2[0]), World.deltaY(p1[1], p2[1])]
  }
}