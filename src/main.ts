import './style.css'

import { WebGLRenderer } from 'three'
import GameState from './game_state'
import MainMenu from './main_menu'
import Game from './game'
import * as TweenHelper from './tween'

const app = document.getElementById('app')!
const viewport = document.getElementById('viewport')!

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
viewport.appendChild(renderer.domElement)

let mainMenu = new MainMenu(app, renderer.domElement)
mainMenu.init()

let currentState: GameState = mainMenu
mainMenu.onEnter()

mainMenu.addEventListener('new_game', async () => {
  mainMenu.onLeave()
  currentState = new Game(app, renderer.domElement)
  await currentState.init()
  currentState.onEnter()
  onWindowResize()
})

function onWindowResize(){
  currentState.onWindowResize()
  renderer.setSize(viewport.clientWidth, viewport.clientHeight)
}
window.addEventListener('resize', onWindowResize, false)

function animate(time: number) {
	requestAnimationFrame(animate)
  TweenHelper.update(time)
	currentState.render(renderer)
}
requestAnimationFrame(animate)