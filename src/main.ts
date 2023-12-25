import './style.css'

import { WebGLRenderer } from 'three'
import GameState from './game_state'
import MainMenu from './main_menu'
import Game from './game'

const app = document.getElementById('app')!
const viewport = document.getElementById('viewport')!

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
viewport.appendChild(renderer.domElement)

let mainMenu = new MainMenu(app, renderer.domElement)
mainMenu.init()

let currentState: GameState = mainMenu
mainMenu.onEnter()

mainMenu.addEventListener('new_game', () => {
  mainMenu.onLeave()
  currentState = new Game(app, renderer.domElement)
  currentState.onEnter()
  currentState.init()
  onWindowResize()
})

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