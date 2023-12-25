import { BufferGeometry, Mesh, Object3D, ShaderMaterial } from "three";
import Biome, { BiomeType, ImpEffect } from "./biome";
import Continent from "./continent";
import { Point } from "./world";

type TerrainMesh = Mesh<BufferGeometry, ShaderMaterial>

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
  position: Point
  resource: boolean
  hut: boolean
  landValue: number
  improvement: Improvement
  road: Road
  fortress: boolean
  continent: Continent | undefined
  object: Object3D = new Object3D()
  meshes: TerrainMesh[] = []

  constructor(
    biome: BiomeType,
    position: Point,
    resource: boolean,
    hut: boolean,
    landValue = 0,
    improvement = Improvement.No,
    road = Road.No,
    fortress = false,
    continent: Continent | undefined = undefined
  ) {
    this.biome = new Biome(biome)
    this.position = position
    this.resource = resource
    this.hut = hut
    this.landValue = landValue
    this.improvement = improvement
    this.road = road
    this.fortress = fortress
    this.continent = continent
  }

  get attributes(): [number, number, number] {
    return this.resource ? this.biome.specialAttributes : this.biome.baseAttributes
  }

  get food(): number {
    let [f,] = this.attributes
    if (this.improvement === Improvement.Irrigation) {
      let irrigation = this.biome.irrigation
      if (irrigation.kind === ImpEffect.Yes) {
        return f + irrigation.effect
      }
    }
    return f
  }

  get resources(): number {
    let [,r,] = this.attributes
    if (this.improvement === Improvement.Mine) {
      let mine = this.biome.mine
      if (mine.kind === ImpEffect.Yes) {
        return r + mine.effect
      }
    }
    return r
  }

  get trade(): number {
    let [,,t] = this.attributes
    switch (this.road) {
      case Road.No: return t
      default: return this.biome.roadTrade
    }
  }

  get defenseBonus(): number {
    let [d, d2] = this.biome.defenseBonus
    return this.fortress ? d2 : d
  }

  get isOcean() {
    return this.biome.type === BiomeType.Ocean
  }

  set unitVisible(value: boolean) {
    this.object.children
      .filter(o => !this.meshes.includes(o as TerrainMesh))
      .forEach(o => o.visible = !value)
    this.meshes.forEach(m => {
      m.material.uniforms.unitVisible.value = value
    })
  }

  clone(): Tile {
    return new Tile(
      this.biome.type,
      this.position,
      this.resource,
      this.hut,
      this.landValue,
      this.improvement,
      this.road,
      this.fortress,
      this.continent
    )
  }
}