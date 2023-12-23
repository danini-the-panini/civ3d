import './style.css'
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js'
import CameraControls from './camera_controls'

import terrainVertexShader from './terrain.vert?raw'
import terrainFragmentShader from './terrain.frag?raw'
import WorldGenerator from './world_generator'
import { BiomeType } from './biome'
import { Road } from './tile'
import World, { HEIGHT, Point, WIDTH } from './world'
import { AmbientLight,
  BufferGeometry,
  DirectionalLight,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  WebGLRenderer
} from 'three'
import { Thing } from './gltf_helpers'

type Terrain = { mat: MeshStandardMaterial, geom: BufferGeometry[] }
type Ocean = { mat: MeshStandardMaterial, geom: Record<number, BufferGeometry[]> }

const DIRS: Point[] = [[0,1],[-1,0],[0,-1],[1,0]]
const DIRS8: Point[] = [
  [ 1, -1], [ 0, -1], [-1, -1],
  [ 1,  0],           [-1,  0],
  [ 1,  1], [ 0,  0], [-1,  1]
]
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

function getnum(str: string): number {
  return parseInt(str.match(/\d+/)![0], 10)
}

function calcn(world: World, [x, y]: Point, dirs=DIRS, cmp=([x2,y2]:Point)=>world.get(x, y).biome.type === world.get(x2, y2).biome.type) {
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

function calcr(world: World, p: Point): number {
  return calcn(world, p, DIRS, ([x2,y2])=>world.get(x2,y2).biome.type===BiomeType.Rivers||world.get(x2,y2).biome.type===BiomeType.Ocean)
}

function calcon(world: World, p: Point, oi: number): number {
  return calcn(world, p, ODIRS[oi], ([x2,y2])=>world.get(x2, y2).biome.type!==BiomeType.Ocean)+(calcn(world, p, RDIRS[oi], ([x2,y2])=>world.get(x2,y2).biome.type===BiomeType.Rivers)<<3)
}

function calcroad(world: World, p: Point, N=Road.Road): number {
  if (world.get(...p).road < N) return 0
  return calcn(world, p, DIRS9, ([x2,y2])=>world.get(x2,y2).road>=N)
}

function calcrailroad(world: World, p: Point): number {
  return calcroad(world, p, Road.Railroad)
}

function calcf(world: World, p: Point): number {
  return calcn(world, p, DIRS, ([x2,y2])=>world.get(x2,y2).visible)
}

const app = document.getElementById('app')!

const scene = new Scene()
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.setY(10)
camera.rotateX(-45)
scene.add(camera)

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
app.appendChild(renderer.domElement)

new CameraControls(camera)

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onWindowResize, false)

const light = new AmbientLight(0xaaaaaa)
scene.add(light)

const dirLight = new DirectionalLight(0xFFFFFF, 2)
dirLight.position.set(-1, 2, 1)
scene.add(dirLight)

const loader = new GLTFLoader()

function loadModel(path: string): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, (error) => {
      console.error(`Error loading ${path}`)
      reject(error)
    })
  })
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

