import { AmbientLight, DirectionalLight, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import City from './City'
import Game from './Game'
import { BFC, HEIGHT } from './World'
import CameraControls from './CameraControls'
import { calcf } from './calc_helpers'
import { degToRad } from 'three/src/math/MathUtils.js'
import { position3d } from './helpers'

export default class CityScreen {
  element: HTMLDialogElement
  city: City
  buildingList!: HTMLElement
  resources!: HTMLElement
  foodStorage!: HTMLElement
  changeButton!: HTMLButtonElement
  game: Game
  mapView!: HTMLElement
  mapRenderer!: WebGLRenderer
  mapScene!: Scene
  mapCamera!: PerspectiveCamera
  buildRenderer!: WebGLRenderer
  buildProgress!: HTMLElement
  buildScene!: Scene
  buildCamera!: PerspectiveCamera
  buildObject: Object3D = new Object3D()
  private _lastTime: number = 0

  constructor(city: City, game: Game) {
    this.city = city
    this.game = game
    this.element = document.createElement('dialog')
    this.element.classList.add('city_screen')

    this.createNamePanel()
    this.createResourcesPanel()
    this.createCityView()
    this.createBuildingsPanel()
    this.createFoodPanel()
    this.createTabsPanel()
    this.createBuildPanel()
    this.createExitButton()

    this.game.app.append(this.element)
    this.element.showModal()
    this.game.cityScreen = this

    requestAnimationFrame(() => {
      this.mapRenderer.setSize(this.mapView.clientWidth, this.mapView.clientHeight)
      this.mapRenderer.render(this.mapScene, this.mapCamera)
    })

    this.render = this.render.bind(this)
    requestAnimationFrame(this.render)
  }

  private createExitButton() {
    let exitButton = document.createElement('button')
    exitButton.classList.add('exit_button')
    exitButton.textContent = 'exit'
    exitButton.addEventListener('click', () => {
      this.destroy()
    })
    this.element.append(exitButton)
  }

  private createBuildPanel() {
    let buildPanel = document.createElement('div')
    buildPanel.classList.add('build_panel', 'panel')
    let buildPanelHeader = document.createElement('div')
    buildPanelHeader.classList.add('panel_header')
    buildPanel.append(buildPanelHeader)
    this.changeButton = document.createElement('button')
    this.changeButton.classList.add('button')
    this.changeButton.textContent = 'change'
    buildPanelHeader.append(this.changeButton)
    let buildPanelItemView = document.createElement('div')
    this.buildRenderer = new WebGLRenderer({ alpha: true })
    this.buildRenderer.setSize(32, 32)
    this.buildRenderer.setClearColor(0xffffff, 0)
    buildPanelItemView.appendChild(this.buildRenderer.domElement)
    buildPanelHeader.append(buildPanelItemView)
    let buyButton = document.createElement('button')
    buyButton.classList.add('button')
    buyButton.textContent = 'buy'
    buildPanelHeader.append(buyButton)
    this.buildProgress = document.createElement('div')
    this.buildProgress.classList.add('build_progress')
    buildPanel.append(this.buildProgress)
    this.element.append(buildPanel)

    this.buildScene = new Scene()

    this.buildCamera = new PerspectiveCamera(75, 1.0, 0.1, 1000)
    this.buildCamera.rotateX(degToRad(-30))
    this.buildCamera.position.set(0.0, 0.8, 0.7)
    this.buildScene.add(this.buildCamera)

    const buildLight = new AmbientLight(0xaaaaaa)
    this.buildScene.add(buildLight)

    const buildDirLight = new DirectionalLight(0xFFFFFF, 2)
    buildDirLight.position.set(-1, 2, 1)
    this.buildScene.add(buildDirLight)

    let object = this.city.currentProduction.createObject()
    this.buildObject.add(object)
    object.position.set(-0.5, 0, 0.5)
    // this.buildObject.position.set(0.5, 0, 0.5)
    this.buildScene.add(this.buildObject)
  }

  private createTabsPanel() {
    let tabsPanel = document.createElement('div')
    tabsPanel.classList.add('info_tabs', 'panel')
    let tabs = document.createElement('div')
    tabs.classList.add('tabs')
    tabsPanel.append(tabs)
    let tabItems = ['info', 'happy', 'map']
    tabItems.forEach((item, i) => {
      let button = document.createElement('button')
      button.classList.add('tab_button')
      button.textContent = item
      tabs.append(button)

      let tabBody = document.createElement('div')
      tabBody.classList.add('tab_body')
      if (i === 0) {
        button.classList.add('selected')
        tabBody.classList.add('selected')
      }
      tabBody.textContent = `TODO: ${item}`
      tabsPanel.append(tabBody)

      button.addEventListener('click', () => {
        for (let b of tabs.querySelectorAll('.tab_button')) {
          b.classList.remove('selected')
        }
        for (let b of tabsPanel.querySelectorAll('.tab_body')) {
          b.classList.remove('selected')
        }
        button.classList.add('selected')
        tabBody.classList.add('selected')
      })
    })
    let button = document.createElement('button')
    button.classList.add('button')
    button.textContent = 'view'
    tabs.append(button)
    this.element.append(tabsPanel)
  }

  private createFoodPanel() {
    let foodStoragePanel = document.createElement('div')
    foodStoragePanel.classList.add('food_storage', 'panel')
    let foodStorageHeader = document.createElement('div')
    foodStorageHeader.classList.add('panel_header')
    foodStorageHeader.innerHTML = '<h3>Food storage</h3>'
    foodStoragePanel.append(foodStorageHeader)
    this.foodStorage = document.createElement('div')
    this.foodStorage.classList.add('food_storage')
    foodStoragePanel.append(this.foodStorage)
    this.element.append(foodStoragePanel)
  }

  private createBuildingsPanel() {
    let buildingPanel = document.createElement('div')
    buildingPanel.classList.add('buildings_list', 'panel')
    this.buildingList = document.createElement('ul')
    this.city.wonders.forEach(wonder => {
      let buildingEl = document.createElement('li')
      buildingEl.textContent = wonder.type
      this.buildingList.append(buildingEl)
    })
    this.city.buildings.forEach(building => {
      let buildingEl = document.createElement('li')
      buildingEl.textContent = building.type
      this.buildingList.append(buildingEl)
    })
    buildingPanel.append(this.buildingList)
    this.element.append(buildingPanel)
  }

  private createCityView() {
    this.mapView = document.createElement('div')
    this.mapView.classList.add('city_view', 'panel', 'panel--no-color')
    this.element.append(this.mapView)

    this.mapRenderer = new WebGLRenderer()
    this.mapRenderer.setSize(160, 160)
    this.mapView.appendChild(this.mapRenderer.domElement)
    this.mapScene = new Scene()

    this.mapCamera = new PerspectiveCamera(75, 1.0, 0.1, 1000)
    this.mapCamera.rotateX(degToRad(-80))
    this.mapScene.add(this.mapCamera)

    const light = new AmbientLight(0xaaaaaa)
    this.mapScene.add(light)

    const dirLight = new DirectionalLight(0xFFFFFF, 2)
    dirLight.position.set(-1, 2, 1)
    this.mapScene.add(dirLight)

    let observer = new ResizeObserver(() => {
      this.mapCamera.aspect = this.mapView.clientWidth / this.mapView.clientHeight
      this.mapRenderer.setSize(this.mapView.clientWidth, this.mapView.clientHeight)
      this.mapRenderer.render(this.mapScene, this.mapCamera)
    })
    observer.observe(this.mapView)

    let cameraControls = new CameraControls(this.mapCamera, this.mapRenderer.domElement, false)

    BFC.forEach(([dx, dy]) => {
      let x = this.city.position[0] + dx
      let y = this.city.position[1] + dy

      if (y < 0 || y >= HEIGHT) return

      let tile = this.world.get(x, y)
      if (this.player.visible[y][x]) {
        let [tileObject, tileMeshes] = tile.createObject(false)
        tileMeshes.forEach(mesh => {
          mesh.material.uniforms.fog.value = calcf(this.world, tile.position, this.player.visible)
        })
        this.mapScene.add(tileObject)
      }
    })

    let cityObject = City.createObject(this.city.size)
    cityObject.position.set(...position3d(...this.city.position))
    this.mapScene.add(cityObject)

    cameraControls.goTo(this.city.position, 0.25)
  }

  private createResourcesPanel() {
    let resourcesPanel = document.createElement('div')
    resourcesPanel.classList.add('resources_panel', 'panel')
    let resourcesHeader = document.createElement('div')
    resourcesHeader.classList.add('panel_header')
    resourcesHeader.innerHTML = '<h3>City resources</h3>'
    resourcesPanel.append(resourcesHeader)
    this.resources = document.createElement('div')
    this.resources.classList.add('resources')
    resourcesPanel.append(this.resources)
    this.element.append(resourcesPanel)
    let unitsPanel = document.createElement('div')
    unitsPanel.classList.add('units_panel', 'panel')
    this.element.append(unitsPanel)
  }

  private createNamePanel() {
    let nameElement = document.createElement('div')
    nameElement.classList.add('name', 'panel')
    let name = document.createElement('span')
    name.textContent = `${this.city.name} (POP: ${this.city.population})`
    nameElement.append(name)
    this.element.append(nameElement)
  }

  get world() {
    return this.game.world
  }

  get player() {
    return this.city.player
  }

  render(time: number) {
    let delta = time - this._lastTime
    this._lastTime = time
    requestAnimationFrame(this.render)
    this.buildObject.rotateY(degToRad(delta * 0.1))
    this.buildRenderer.render(this.buildScene, this.buildCamera)
  }

  destroy() {
    this.element.remove()
    this.game.cityScreen = null
  }
}