import './style.css'
import * as THREE from 'three'
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js'

import terrainVertexShader from './terrain.vert?raw'
import terrainFragmentShader from './terrain.frag?raw'

type Terrain = { mat: THREE.MeshStandardMaterial, geom: THREE.BufferGeometry[] }
type Ocean = { mat: THREE.MeshStandardMaterial, geom: Record<number, THREE.BufferGeometry[]> }
type Thing = { mat: THREE.MeshStandardMaterial, geom: THREE.BufferGeometry }

const DIRS=[[1,0],[0,-1],[-1,0],[0,1]]

const ODIRS=[
  [[ 0,  1], [ 1,  1], [ 1,  0]],
  [[ 1,  0], [ 1, -1], [ 0, -1]],
  [[-1,  0], [-1,  1], [ 0,  1]],
  [[ 0, -1], [-1, -1], [-1,  0]]
]

const RDIRS=[
  [[ 0,  1], [ 1,  0]],
  [[ 1,  0], [ 0, -1]],
  [[-1,  0], [ 0,  1]],
  [[ 0, -1], [-1,  0]]
]

function getnum(str: string): number {
  return parseInt(str.match(/\d+/)![0], 10)
}

function calcn(map: string[][], i: number, j: number, dirs=DIRS, cmp=(i2:number,j2:number)=>map[i][j]===map[i2][j2]) {
  let c = 0
  dirs.forEach(([di,dj], n) => {
    let i2 = i+di
    let j2 = j+dj
    if (i2 >= 0 && i2 < map.length && j2 >= 0 && j2 < map[0].length && cmp(i2,j2)) {
      c += 2**n
    }
  })
  return c
}

function calcr(map: string[][], i: number, j: number) {
  return calcn(map, i, j, DIRS, (i2:number,j2:number)=>map[i2][j2]==='river'||map[i2][j2]==='ocean')
}

function calcon(map: string[][], i: number, j: number, oi: number) {
  return calcn(map, i, j, ODIRS[oi], (i2,j2)=>map[i2][j2]!=='ocean')+(calcn(map, i, j, RDIRS[oi], (i2,j2)=>map[i2][j2]==='river')<<3)
}

const app = document.getElementById('app')!

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.setY(10)
camera.rotateX(-45)

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor('magenta', 1)
renderer.setSize(window.innerWidth, window.innerHeight)
app.appendChild(renderer.domElement)

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onWindowResize, false)

const light = new THREE.AmbientLight(0xaaaaaa)
scene.add(light)

const dirLight = new THREE.DirectionalLight(0xFFFFFF, 2)
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
  let mat = (gltf.scene.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
  mat.alphaTest = 0.5
  let geom = [...gltf.scene.children].sort((a, b) => getnum(a.name) - getnum(b.name)).map(x => (x as THREE.Mesh).geometry)

  return { mat, geom }
}

async function loadTerrain(name: string): Promise<Terrain> {
  return loadTerrainLike(`terrain/${name}.glb`)
}