async function load() {
  let [terrains, resources, ocean, rivermouths, irrigation, mine, fortress, pollution, hut, road, railroad, units] = await Promise.all([
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
      'diplomat', 'fighter', 'frigate', 'ironclad', 'knights', 'legion', 'mech_inf', 'militia', 'musketeers', 'nuclear', 'phalanx', 'rifleman',
      'riflemen', 'sail', 'settlers', 'submarine', 'transport', 'trireme')
  ])
  let baseTex = terrains.base.mat.map;
  let irrigationTex = irrigation.mat.map;
  let fortressTex = fortress.mat.map;
  let pollutionTex = pollution.mat.map;
  let roadTex = road.mat.map;
  let railroadTex = railroad.mat.map;
  let fogTex = terrains.fog.mat.map;
  pollution.mat.opacity = 0.8
  pollution.mat.alphaTest = 0.0
  pollution.mat.transparent = true
  pollution.mat.side = DoubleSide

  let baseUniforms = {
    baseTex: { value: baseTex },
    irrigationTex: { value: irrigationTex },
    fortressTex: { value: fortressTex },
    pollutionTex: { value: pollutionTex },
    roadTex: { value: roadTex },
    railroadTex: { value: railroadTex },
    fogTex: { value: fogTex }
  }

  let world = new WorldGenerator(1, 1, 1, 1).generate()

  world.eachTile(tile => {
    tile.visible = Math.random() < 0.9
  })

  for (let k = 0; k < 10; k++) {
    let x = Math.floor(Math.random()*WIDTH)
    let y = Math.floor(Math.random()*HEIGHT)
    let dir = Math.floor(Math.random()*8)
    let len = Math.floor(Math.random()*20)
    let t = Math.random() < 0.2 ? Road.Railroad : Road.Road
    for (let l = 0; l < len; l++) {
      let tile = world.get(x, y)
      if (tile.biome.type === BiomeType.Ocean) break
      if (tile.road === Road.No) {
        tile.road = t
      }
      let d = DIRS8[dir]
      y+=d[0]
      x+=d[1]
      if (y<0||x<0||y>=HEIGHT||x>=WIDTH) break
      dir += Math.floor(Math.random()*3)-1
      if (dir >= 8) dir %= 8
      if (dir < 0) dir += 8
    }
  }

  world.eachTile((tile, [x, y]) => {
    let biome = tile.biome.type
    let object = new Object3D()
    let polluted = Math.random() < 0.025
    let fog = calcf(world, [x, y])
    if (tile.biome.type === BiomeType.Ocean) {
      for (let k = 0; k < 4; k++) {
        let on = calcon(world, [x, y], k)
        let data = on > 7 ? rivermouths : ocean
        let mesh = new Mesh(data.geom[on][k], new ShaderMaterial({
          vertexShader: terrainVertexShader,
          fragmentShader: terrainFragmentShader,
          uniforms: {
            ...baseUniforms,
            terrainTex: { value: data.mat.map },
            irrigation: { value: false },
            fortress: { value: false },
            pollution: { value: polluted },
            road: { value: 0 },
            railroad: { value: 0 },
            fog: { value: fog }
          }
        }))
        object.add(mesh)
      }
    } else {
      let fortified = Math.random() < 0.05
      let calc = biome === BiomeType.Rivers ? calcr : calcn
      let mesh = new Mesh(terrains[biome].geom[calc(world, [x, y])], new ShaderMaterial({
        vertexShader: terrainVertexShader,
        fragmentShader: terrainFragmentShader,
        uniforms: {
          ...baseUniforms,
          terrainTex: { value: terrains[biome].mat.map },
          irrigation: { value: Math.random() < 0.5 },
          fortress: { value: fortified },
          pollution: { value: polluted },
          road: { value: calcroad(world, [x, y]) },
          railroad: { value: calcrailroad(world, [x, y]) },
          fog: { value: fog }
        }
      }))
      object.add(mesh)
      if (biome === BiomeType.Hills || biome === BiomeType.Mountains) {
        if (Math.random() < 0.3) {
          let mineMesh = new Mesh(mine.geom, mine.mat)
          object.add(mineMesh)
        }
      }
      if (fortified) {
        let fortMesh = new Mesh(fortress.geom, fortress.mat)
        object.add(fortMesh)
      }
    }
    if (polluted) {
      let pollMesh = new Mesh(pollution.geom, pollution.mat)
      object.add(pollMesh)
    }
    if (tile.resource && biome !== BiomeType.Rivers) {
      let resMesh = new Mesh(resources[biome].geom, resources[biome].mat)
      object.add(resMesh)
    }
    if (tile.hut && biome !== BiomeType.Ocean) {
      let hutMesh = new Mesh(hut.geom, hut.mat)
      object.add(hutMesh)
    }
    object.position.set((WIDTH/2)-x-0.5, 0, -y)
    object.visible = tile.visible
    scene.add(object)
  })

  let allUnits = Object.values(units)
  for (let i = 0; i < allUnits.length; i++) {
    let object = new Mesh(allUnits[i].geom, allUnits[i].mat)
    object.position.set((WIDTH/2)-i-0.5, 0, -HEIGHT/2)
    scene.add(object)
  }
}
load()

function animate() {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
}
animate()