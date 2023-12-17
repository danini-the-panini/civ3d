import './style.css'
import * as THREE from 'three'
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js'

const DIRS=[[1,0],[0,-1],[-1,0],[0,1]]

function getnum(str: string): number {
  return parseInt(str.match(/\d+/)![0], 10)
}


function calcn(map: string[][], i: number, j: number) {
  let m = map[i][j]
  let c = 0
  DIRS.forEach(([di,dj], n) => {
    let i2 = i+di
    let j2 = j+dj
    if (i2 >= 0 && i2 < map.length && j2 >= 0 && j2 < map[0].length && map[i2][j2]===m) {
      c += 2**n
    }
  })
  return c
}

const app = document.getElementById('app')!

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.setY(10)
camera.rotateX(-45)

const renderer = new THREE.WebGLRenderer()
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

async function load() {
  let [hillsModel, mountainsModel] = await Promise.all([
    loadModel('terrain/hills.glb'),
    loadModel('terrain/mountains.glb')
  ])

  let hillsMat = (hillsModel.scene.children[0] as THREE.Mesh).material
  let mountainsMat = (mountainsModel.scene.children[0] as THREE.Mesh).material

  let hills = [...hillsModel.scene.children].sort((a, b) => getnum(a.name) - getnum(b.name)).map(x => (x as THREE.Mesh).geometry)
  let mountains = [...mountainsModel.scene.children].sort((a, b) => getnum(a.name) - getnum(b.name)).map(x => (x as THREE.Mesh).geometry)

  let rows = 10
  let cols = 20

  let map: string[][] = []
  for (let i = 0; i < rows; i++) {
    let row = []
    for (let j = 0; j < cols; j++) {
      row.push(Math.random() > 0.5 ? 'mountains' : 'hills')
    }
    map.push(row)
  }
  map.forEach((row, i) => {
    row.forEach((col, j) => {
      let mesh
      if (col === 'hills') {
        mesh = new THREE.Mesh(hills[calcn(map, i, j)], hillsMat)
      } else {
        mesh = new THREE.Mesh(mountains[calcn(map, i, j)], mountainsMat)
      }
      mesh.position.set((cols/2)-j, 0, -i)
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