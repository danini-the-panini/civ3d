import { WebGLRenderer } from 'three'
import City from './city'
import Game from './game'

export default class CityScreen {
  element: HTMLDialogElement
  city: City
  mapRenderer: WebGLRenderer
  buildingsList: HTMLElement
  resources: HTMLElement
  foodStorage: HTMLElement
  changeButton: HTMLButtonElement
  buildRenderer: WebGLRenderer
  buildProgress: HTMLElement
  game: Game

  constructor(city: City, game: Game) {
    this.city = city
    this.game = game
    this.element = document.createElement('dialog')
    this.element.classList.add('city_screen')

    let nameElement = document.createElement('div')
    nameElement.classList.add('name', 'panel')
    let name = document.createElement('span')
    name.textContent = `${city.name} (POP: ${city.population})`
    nameElement.append(name)
    this.element.append(nameElement)

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

    let cityView = document.createElement('div')
    cityView.classList.add('city_view', 'panel')
    this.element.append(cityView)

    this.mapRenderer = new WebGLRenderer()
    this.mapRenderer.setSize(160, 160)
    cityView.appendChild(this.mapRenderer.domElement)

    this.buildingsList = document.createElement('div')
    this.buildingsList.classList.add('buildings_list', 'panel')
    this.element.append(this.buildingsList)

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
    
    let tabsPanel = document.createElement('div')
    tabsPanel.classList.add('info_tabs', 'panel')
    let tabs = document.createElement('div')
    tabs.classList.add('tabs')
    tabsPanel.append(tabs)
    let tabItems = ['info', 'happy', 'map', 'view']
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
    this.element.append(tabsPanel)

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
    this.buildRenderer = new WebGLRenderer()
    this.buildRenderer.setSize(32, 32)
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

    let exitButton = document.createElement('button')
    exitButton.classList.add('exit_button')
    exitButton.textContent = 'exit'
    exitButton.addEventListener('click', () => {
      this.destroy()
    })
    this.element.append(exitButton)

    this.game.app.append(this.element)
    this.element.showModal()
    this.game.cityScreen = this

    requestAnimationFrame(() => {
      this.mapRenderer.setSize(cityView.clientWidth, cityView.clientHeight)
    })
  }

  destroy() {
    this.element.remove()
    this.game.cityScreen = null
  }
}