async function loadImprovement(name: string): Promise<Thing> {
  let gltf = await loadModel(`improvements/${name}.glb`)
  let mat = (gltf.scene.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
  mat.alphaTest = 0.5
  let geom = (gltf.scene.children[0] as THREE.Mesh).geometry

  return { mat, geom }
}

async function loadResource(name: string): Promise<Thing> {
  let gltf = await loadModel(`resources/${name}.glb`)
  let mat = (gltf.scene.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
  let geom = (gltf.scene.children[0] as THREE.Mesh).geometry

  return { mat, geom }
}

async function loadOcean(name: string): Promise<Ocean> {
  let gltf = await loadModel(`terrain/${name}.glb`)
  let mat = (gltf.scene.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial

  let geom: Record<number, THREE.BufferGeometry[]> = {}
  gltf.scene.children.forEach(child => {
    let [c, i] = child.name.split('_').map(x => parseInt(x, 10))
    geom[c] ||= new Array<THREE.BufferGeometry>(4)
    geom[c][i] = (child as THREE.Mesh).geometry
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

async function load() {
  let [terrains, resources, ocean, rivermouths, irrigation, mine, fortress, pollution, road, railroad] = await Promise.all([
    loadAllTerrains('base', 'mountains', 'hills', 'forest', 'desert', 'arctic', 'tundra', 'grassland', 'plains', 'jungle', 'swamp', 'river'),
    loadAllResources('mountains', 'hills', 'forest', 'desert', 'arctic', 'tundra', 'grassland', 'plains', 'jungle', 'swamp', 'ocean'),
    loadOcean('ocean'),
    loadOcean('rivermouths'),
    loadImprovement('irrigation'),
    loadImprovement('mine'),
    loadImprovement('fortress'),
    loadImprovement('pollution'),
    loadTerrainLike('improvements/road.glb'),
    loadTerrainLike('improvements/railroad.glb')
  ])
  let baseTex = terrains.base.mat.map;
  let irrigationTex = irrigation.mat.map;
  let fortressTex = fortress.mat.map;
  let pollutionTex = pollution.mat.map;
  let roadTex = road.mat.map;
  let railroadTex = railroad.mat.map;
  pollution.mat.opacity = 0.8
  pollution.mat.alphaTest = 0.0
  pollution.mat.transparent = true
  pollution.mat.side = THREE.DoubleSide

  let baseUniforms = {
    baseTex: { value: baseTex },
    irrigationTex: { value: irrigationTex },
    fortressTex: { value: fortressTex },
    pollutionTex: { value: pollutionTex },
    roadTex: { value: roadTex },
    railroadTex: { value: railroadTex }
  }

  let rows = 20
  let cols = 30

  let map: string[][] = []
  for (let i = 0; i < rows; i++) {
    let row = []
    for (let j = 0; j < cols; j++) {
      switch (Math.floor(Math.random()*12)) {
        case 0: row.push('mountains'); break;
        case 1: row.push('hills'); break;
        case 2: row.push('forest'); break;
        case 3: row.push('desert'); break;
        case 4: row.push('arctic'); break;
        case 5: row.push('tundra'); break;
        case 6: row.push('grassland'); break;
        case 7: row.push('plains'); break;
        case 8: row.push('jungle'); break;
        case 9: row.push('swamp'); break;
        case 10: row.push('river'); break;
        case 11: row.push('ocean'); break;
      }
    }
    map.push(row)
  }
  map.forEach((row, i) => {
    row.forEach((col, j) => {
      let object = new THREE.Object3D()
      let polluted = Math.random() < 0.025
      let resource = Math.random() < 0.25
      if (col === 'ocean') {
        for (let k = 0; k < 4; k++) {
          let on = calcon(map, i, j, k)
          let data = on > 7 ? rivermouths : ocean
          let mesh = new THREE.Mesh(data.geom[on][k], new THREE.ShaderMaterial({
            vertexShader: terrainVertexShader,
            fragmentShader: terrainFragmentShader,
            uniforms: {
              ...baseUniforms,
              terrainTex: { value: data.mat.map },
              irrigation: { value: false },
              fortress: { value: false },
              pollution: { value: polluted },
              roadTile: { value: 0 },
              railroadTile: { value: 0}
            }
          }))
          object.add(mesh)
        }
      } else {
        let fortified = Math.random() < 0.05
        let calc = col === 'river' ? calcr : calcn
        let mesh = new THREE.Mesh(terrains[col].geom[calc(map, i, j)], new THREE.ShaderMaterial({
          vertexShader: terrainVertexShader,
          fragmentShader: terrainFragmentShader,
          uniforms: {
            ...baseUniforms,
            terrainTex: { value: terrains[col].mat.map },
            irrigation: { value: Math.random() < 0.5 },
            fortress: { value: fortified },
            pollution: { value: polluted },
            roadTile: { value: 0 },
            railroadTile: { value: 0}
          }
        }))
        object.add(mesh)
        if (col === 'hills' || col === 'mountains') {
          if (Math.random() < 0.5) {
            let mineMesh = new THREE.Mesh(mine.geom, mine.mat)
            object.add(mineMesh)
          }
        }
        if (fortified) {
          let fortMesh = new THREE.Mesh(fortress.geom, fortress.mat)
          object.add(fortMesh)
        }
      }
      if (polluted) {
        let pollMesh = new THREE.Mesh(pollution.geom, pollution.mat)
        object.add(pollMesh)
      }
      if (resource && col !== 'river') {
        let resMesh = new THREE.Mesh(resources[col].geom, resources[col].mat)
        object.add(resMesh)
      }
      object.position.set((cols/2)-j-0.5, 0, -i)
      scene.add(object)
    })
  })
}
load()

function animate() {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
}
animate()