import './style.css'

import { WebGLRenderer } from 'three'
import GameState from './game_state'
import MainMenu from './main_menu'
import Game from './game'

const app = document.getElementById('app')!
const viewport = document.getElementById('viewport')!

let mainMenu = new MainMenu(app)
mainMenu.init()

let currentState: GameState = mainMenu
mainMenu.onEnter()

mainMenu.addEventListener('new_game', () => {
  mainMenu.onLeave()
  currentState = new Game(app)
  currentState.onEnter()
  currentState.init()
  onWindowResize()
})

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
viewport.appendChild(renderer.domElement)

function onWindowResize(){
  currentState.onWindowResize()
  renderer.setSize(viewport.clientWidth, viewport.clientHeight)
}
window.addEventListener('resize', onWindowResize, false)

function animate() {
	requestAnimationFrame(animate)
	currentState.render(renderer)
}
animate()