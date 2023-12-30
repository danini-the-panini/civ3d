import terrainVertexShader from './shaders/terrain.vert?raw'
import terrainFragmentShader from './shaders/terrain.frag?raw'
import {
  AmbientLight,
  BufferGeometry,
  CustomBlending,
  DirectionalLight,
  DoubleSide,
  DstAlphaFactor,
  DstColorFactor,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  OneMinusDstAlphaFactor,
  OneMinusSrcAlphaFactor,
  OneMinusSrcColorFactor,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SrcAlphaFactor,
  SrcColorFactor,
  Vector3,
} from "three";
import GameState from "./game_state";
import { Thing, loadModel, loadThing } from "./gltf_helpers";
import { BiomeType } from "./biome";
import CameraControls from "./camera_controls";
import World, { Point, HEIGHT, WIDTH } from "./world";
import WorldGenerator from "./world_generator";
import { capitalize, irand, position2d, position3d } from './helpers';
import Player from './player';
import Unit, { UnitType } from './unit';
import { calcn, calcon, calcr } from './calc_helpers';
import City from './city';
import { Font, FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';
import { degToRad } from 'three/src/math/MathUtils.js';

type Terrain = { mat: MeshStandardMaterial, geom: BufferGeometry[] }
type Ocean = { mat: MeshStandardMaterial, geom: Record<number, BufferGeometry[]> }

const DIRS8: Point[] = [
  [ 1, -1], [ 0, -1], [-1, -1],
  [ 1,  0],           [-1,  0],
  [ 1,  1], [ 0,  0], [-1,  1]
]

const fontLoader = new FontLoader()

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

async function loadFont(name: string): Promise<Font> {
  return new Promise((resolve, reject) => {
    fontLoader.load(`fonts/${name}.typeface.json`, resolve, undefined, reject)
  })
}

export default class Game extends GameState {
  cameraControls: CameraControls
  navBar!: HTMLDivElement
  sideBar!: HTMLDivElement
  miniMap!: HTMLCanvasElement
  palacePreview!: HTMLCanvasElement
  popDisplay!: HTMLDivElement
  yearDisplay!: HTMLDivElement
  goldDisplay!: HTMLDivElement
  taxDisplay!: HTMLDivElement
  currentInfo!: HTMLDivElement
  world: World;
  turn: number = 0
  players: Player[] = []
  units!: Record<string, Thing>
  slab!: Thing
  citySlab!: Thing;
  cityGrid!: Thing;
  font!: Font;
  private _currentPlayerIndex: number = 0

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
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  get currentPlayer(): Player {
    return this.players[this._currentPlayerIndex]
  }

  get selectedUnit() : Unit | null {
    return this.currentPlayer.selectedUnit
  }

  async init() {
    let [terrains, resources, ocean, rivermouths, irrigation, mine, fortress, pollution, hut, road, railroad, units, slab, citySlab, cityGrid, font] = await Promise.all([
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
    this.citySlab = citySlab
    this.cityGrid = cityGrid
    this.font = font

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
    let menuItems: [string, (string | string[] | null)[]][] = [
      // TODO: disabled items?
      ['Game', [
        'Tax Rate',
        'Luxuries Rate',
        'FindCity',
        'Options',
        'Save Game',
        'REVOLUTION!',
        null,
        'Retire',
        'QUIT to DOS'
      ]],
      ['Orders', [
        // TODO: different orders for different units
        ['No Orders', 'space'],
        ['Fortify', 'f'],
        ['Wait', 'w'],
        ['Sentry', 's'],
        'GoTo',
        null,
        ['Disband Unit', 'D']
      ]],
      ['Advisors', [
        'City Status (F1)',
        'Military Advisor (F2)',
        'Intelligence Advisor (F3)',
        'Attitude Advisor (F4)',
        'Trade Advisor (F5)',
        'Science Advisor (F6)'
      ]],
      ['World', [
        'Wonders of the World (F7)',
        'Top 5 Cities (F8)',
        'Civilization Score (F9)',
        'World Map (F10)',
        'Demographics',
        'SpaceShips'
      ]],
      ['Civilopedia', [
        'Complete',
        'Civilization Advances',
        'City Improvements',
        'Military Units',
        'Terrain Types',
        'Miscellaneous'
      ]]
    ]
    menuItems.forEach(([title, options]) => {
      let itemWrapper = document.createElement('div')
      itemWrapper.classList.add('dropdown_wrapper')
      let itemButton = document.createElement('button')
      itemButton.classList.add('nav_bar_item')
      itemButton.textContent = title
      itemWrapper.append(itemButton)
      let itemDropdown = document.createElement('ul')
      itemDropdown.classList.add('dropdown')
      options.forEach(option => {
        let optionElement = document.createElement('li')
        let optionButton = document.createElement('button')
        if (!option) {
          optionElement.append(document.createElement('br'))
        } else if (Array.isArray(option)) {
          let [optionTitle, optionMnemo] = option
          let optionTitleEl = document.createElement('span')
          optionTitleEl.textContent = optionTitle
          optionButton.append(optionTitleEl)
          let optionMnemoEl = document.createElement('span')
          optionMnemoEl.classList.add('mnemonic')
          optionMnemoEl.textContent = optionMnemo
          optionButton.append(optionMnemoEl)
          optionElement.append(optionButton)
        } else {
          optionButton.textContent = option
          optionElement.append(optionButton)
        }
        itemDropdown.append(optionElement)
      })
      itemButton.addEventListener('click', event => {
        let otherDropdowns = document.querySelectorAll('.dropdown')
        for (let dropdown of otherDropdowns) {
          if (dropdown === itemDropdown) continue
          dropdown.classList.remove('open')
        }
        itemDropdown.classList.toggle('open')
        event.stopPropagation()
      })
      itemWrapper.append(itemDropdown)
      this.navBar.append(itemWrapper)
    })
    this.app.append(this.navBar)

    window.addEventListener('click', event => {
      if ((event.target as HTMLElement).closest('.dropdown')) return

      let otherDropdowns = document.querySelectorAll('.dropdown')
      for (let dropdown of otherDropdowns) {
        dropdown.classList.remove('open')
      }
    })

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

    this.currentInfo = document.createElement('div')
    this.currentInfo.classList.add('current_info')
    this.currentInfo.textContent = 'Roman'
    this.sideBar.append(this.currentInfo)

    this.app.append(this.sideBar)

    window.addEventListener('mouseup', this.moveSelectedUnit)
    window.addEventListener('keypress', this.handleKeyPress)
  }

  spawnFirstSettler() {
    this.players.push(new Player(this))

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

      let settlers = Unit.spawn(UnitType.Settlers, [x, y], this.players[0], this.units, this.slab)
      this.scene.add(settlers.object)

      let unit = Unit.spawn(UnitType.Cavalry, [x, y], this.players[0], this.units, this.slab)
      this.scene.add(unit.object)

      this.players[0].selectedUnit = settlers

      this.updateCurrentInfo()

      this.focusOn(this.players[0].selectedUnit, true)

      return
    }

    console.warn('no suitable spawn point found :(')
  }

  eachUnit(f: (unit: Unit) => void) {
    this.players.forEach(player => {
      player.units.forEach(unit => f(unit))
    })
  }

  eachCity(f: (city: City) => void) {
    this.players.forEach(player => {
      player.cities.forEach(city => f(city))
    })
  }

  eachUnitAt([x, y]: Point, f: (unit: Unit) => void) {
    this.eachUnit(unit => {
      if (unit.position[0] === x && unit.position[1] === y) f(unit)
    })
  }

  unitAt(p: Point, except?: Unit): Unit | null {
    let unit: Unit | null = null
    this.eachUnitAt(p, u => {
      if (u !== except) unit = u
    })
    return unit
  }
  
  cityAt([x, y]: Point): City | undefined {
    return this.world.get(x, y).city
  }

  focusOn(unit: Unit | null, immediate = false) {
    if (unit) {
      if (immediate) {
        this.cameraControls.goTo(unit.position, 0.2)
      } else {
        this.cameraControls.flyTo(unit.position, 0.2)
      }
    }
  }

  nextPlayer() {
    this._currentPlayerIndex++
    if (this._currentPlayerIndex >= this.players.length) {
      this._currentPlayerIndex = 0
    }
  }

  moveSelectedUnit(event: MouseEvent) {
    if (event.button === 2) {
      let v = this.cameraControls.getMousePointOnMap(event)
      let p = position2d(v)
      let selectedUnit = this.currentPlayer.selectedUnit
      selectedUnit?.moveTo(p, m => {
        if (m === 0) {
          this.currentPlayer.selectNextUnit()
          this.focusOn(this.currentPlayer.selectedUnit)
        }
        this.updateCurrentInfo()
      })
    }
  }

  endTurn() {
    this.nextPlayer()
    this.currentPlayer.startTurn()
    this.focusOn(this.currentPlayer.selectedUnit)
    this.updateCurrentInfo()
  }

  buildCity() {
    if (this.selectedUnit?.type !== UnitType.Settlers) return

    let name = prompt('City name...')

    if (!name) return

    let city = new City(this.currentPlayer, [...this.selectedUnit.position], name)


    city.object.add(new Mesh(this.citySlab.geom, new MeshPhongMaterial({ color: 'magenta' })))
    city.object.add(new Mesh(this.cityGrid.geom, new MeshPhongMaterial({ color: '#822014' })))
    let text = new Mesh(new TextGeometry(city.size.toString(), { font: this.font, size: 1, height: 0.1 }), new MeshPhongMaterial({ color: 'black' }))
    text.rotateX(degToRad(-90))
    text.geometry.computeBoundingBox()
    text.position.x += 0.5 - text.geometry.boundingBox!.max.x / 2
    text.position.y += 0.1
    text.position.z -= 0.5 - text.geometry.boundingBox!.max.y / 2
    city.object.add(text)
    city.object.position.set(...position3d(...city.position))
    this.world.get(...city.position).city = city
    this.scene.add(city.object)

    this.currentPlayer.cities.push(city)
    this.selectedUnit.remove()
    this.focusOn(this.currentPlayer.selectedUnit)
  }

  handleKeyPress(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        this.endTurn()
        break
      case 'b':
        this.buildCity()
        break
    }
  }

  updateCurrentInfo() {
    let unit = this.currentPlayer.selectedUnit
    if (unit) {
      let tile = this.world.get(...unit.position)
      this.currentInfo.innerHTML = `
      Romans<br>
      ${capitalize(unit.type)}<br>
      Moves: ${unit.movement}<br>
      NONE<br>
      (${capitalize(tile.biome.type)})
      `
    } else {
      this.currentInfo.innerHTML = `
      <br>
      <br>
      <span class="blink">End of Turn</span><br>
      Press Enter<br>
      to continue
      `
    }
  }

  onLeave() {
    this.cameraControls.destroy()
    this.app.classList.remove('game')
    this.navBar.remove()
    this.sideBar.remove()
  }
}
