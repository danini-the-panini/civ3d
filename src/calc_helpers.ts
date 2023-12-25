import { BiomeType } from "./biome"
import { Road } from "./tile"
import World, { HEIGHT, Point, WIDTH } from "./world"

const DIRS: Point[] = [[0,1],[-1,0],[0,-1],[1,0]]

const DIRS9: Point[] = [
  [ 1, -1], [0, -1], [-1, -1],
  [ 1,  0], [0,  0], [-1,  0],
  [ 1,  1], [0,  1], [-1,  1]
]

const ODIRS: Point[][] = [
  [[ 1,  0], [ 1,  1], [ 0,  1]],
  [[ 0,  1], [-1,  1], [-1,  0]],
  [[ 0, -1], [ 1, -1], [ 1,  0]],
  [[-1,  0], [-1, -1], [ 0, -1]]
]

const RDIRS: Point[][] = [
  [[ 1,  0], [ 0,  1]],
  [[ 0,  1], [-1,  0]],
  [[ 0, -1], [ 1,  0]],
  [[-1,  0], [ 0, -1]]
]

export function calcn(world: World, [x, y]: Point, dirs=DIRS, cmp=([x2,y2]:Point)=>world.get(x, y).biome.type === world.get(x2, y2).biome.type) {
  let c = 0
  dirs.forEach(([dx,dy], n) => {
    let x2 = x+dx
    let y2 = y+dy
    if (y2 >= 0 && y2 < HEIGHT && x2 >= 0 && x2 < WIDTH && cmp([x2, y2])) {
      c += 2**n
    }
  })
  return c
}

export function calcr(world: World, p: Point): number {
  return calcn(world, p, DIRS, ([x2,y2])=>world.get(x2,y2).biome.type===BiomeType.Rivers||world.get(x2,y2).biome.type===BiomeType.Ocean)
}

export function calcon(world: World, p: Point, oi: number): number {
  return calcn(world, p, ODIRS[oi], ([x2,y2])=>world.get(x2, y2).biome.type!==BiomeType.Ocean)+(calcn(world, p, RDIRS[oi], ([x2,y2])=>world.get(x2,y2).biome.type===BiomeType.Rivers)<<3)
}

export function calcroad(world: World, p: Point, N=Road.Road): number {
  if (world.get(...p).road < N) return 0
  return calcn(world, p, DIRS9, ([x2,y2])=>world.get(x2,y2).road>=N)
}

export function calcrailroad(world: World, p: Point): number {
  return calcroad(world, p, Road.Railroad)
}

export function calcf(world: World, p: Point, visiblity: boolean[][]): number {
  return calcn(world, p, DIRS, ([x2,y2])=>visiblity[y2][x2])
}