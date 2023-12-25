import terrainVertexShader from './terrain.vert?raw'
import terrainFragmentShader from './terrain.frag?raw'
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  DirectionalLight,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry
} from "three";
import GameState from "./game_state";
import { Thing, loadModel, loadThing } from "./gltf_helpers";
import { BiomeType } from "./biome";
import CameraControls from "./camera_controls";
import World, { Point, HEIGHT, WIDTH } from "./world";
import WorldGenerator from "./world_generator";
import { irand, position2d, position3d } from './helpers';
import Player from './player';
import Unit, { UnitType } from './unit';
import { calcf, calcn, calcon, calcr, calcrailroad, calcroad } from './calc_helpers';

type Terrain = { mat: MeshStandardMaterial, geom: BufferGeometry[] }
type Ocean = { mat: MeshStandardMaterial, geom: Record<number, BufferGeometry[]> }

const DIRS8: Point[] = [
  [ 1, -1], [ 0, -1], [-1, -1],
  [ 1,  0],           [-1,  0],
  [ 1,  1], [ 0,  0], [-1,  1]
]

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

export default class Game extends GameState {
  cameraControls: CameraControls;
  navBar!: HTMLDivElement;
  sideBar!: HTMLDivElement;
  miniMap!: HTMLCanvasElement;
  palacePreview!: HTMLCanvasElement;
  popDisplay!: HTMLDivElement;
  yearDisplay!: HTMLDivElement;
  goldDisplay!: HTMLDivElement;
  taxDisplay!: HTMLDivElement;
  world: World;
  turn: number = 0
  players: Player[] = []
  units!: Record<string, Thing>
  slab!: Thing;

  constructor(ui: HTMLElement, canvas: HTMLCanvasElement) {
    super(ui, canvas)
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.setY(10)
    this.camera.rotateX(-45)
    this.scene.add(this.camera)

    this.cameraControls = new CameraControls(this.camera, canvas)

    const light = new AmbientLight(0xaaaaaa)
    this.scene.add(light)

    const dirLight = new DirectionalLight(0xFFFFFF, 2)
    dirLight.position.set(-1, 2, 1)
    this.scene.add(dirLight)
  
    this.world = new WorldGenerator(1, 1, 1, 1).generate()

    this.moveSelectedUnit = this.moveSelectedUnit.bind(this)
  }

