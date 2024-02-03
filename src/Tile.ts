import terrainVertexShader from './shaders/terrain.vert?raw'
import terrainFragmentShader from './shaders/terrain.frag?raw'

import { BufferGeometry, Mesh, Object3D, ShaderMaterial } from 'three'
import Biome, { BiomeType, ImpEffect } from './Biome'
import Continent from './Continent'
import { Point } from './World'
import City from './City'
import { position3d } from './helpers'
import ResourceManager from './ResourceManager'
import { calcn, calcon, calcr } from './calc_helpers'
import Game from './Game'
import BaseUnit from './units/BaseUnit'

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
  game: Game
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
  private _city?: City

  constructor(
    game: Game,
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
    this.game = game
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

  get world() {
    return this.game.world
  }

  get units(): BaseUnit[] {
    let units: BaseUnit[] = []
    this.eachUnit(u => units.push(u))
    return units
  }

  eachUnit(f: (u: BaseUnit) => void) {
    this.game.eachUnitAt(this.position, f)
  }

  createObject(attach = true): [Object3D, TerrainMesh[]] {
    let object = attach ? this.object : new Object3D()
    let meshes = attach ? this.meshes : []

    let baseUniforms = {
      baseTex: { value: ResourceManager.baseTex },
      irrigationTex: { value: ResourceManager.irrigationTex },
      fortressTex: { value: ResourceManager.fortressTex },
      pollutionTex: { value: ResourceManager.pollutionTex },
      roadTex: { value: ResourceManager.roadTex },
      railroadTex: { value: ResourceManager.railroadTex },
      fogTex: { value: ResourceManager.fogTex }
    }

    let biome = this.biome.type
    if (this.biome.type === BiomeType.Ocean) {
      for (let k = 0; k < 4; k++) {
        let on = calcon(this.world, this.position, k)
        let data = on > 7 ? ResourceManager.rivermouths : ResourceManager.ocean
        let mesh = new Mesh(data.geom[on][k], new ShaderMaterial({
          vertexShader: terrainVertexShader,
          fragmentShader: terrainFragmentShader,
          uniforms: {
            ...baseUniforms,
            terrainTex: { value: data.mat.map },
            irrigation: { value: false },
            fortress: { value: false },
            pollution: { value: false },
            road: { value: 0 },
            railroad: { value: 0 },
            fog: { value: 0 },
            unitVisible: { value: false }
          }
        }))
        object.add(mesh)
        meshes.push(mesh)
      }
    } else {
      let calc = biome === BiomeType.Rivers ? calcr : calcn
      let mesh = new Mesh(ResourceManager.terrains[biome].geom[calc(this.world, this.position)], new ShaderMaterial({
        vertexShader: terrainVertexShader,
        fragmentShader: terrainFragmentShader,
        uniforms: {
          ...baseUniforms,
          terrainTex: { value: ResourceManager.terrains[biome].mat.map },
          irrigation: { value: false },
          fortress: { value: false },
          pollution: { value: false },
          road: { value: 0 },
          railroad: { value: 0 },
          fog: { value: 0 },
          unitVisible: { value: false }
        }
      }))
      object.add(mesh)
      meshes.push(mesh)
      // if (biome === BiomeType.Hills || biome === BiomeType.Mountains) {
      //   if (Math.random() < 0.3) {
      //     let mineMesh = new Mesh(mine.geom, mine.mat)
      //     object.add(mineMesh)
      //   }
      // }
      // if (fortified) {
      //   let fortMesh = new Mesh(fortress.geom, fortress.mat)
      //   object.add(fortMesh)
      // }
    }
    // if (polluted) {
    //   let pollMesh = new Mesh(pollution.geom, pollution.mat)
    //   object.add(pollMesh)
    // }
    if (this.resource && biome !== BiomeType.Rivers) {
      let resMesh = new Mesh(ResourceManager.resources[biome].geom, ResourceManager.resources[biome].mat)
      object.add(resMesh)
    }
    if (this.hut && biome !== BiomeType.Ocean) {
      let hutMesh = new Mesh(ResourceManager.hut.geom, ResourceManager.hut.mat)
      object.add(hutMesh)
    }
    object.position.set(...position3d(...this.position))

    return [object, meshes]
  }

  get city() : City | undefined {
    return this._city
  }

  set city(value: City) {
    this._city = value
    this.object.visible = !value
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

  get shields(): number {
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
    if (this._city) return

    this.object.children
      .filter(o => !this.meshes.includes(o as TerrainMesh))
      .forEach(o => o.visible = !value)
    this.meshes.forEach(m => {
      m.material.uniforms.unitVisible.value = value
    })
  }

  clone(): Tile {
    return new Tile(
      this.game,
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