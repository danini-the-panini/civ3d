import { PerspectiveCamera, PointLight, Scene } from 'three'
import { loadModel } from './gltf_helpers'
import GameState from './game_state'

function rad(degrees: number): number {
  return degrees * (Math.PI/180.0)
}

export default class MainMenu extends GameState {
  menu!: HTMLDivElement

  constructor(ui: HTMLElement, canvas: HTMLCanvasElement) {
    super(ui, canvas)
    this.scene = new Scene()
    let light = new PointLight(0xFFFFFF, 1000.0)
    light.position.set(5.0, 6.0, 10.0)
    this.scene.add(light)

    this.camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight)
    this.camera.position.set(9.5, 20.0, 20.0)
    this.camera.rotateX(rad(-45))
    this.scene.add(this.camera)
  }

  async init() {
    let logo = await loadModel('ui/logo.glb');
    [...logo.scene.children].forEach(object => {
      logo.scene.remove(object)
      this.scene.add(object)
    })
  }

  onEnter() {
    this.menu = document.createElement('div')
    this.menu.classList.add('menu')
    let options = [
      { text: 'Start a New Game', event: 'new_game' },
      { text: 'Load a Saved Game', event: 'load_game' },
      { text: 'EARTH', event: 'earth' },
      { text: 'Customize World', event: 'customize_world' },
      { text: 'View Hall of Fame', event: 'hall_of_fame' }
    ]
    options.forEach(({ text, event }) => {
      let button = document.createElement('button')
      button.textContent = text
      button.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent(event))
      })
      this.menu.append(button)
    })
    this.app.append(this.menu)
    this.app.classList.add('main_menu')
  }

  onLeave() {
    this.menu.remove()
    this.app.classList.remove('main_menu')
  }
}