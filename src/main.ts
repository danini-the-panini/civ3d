import './style.css'
import * as THREE from 'three'
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js'

import terrainVertexShader from './terrain.vert?raw'
import terrainFragmentShader from './terrain.frag?raw'

type Terrain = { mat: THREE.MeshStandardMaterial, geom: THREE.BufferGeometry[] }
type Ocean = { mat: THREE.MeshStandardMaterial, geom: Record<number, THREE.BufferGeometry[]> }

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

const light = new THREE.AmbientLight(0xFFFFFF)
scene.add(light)

const loader = new GLTFLoader()

function loadModel(path: string): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject)
  })
}

async function loadTerrain(name: string): Promise<Terrain> {
  let gltf = await loadModel(`terrain/${name}.glb`)
  let mat = (gltf.scene.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
  mat.alphaTest = 0.5
  let geom = [...gltf.scene.children].sort((a, b) => getnum(a.name) - getnum(b.name)).map(x => (x as THREE.Mesh).geometry)

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

async function loadAll(...names: string[]): Promise<Record<string, Terrain>> {
  let terrains: Record<string, Terrain> = {}
  await Promise.all(names.map(name => loadTerrain(name).then(x => { terrains[name] = x })))
  return terrains
}

async function load() {
  let [terrains, ocean, rivermouths] = await Promise.all([
    loadAll('base', 'irrigation', 'mountains', 'hills', 'forest', 'desert', 'arctic', 'tundra', 'grassland', 'plains', 'jungle', 'swamp', 'river'),
    loadOcean('ocean'),
    loadOcean('rivermouths')
  ])
  let baseTex = terrains.base.mat.map;
  let irrigationTex = terrains.irrigation.mat.map;

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
      let mesh
      if (col === 'ocean') {
        mesh = new THREE.Object3D()
        for (let k = 0; k < 4; k++) {
          let on = calcon(map, i, j, k)
          let data = on > 7 ? rivermouths : ocean
          let omesh = new THREE.Mesh(data.geom[on][k], new THREE.ShaderMaterial({
            vertexShader: terrainVertexShader,
            fragmentShader: terrainFragmentShader,
            uniforms: {
              baseTex: { value: baseTex },
              terrainTex: { value: data.mat.map },
              irrigationTex: { value: null },
              irrigation: { value: false }
            }
          }))
          mesh.add(omesh)
        }
      } else {
        let calc = col === 'river' ? calcr : calcn
        mesh = new THREE.Mesh(terrains[col].geom[calc(map, i, j)], new THREE.ShaderMaterial({
          vertexShader: terrainVertexShader,
          fragmentShader: terrainFragmentShader,
          uniforms: {
            baseTex: { value: baseTex },
            terrainTex: { value: terrains[col].mat.map },
            irrigationTex: { value: irrigationTex },
            irrigation: { value: Math.random() < 0.5 }
          }
        }))
      }
      mesh.position.set((cols/2)-j-0.5, 0, -i)
      scene.add(mesh)
    })
  })
}
load()

function animate() {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
}
animate()