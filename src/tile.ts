import Biome, { BiomeType, ImpEffect } from "./biome";

export enum Road {
  No,
  Road,
  Railroad
}

export enum Improvement {
  No,
  Irrigation,
  Mine
}

interface Clone<T> {
  clone(): T
}

export default class Tile implements Clone<Tile> {
  biome: Biome
  resource: boolean
  hut: boolean
  improvement: Improvement
  road: Road
  fortress: boolean
  visible: boolean

  constructor(biome: BiomeType, resource: boolean, hut: boolean, improvement = Improvement.No, road = Road.No, fortress = false, visible = true) {
    this.biome = new Biome(biome)
    this.resource = resource
    this.hut = hut
    this.improvement = improvement
    this.road = road
    this.fortress = fortress
    this.visible = visible
  }

  attributes(): [number, number, number] {
    return this.resource ? this.biome.specialAttributes() : this.biome.baseAttributes()
  }

  food(): number {
    let [f,] = this.attributes()
    if (this.improvement === Improvement.Irrigation) {
      let irrigation = this.biome.irrigation()
      if (irrigation.kind === ImpEffect.Yes) {
        return f + irrigation.effect
      }
    }
    return f
  }

  resources(): number {
    let [,r,] = this.attributes()
    if (this.improvement === Improvement.Mine) {
      let mine = this.biome.mine()
      if (mine.kind === ImpEffect.Yes) {
        return r + mine.effect
      }
    }
    return r
  }

  trade(): number {
    let [,,t] = this.attributes()
    switch (this.road) {
      case Road.No: return t
      default: return this.biome.roadTrade()
    }
  }

  defenseBonus(): number {
    let [d, d2] = this.biome.defenseBonus()
    return this.fortress ? d2 : d
  }

  clone(): Tile {
    return new Tile(
      this.biome.type,
      this.resource,
      this.hut,
      this.improvement,
      this.road,
      this.fortress
    )
  }
}