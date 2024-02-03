import Biome, { BiomeType } from "./Biome"
import Game from "./Game"
import { irand } from "./helpers"
import Tile from "./Tile"
import World, { BFC_W_CENTRE, DIAGONALS, HEIGHT, NEIGHBOURS, Point, WIDTH } from "./World"

type Layer<T> = T[][]
type Landmass = Layer<number>
type Biomes = Layer<BiomeType>

const BRUSH: Point[] = [[0, 0], [0, 1], [1, 0]]

function add([x1, y1]: Point, [x2, y2]: Point): Point {
  return [x1+x2, y1+y2]
}

function get<T>(layer: Layer<T>, [x, y]: Point): T {
  if (x < 0) x += WIDTH
  if (x >= WIDTH) x -= WIDTH
  if (y < 0) y = 0
  if (y >= HEIGHT) y = HEIGHT - 1
  return layer[y][x]
}

function set<T>(layer: Layer<T>, [x, y]: Point, value: T) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return
  layer[y][x] = value
}

function eachPoint(f: (p: Point) => void) {
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      f([x, y])
    }
  }
}

function eachTile<T>(layer: Layer<T>, f: (t: T, p: Point) => void) {
  eachPoint(p => f(get(layer, p), p))
}

function createLayer<T>(fill: T): Layer<T> {
  let layer: Layer<T> = []
  for (let y = 0; y < HEIGHT; y++) {
    let row: T[] = []
    for (let x = 0; x < WIDTH; x++) {
      row[x] = fill
    }
    layer[y] = row
  }
  return layer
}

function copyLayer<T>(from: Layer<T>, to: Layer<T>) {
  eachTile(from, (v, p) => set(to, p, v))
}

function eachRelative<T, R>(layer: Layer<T>, [x, y]: Point, deltas: Point[], f: (t: T, p: Point) => R): R[] {
  return deltas
    .map(([dx, dy]): Point => [x + dx, y + dy])
    .map(([x2, y2]): Point => [x2 < 0 ? x2 + WIDTH : (x2 >= WIDTH ? x2 - WIDTH : x2), y2])
    .filter(([, y2]) => y2 >= 0 && y2 < HEIGHT)
    .map(p => f(get(layer, p), p))
}

export default class WorldGenerator {
  totalLandMass: number = 0
  customLandSize: number
  customTemperature: number
  customClimate: number
  customAge: number

  chunkLength: number = 64
  tmw: number

  constructor(land: number, temp: number, climate: number, age: number) {
    this.customLandSize = land
    this.customTemperature = temp
    this.customClimate = climate
    this.customAge = age
    this.tmw = irand(0xFFFFF)
  }

  generate(game: Game): World {
    let land = this.generateLandMass()
    let biomes = this.temperatureAdjustments(land)
    this.climateAdjustments(biomes)
    this.erosionAdjustments(biomes)
    this.generateRivers(biomes)
    this.generatePoles(biomes)

    let world = new World(game, p => new Tile(
      game,
      get(biomes, p),
      p,
      this.hasResource(p, get(biomes, p)),
      this.hasHut(p, get(biomes, p)),
      this.calcLandValue(biomes, p)
    ))
    game.world = world
    return world
  }

  generateLandMass(): Landmass {
    let land: Landmass = createLayer(0)

    this.totalLandMass = 0
    // CUSTOM LAND SIZE / LAND MASS
    let minSize = this.customLandSize * 8 * 40 + 640
    while (true) {
      this.spawnContinent(land)
      if (this.totalLandMass >= minSize) break
    }

    let x = 1
    while (x < WIDTH - 1) {
      let y = 1
      while (y < HEIGHT - 1) {
        let squareFlag = 0

        let col = get(land, [x, y])
        if (col != 0) squareFlag |= 0x1

        col = get(land, [x + 1, y])
        if (col != 0) squareFlag |= 0x2

        col = get(land, [x, y + 1])
        if (col != 0) squareFlag |= 0x4

        col = get(land, [x + 1, y + 1])
        if (col != 0) squareFlag |= 0x8

        if (squareFlag === 0x6 || squareFlag === 0x9) {
          set(land, [x, y], 1)
          set(land, [x, y + 1], 1)
          set(land, [x + 1, y + 1], 1)
          if (x != 0) x -= 1
          if (y != 0) y -= 1
        }

        y += 1
      }
      x += 1
    }

    return land
  }

  spawnContinent(land: Landmass) {
    let varP: Point = [irand(72) + 4, irand(34) + 8]

    let stencil = this.createContinentSkeleton(varP)

    eachTile(stencil, (col, p) => {
      if (col != 0) {
        set(land, p, get(land, p) + 1)
        this.totalLandMass += 1
      }
    })
  }

  createContinentSkeleton([x, y]: Point): Landmass {
    let stencil: Landmass = createLayer(0)

    let loopCount = irand(this.chunkLength) + 1

    while (true) {
      BRUSH.forEach(([dx, dy]) => {
        set(stencil, [x + dx, y + dy], 15)
      })
      switch (irand(4)) {
        case 0: y -= 1; break
        case 1: x += 1; break
        case 2: y += 1; break
        case 3: x -= 1; break
      }

      loopCount -= 1
      if (loopCount <= 0 || x <= 2 || x >= WIDTH - 3 || y <= 2 || y >= HEIGHT - 4) break
    }

    return stencil
  }

