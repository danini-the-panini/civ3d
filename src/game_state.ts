import { PerspectiveCamera, Renderer, Scene } from "three";

export default abstract class GameState extends EventTarget {
  scene!: Scene
  camera!: PerspectiveCamera
  app: HTMLElement
  canvas: HTMLCanvasElement;
  private _viewport: HTMLElement;

  constructor(ui: HTMLElement, canvas: HTMLCanvasElement) {
    super()
    this.app = ui
    this.canvas = canvas
    this._viewport = document.getElementById('viewport')!
  }

  abstract init(): Promise<void>

  abstract onEnter(): void
  abstract onLeave(): void

  render(renderer: Renderer): void {
    renderer.render(this.scene, this.camera)
  }
  

  onWindowResize() {
    this.camera.aspect = this._viewport.clientWidth / this._viewport.clientHeight
    this.camera.updateProjectionMatrix()
  }
}