import { PerspectiveCamera, Renderer, Scene } from "three";

export default abstract class GameState extends EventTarget {
  scene!: Scene
  camera!: PerspectiveCamera
  app: HTMLElement
  canvas: HTMLCanvasElement;

  constructor(ui: HTMLElement, canvas: HTMLCanvasElement) {
    super()
    this.app = ui
    this.canvas = canvas
  }

  abstract init(): Promise<void>

  abstract onEnter(): void
  abstract onLeave(): void

  render(renderer: Renderer): void {
    renderer.render(this.scene, this.camera)
  }
  

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}