  temperatureAdjustments(land: Landmass): Biomes {
    let biomes: Biomes = createLayer(BiomeType.Ocean)

    // CUSTOM_TEMPERATURE
    eachTile(land, (col, p) => {
      let biome: BiomeType
      switch (col) {
        case 0: biome = BiomeType.Ocean; break
        case 1: {
          let v = Math.abs(irand(8) + p[1] - 29)
          v += 1 - this.customTemperature
          v = Math.floor(v / 6.0 + 1.0)

          switch (v*2) {
            case 0: case  2: biome = BiomeType.Desert; break
            case 4: case  6: biome = BiomeType.Plains; break
            case 8: case 10: biome = BiomeType.Tundra; break
            default:         biome = BiomeType.Arctic; break
          }
          break
        }
        case 2: biome = BiomeType.Mountains; break
        default: biome = BiomeType.Hills; break
      }
      set(biomes, p, biome)
    })

    return biomes
  }

  climateAdjustments(biomes: Biomes) {
    // CUSTOM CLIMATE
    for (let y = 0; y < HEIGHT; y++) {
      let lat = Math.abs((HEIGHT /2) - y)

      // initialized ot 0 for each ROW
      // var_8 seems to be a kind of "wetness"
      // counter for each row, based
      // on the number of ocean squares + customClimate
      let rowWetness = 0

      for (let x = 0; x < WIDTH; x++) {
        let landType = get(biomes, [x, y])
        if (landType === BiomeType.Ocean) {
          // |12-lat| is the distance to "half-equator" (y=12)
          // supposedly the "most humid" area of the map
          //
          // this distance is impounded by 4*customClimate:
          //  - wetter climate make a bigger "distance";
          //  - drier climate make smaller "distance";
          let squareWetness = Math.abs(12 - lat) + this.customClimate * 4
          if (squareWetness > rowWetness) rowWetness += 1
        } else {
          if (rowWetness <= 0) continue
          rowWetness -= irand(7 - (this.customClimate * 2))
          let biome: BiomeType
          switch (landType) {
            case BiomeType.Plains: biome = BiomeType.Grassland; break
            case BiomeType.Tundra: biome = BiomeType.Arctic; break
            case BiomeType.Hills: biome = BiomeType.Forest; break
            case BiomeType.Mountains: {
              rowWetness -= 3
              biome = BiomeType.Mountains
              break
            }
            case BiomeType.Desert: biome = BiomeType.Plains; break
            default: biome = landType
          }
          set(biomes, [x, y], biome)
        }
      }

      rowWetness = 0
      for (let x = WIDTH-1; x > 0; x--) {
        let landType = get(biomes, [x, y])
        if (landType === BiomeType.Ocean) {
          // push humidity towards the poles
          if ((lat + this.customClimate * 2) > rowWetness * 2) rowWetness += 1
        } else if (rowWetness > 0) {
          rowWetness -= irand(7 - this.customClimate * 2)
          let biome: BiomeType
          switch (landType) {
            case BiomeType.Swamp: case BiomeType.Hills: biome = BiomeType.Forest; break
            case BiomeType.Plains: biome = BiomeType.Grassland; break
            case BiomeType.Grassland: {
              rowWetness -= 2
              biome = lat < 10 ? BiomeType.Jungle : BiomeType.Swamp
              break
            }
            case BiomeType.Mountains: {
              rowWetness -= 3
              biome = BiomeType.Forest
              break
            }
            case BiomeType.Desert: biome = BiomeType.Plains; break
            default: biome = landType; break
          }
          set(biomes, [x, y], biome)
        }
      }
    }
  }

