import { BufferGeometry, Mesh, MeshStandardMaterial } from "three"
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js"

export type Thing = { mat: MeshStandardMaterial, geom: BufferGeometry }

const loader = new GLTFLoader()

export async function loadModel(path: string): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, (error) => {
      console.error(`Error loading ${path}`)
      reject(error)
    })
  })
}

export async function loadThing(path: string): Promise<Thing> {
  let gltf = await loadModel(path)
  let mat = (gltf.scene.children[0] as Mesh).material as MeshStandardMaterial
  let geom = (gltf.scene.children[0] as Mesh).geometry

  return { mat, geom }
}