  async init() {
    let [terrains, resources, ocean, rivermouths, irrigation, mine, fortress, pollution, hut, road, railroad, units, slab] = await Promise.all([
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
      loadThing('units/slab.glb')
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

    this.slab = slab

    this.units = units
  
    let baseUniforms = {
      baseTex: { value: baseTex },
      irrigationTex: { value: irrigationTex },
      fortressTex: { value: fortressTex },
      pollutionTex: { value: pollutionTex },
      roadTex: { value: roadTex },
      railroadTex: { value: railroadTex },
      fogTex: { value: fogTex }
    }
  
    this.world.eachTile((tile, [x, y]) => {
      let biome = tile.biome.type
      if (tile.biome.type === BiomeType.Ocean) {
        for (let k = 0; k < 4; k++) {
          let on = calcon(this.world, [x, y], k)
          let data = on > 7 ? rivermouths : ocean
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
          tile.object.add(mesh)
          tile.meshes.push(mesh)
        }
      } else {
        let calc = biome === BiomeType.Rivers ? calcr : calcn
        let mesh = new Mesh(terrains[biome].geom[calc(this.world, [x, y])], new ShaderMaterial({
          vertexShader: terrainVertexShader,
          fragmentShader: terrainFragmentShader,
          uniforms: {
            ...baseUniforms,
            terrainTex: { value: terrains[biome].mat.map },
            irrigation: { value: false },
            fortress: { value: false },
            pollution: { value: false },
            road: { value: 0 },
            railroad: { value: 0 },
            fog: { value: 0 },
            unitVisible: { value: false }
          }
        }))
        tile.object.add(mesh)
        tile.meshes.push(mesh)
        // if (biome === BiomeType.Hills || biome === BiomeType.Mountains) {
        //   if (Math.random() < 0.3) {
        //     let mineMesh = new Mesh(mine.geom, mine.mat)
        //     tile.object.add(mineMesh)
        //   }
        // }
        // if (fortified) {
        //   let fortMesh = new Mesh(fortress.geom, fortress.mat)
        //   tile.object.add(fortMesh)
        // }
      }
      // if (polluted) {
      //   let pollMesh = new Mesh(pollution.geom, pollution.mat)
      //   tile.object.add(pollMesh)
      // }
      if (tile.resource && biome !== BiomeType.Rivers) {
        let resMesh = new Mesh(resources[biome].geom, resources[biome].mat)
        tile.object.add(resMesh)
      }
      if (tile.hut && biome !== BiomeType.Ocean) {
        let hutMesh = new Mesh(hut.geom, hut.mat)
        tile.object.add(hutMesh)
      }
      tile.object.position.set(...position3d(x, y))
      tile.object.visible = false
      this.scene.add(tile.object)
    })

    this.spawnFirstSettler()
  }

  onEnter() {
    this.app.classList.add('game')

    this.navBar = document.createElement('div')
    this.navBar.classList.add('nav_bar')
    let menuItems = [
      'Game',
      'Orders',
      'Advisors',
      'World',
      'Civilopedia'
    ]
    menuItems.forEach(item => {
      let itemButton = document.createElement('button')
      itemButton.textContent = item
      this.navBar.append(itemButton)
    })
    this.app.append(this.navBar)

    this.sideBar = document.createElement('div')
    this.sideBar.classList.add('side_bar')

    this.miniMap = document.createElement('canvas')
    this.miniMap.classList.add('mini_map')
    this.sideBar.append(this.miniMap)

    let infoSection = document.createElement('div')
    infoSection.classList.add('info_section')
    this.sideBar.append(infoSection)
    this.palacePreview = document.createElement('canvas')
    this.palacePreview.classList.add('palace')
    infoSection.append(this.palacePreview)
    this.popDisplay = document.createElement('div')
    this.popDisplay.classList.add('population')
    this.popDisplay.textContent = '100,000'
    infoSection.append(this.popDisplay)
    this.yearDisplay = document.createElement('div')
    this.yearDisplay.classList.add('year')
    this.yearDisplay.textContent = '4000 BC'
    infoSection.append(this.yearDisplay)
    let moneySection = document.createElement('div')
    moneySection.classList.add('money')
    this.goldDisplay = document.createElement('div')
    this.goldDisplay.classList.add('gold')
    this.goldDisplay.textContent = '0'
    moneySection.append(this.goldDisplay)
    this.taxDisplay = document.createElement('div')
    this.taxDisplay.classList.add('tax')
    this.taxDisplay.textContent = '0.5.5'
    moneySection.append(this.taxDisplay)
    infoSection.append(moneySection)
    this.sideBar.append(infoSection)

    let currentInfo = document.createElement('div')
    currentInfo.classList.add('current_info')
    currentInfo.textContent = 'Roman'
    this.sideBar.append(currentInfo)

    this.app.append(this.sideBar)

    window.addEventListener('click', this.moveSelectedUnit)
  }

  spawnFirstSettler() {
    this.players.push(new Player(this.world))

    for (let i = 0; i < 2000; i++) {
      let x = irand(WIDTH)
      let y = irand(HEIGHT)
      let tile = this.world.get(x, y)
      if (tile.biome.type === BiomeType.Ocean) continue
      if (tile.landValue < (12 - Math.floor(i/32))) continue
      // TODO: if the distance to the closest enemy city (or settler for turn 0) is smaller than (10 - loopCounter/64), loop back to 1.
      let bcount = 0
      this.world.eachInContinent([x, y], t => {
        if (t.biome.type === BiomeType.Plains || t.biome.type === BiomeType.Grassland || t.biome.type === BiomeType.Rivers) {
          bcount++
        }
      })
      if (bcount < (32 - Math.floor(this.turn / 16))) continue
      // TODO: if the square's continent already contains cities, and current year is after 0, loop back to 1.
      if (tile.hut) continue

      let settler = new Unit(UnitType.Settlers, [x, y], this.world)
      settler.player = this.players[0]
      settler.selected = true
      settler.object.position.set(...position3d(x, y))
      settler.object.add(new Mesh(this.units.settlers.geom, this.units.settlers.mat))
      let slab = new Mesh(this.slab.geom, new MeshPhongMaterial({ color: 'magenta' }))
      settler.object.add(slab)
      this.scene.add(settler.object)
      this.players[0].units.push(settler)
      this.players[0].revealMap([x, y])

      this.cameraControls.goTo([x, y], 0.2)

      return
    }

    console.log("no suitable spawn point found :(")
  }

  moveSelectedUnit(event: MouseEvent) {
    console.log('moving....?')
    if (event.button === 2) {
      let v = this.cameraControls.getMousePointOnMap(event)
      let p = position2d(v)
      console.log(`move to: ${p[0]}, ${p[1]}`)
      this.players[0].units[0].moveTo(p)
    }
  }

  onLeave() {
    this.cameraControls.destroy()
    this.app.classList.remove('game')
    this.navBar.remove()
    this.sideBar.remove()
  }
}