  erosionAdjustments(biomes: Biomes) {
    // CUSTOM EARTH AGE
    let targetAge = 800 * this.customAge + 800

    let x = 0
    let y = 0

    for (let erosionCounter = 0; erosionCounter < targetAge; erosionCounter++) {
      if (erosionCounter % 2 === 0) {
        x = irand(WIDTH)
        y = irand(HEIGHT)
      } else {
        let si = irand(8)
        let [dx, dy] = NEIGHBOURS[si]
        x += dx
        y += dy
      }
      if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        let landType = get(biomes, [x, y])
        let biome: BiomeType
        switch(landType) {
          case BiomeType.Forest: biome = BiomeType.Jungle; break
          case BiomeType.Swamp: biome = BiomeType.Grassland; break
          case BiomeType.Plains: case BiomeType.Tundra: biome = BiomeType.Hills; break
          case BiomeType.Grassland: case BiomeType.Rivers: biome = BiomeType.Forest; break
          case BiomeType.Jungle: biome = BiomeType.Swamp; break
          case BiomeType.Hills: case BiomeType.Arctic: biome = BiomeType.Mountains; break
          case BiomeType.Mountains: {
            let noNearOcean = eachRelative(biomes, [x, y], DIAGONALS, (col,) => col)
              .every(col => col !== BiomeType.Ocean)
            biome = noNearOcean ? BiomeType.Ocean : BiomeType.Mountains
            break
          }
          case BiomeType.Desert: biome = BiomeType.Plains; break
          default: biome = landType; break
        }
        set(biomes, [x, y], biome)
      }
    }
  }

  generateRivers(biomes: Biomes) {
    let nextBiome: BiomeType
    let oceanNearby: boolean

    let riverCount = 0
    let maxRivers = (this.customLandSize + this.customClimate) * 2 + 6
    let backup: Biomes = createLayer(BiomeType.Ocean)

    for (let _ = 0; _ < 256; _++) {
      if (riverCount >= maxRivers) return
      copyLayer(biomes, backup)

      let riverLength = 0
      let varP
      let allHills: Point[] = []
      eachTile(biomes, (col, p) => {
        if (col === BiomeType.Hills) allHills.push(p)
      })
      if (allHills.length === 0) return
      let hi = irand(allHills.length)
      varP = allHills[hi]

      let varP2 = varP
      let randA = irand(4) * 2

      while (true) {
        set(biomes, varP, BiomeType.Rivers)
        oceanNearby = false

        let neighbourIndex = 0
        while (true) {
          let n = NEIGHBOURS[neighbourIndex]
          let nb = get(biomes, add(varP, n))
          oceanNearby ||= nb === BiomeType.Ocean
          neighbourIndex += 2
          if (neighbourIndex >= NEIGHBOURS.length) break
        }

        randA = ((irand(2) - (riverLength & 1)) * 2 + randA) & 7

        varP = add(varP, NEIGHBOURS[randA])
        nextBiome = get(biomes, varP)
        riverLength += 1

        if (oceanNearby) break;
        if (nextBiome === BiomeType.Mountains || nextBiome === BiomeType.Ocean || nextBiome === BiomeType.Rivers) {
          break
        }
      }

      if ((oceanNearby || nextBiome === BiomeType.Rivers) && riverLength >= 5) {
        riverCount += 1
        NEIGHBOURS.forEach(n => {
          varP = add(varP2, n)
          let biome = get(biomes, varP)
          set(biomes, varP, biome === BiomeType.Forest ? BiomeType.Jungle : biome)
        })
      } else {
        // roll back
        copyLayer(backup, biomes)
      }
    }
  }

  generatePoles(biomes: Biomes) {
    for (let i = 0; i < WIDTH; i++) {
      set(biomes, [i, 0], BiomeType.Arctic)
      set(biomes, [i, HEIGHT-1], BiomeType.Arctic)
    }
    for (let _ = 0; _ < 20; _++) {
      set(biomes, [irand(WIDTH), 0], BiomeType.Tundra)
      set(biomes, [irand(WIDTH), 1], BiomeType.Tundra)
      set(biomes, [irand(WIDTH), HEIGHT-2], BiomeType.Tundra)
      set(biomes, [irand(WIDTH), HEIGHT-1], BiomeType.Tundra)
    }
  }

  hasResource([x, y]: Point, biome: BiomeType): boolean {
    if (y <= 1 || y >= HEIGHT-2) return false
    switch (biome) {
      case BiomeType.Grassland: case BiomeType.Rivers: return ((x + y) % 4) == 0 || ((x + y) % 4) == 3
      default: return (y > 1 && y < HEIGHT-2 && (((x & 3) << 2) + (y & 3)) == (((((x >> 2) * 13) + ((y >> 2) * 11)) + this.tmw) & 0xF))
    }
  }

  hasHut([x, y]: Point, biome: BiomeType): boolean {
    if (y <= 1 || y >= HEIGHT-2 || biome === BiomeType.Ocean) return false
    return (((x & 3) << 2) + (y & 3)) == (((((x >> 2) * 13) + ((y >> 2) * 11)) + this.tmw + 8) & 0x1F)
  }

  calcLandValue(biomes: Biomes, [x, y]: Point): number {
    let biome = get(biomes, [x, y])
    if (biome !== BiomeType.Plains && biome !== BiomeType.Grassland && biome !== BiomeType.Rivers) return 0
    let res = this.hasResource([x, y], biome)

    let landValue = 0

    BFC_W_CENTRE.forEach(([dx, dy]) => {
      let val = 0
      let x2 = x+dx
      let y2 = y+dy
      let biome2 = get(biomes, [x2, y2])
      let nres = this.hasResource([x2, y2], biome2)
      if (nres && (biome2 === BiomeType.Grassland || biome2 === BiomeType.Rivers)) {
        val += 2 + new Biome(biome2).score(false)
      } else {
        val += new Biome(biome2).score(nres)
      }
      if (dx === 0 && dy === 0) {
        val *= 4
      } else if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
        val *= 2
      }
      landValue += val
    })
    if (!res && (biome === BiomeType.Grassland || biome === BiomeType.Rivers)) {
      landValue -= 16
    }
    landValue -= 0x78
    if (landValue < 0) return 8
    landValue = Math.floor(landValue / 8)
    landValue = Math.min(Math.max(1, landValue), 15)
    landValue = Math.floor(landValue / 2)
    return landValue + 8
  }
}