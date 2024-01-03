import { BufferGeometry, DoubleSide, Mesh, MeshStandardMaterial, Texture } from "three"
import { Thing, loadModel, loadThing } from "./gltf_helpers"
import { Font, FontLoader } from "three/examples/jsm/Addons.js"


type Terrain = { mat: MeshStandardMaterial, geom: BufferGeometry[] }
type Ocean = { mat: MeshStandardMaterial, geom: Record<number, BufferGeometry[]> }

function getnum(str: string): number {
  return parseInt(str.match(/\d+/)![0], 10)
}

async function loadTerrainLike(path: string): Promise<Terrain> {
  let gltf = await loadModel(path)
  let mat = (gltf.scene.children[0] as Mesh).material as MeshStandardMaterial
  mat.alphaTest = 0.5
  let geom = [...gltf.scene.children].sort((a, b) => getnum(a.name) - getnum(b.name)).map(x => (x as Mesh).geometry)

  return { mat, geom }
}

async function loadTerrain(name: string): Promise<Terrain> {
  return loadTerrainLike(`terrain/${name}.glb`)
}

async function loadImprovement(name: string): Promise<Thing> {
  let gltf = await loadModel(`improvements/${name}.glb`)
  let mat = (gltf.scene.children[0] as Mesh).material as MeshStandardMaterial
  mat.alphaTest = 0.5
  let geom = (gltf.scene.children[0] as Mesh).geometry

  return { mat, geom }
}

async function loadResource(name: string): Promise<Thing> {
  let gltf = await loadModel(`resources/${name}.glb`)
  let mat = (gltf.scene.children[0] as Mesh).material as MeshStandardMaterial
  let geom = (gltf.scene.children[0] as Mesh).geometry

  return { mat, geom }
}

async function loadUnit(name: string): Promise<Thing> {
  let gltf = await loadModel(`units/${name}.glb`)
  let mat = (gltf.scene.children[0] as Mesh).material as MeshStandardMaterial
  let geom = (gltf.scene.children[0] as Mesh).geometry

  return { mat, geom }
}

async function loadOcean(name: string): Promise<Ocean> {
  let gltf = await loadModel(`terrain/${name}.glb`)
  let mat = (gltf.scene.children[0] as Mesh).material as MeshStandardMaterial

  let geom: Record<number, BufferGeometry[]> = {}
  gltf.scene.children.forEach(child => {
    let [c, i] = child.name.split('_').map(x => parseInt(x, 10))
    geom[c] ||= new Array<BufferGeometry>(4)
    geom[c][i] = (child as Mesh).geometry
  })

  return { mat, geom }
}

async function loadAllThings<T>(names: string[], load: (name: string) => Promise<T>): Promise<Record<string, T>> {
  let things: Record<string, T> = {}
  await Promise.all(names.map(name => load(name).then(x => { things[name] = x })))
  return things
}

async function loadAllTerrains(...names: string[]): Promise<Record<string, Terrain>> {
  return loadAllThings(names, loadTerrain)
}

async function loadAllResources(...names: string[]): Promise<Record<string, Thing>> {
  return loadAllThings(names, loadResource)
}

async function loadAllUnits(...names: string[]): Promise<Record<string, Thing>> {
  return loadAllThings(names, loadUnit)
}

const fontLoader = new FontLoader()

async function loadFont(name: string): Promise<Font> {
  return new Promise((resolve, reject) => {
    fontLoader.load(`fonts/${name}.typeface.json`, resolve, undefined, reject)
  })
}

class ResourceManager {
  promise: Promise<void>
  terrains!: Record<string, Terrain>
  resources!: Record<string, Thing>
  ocean!: Ocean
  rivermouths!: Ocean
  irrigation!: Thing
  mine!: Thing
  fortress!: Thing
  pollution!: Thing
  hut!: Thing
  road!: Terrain
  railroad!: Terrain
  units!: Record<string, Thing>
  slab!: Thing
  citySlab!: Thing
  cityGrid!: Thing
  font!: Font
  baseTex!: Texture
  irrigationTex!: Texture
  fortressTex!: Texture
  pollutionTex!: Texture
  roadTex!: Texture
  railroadTex!: Texture
  fogTex!: Texture

  constructor() {
    this.promise = this.load()
  }

  async await() {
    await this.promise
  }

  async load() {
    [
      this.terrains,
      this.resources,
      this.ocean,
      this.rivermouths,
      this.irrigation,
      this.mine,
      this.fortress,
      this.pollution,
      this.hut,
      this.road,
      this.railroad,
      this.units,
      this.slab,
      this.citySlab,
      this.cityGrid,
      this.font
    ] = await Promise.all([
      loadAllTerrains('base', 'mountains', 'hills', 'forest', 'desert', 'arctic', 'tundra', 'grassland', 'plains', 'jungle', 'swamp', 'river', 'fog'),
      loadAllResources('mountains', 'hills', 'forest', 'desert', 'arctic', 'tundra', 'grassland', 'plains', 'jungle', 'swamp', 'ocean'),
      loadOcean('ocean'),
      loadOcean('rivermouths'),
      loadImprovement('irrigation'),
      loadImprovement('mine'),
      loadImprovement('fortress'),
      loadImprovement('pollution'),
      loadImprovement('hut'),
      loadTerrainLike('improvements/road.glb'),
      loadTerrainLike('improvements/railroad.glb'),
      loadAllUnits('armor', 'artillery', 'battleship', 'bomber', 'cannon', 'caravan', 'carrier', 'catapult', 'cavalry', 'chariot', 'cruiser',
        'diplomat', 'fighter', 'frigate', 'ironclad', 'knights', 'legion', 'mech_inf', 'militia', 'musketeers', 'nuclear', 'phalanx', 'riflemen',
        'sail', 'settlers', 'submarine', 'transport', 'trireme'),
      loadThing('units/slab.glb'),
      loadThing('improvements/city_slab.glb'),
      loadThing('improvements/city_grid.glb'),
      loadFont('civ')
    ])

    
    this.baseTex = this.terrains.base.mat.map!;
    this.irrigationTex = this.irrigation.mat.map!;
    this.fortressTex = this.fortress.mat.map!;
    this.pollutionTex = this.pollution.mat.map!;
    this.roadTex = this.road.mat.map!;
    this.railroadTex = this.railroad.mat.map!;
    this.fogTex = this.terrains.fog.mat.map!;

    this.pollution.mat.opacity = 0.8
    this.pollution.mat.alphaTest = 0.0
    this.pollution.mat.transparent = true
    this.pollution.mat.side = DoubleSide
  }
}

const instance = new ResourceManager()

export default instance