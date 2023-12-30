import { Mesh, MeshPhongMaterial, Object3D } from 'three'
import Player from './player'
import { Point } from './world'
import ResourceManager from './resource_manager'
import { TextGeometry } from 'three/examples/jsm/Addons.js'
import { degToRad } from 'three/src/math/MathUtils.js'
import { position3d } from './helpers'

export default class City {
  player: Player
  position: Point
  name: string
  size: number = 1
  object: Object3D = new Object3D()
  population: number = 0

  constructor(player: Player, position: Point, name: string) {
    this.player = player
    this.position = position
    this.name = name
  }

  static spawn(player: Player, position: Point, name: string) {
    let city = new City(player, [...position], name)

    city.object.add(new Mesh(ResourceManager.citySlab.geom, new MeshPhongMaterial({ color: 'magenta' })))
    city.object.add(new Mesh(ResourceManager.cityGrid.geom, new MeshPhongMaterial({ color: '#822014' })))
    let text = new Mesh(
      new TextGeometry(city.size.toString(), { font: ResourceManager.font, size: 1, height: 0.1 }),
      new MeshPhongMaterial({ color: 'black' })
    )
    text.rotateX(degToRad(-90))
    text.geometry.computeBoundingBox()
    text.position.x += 0.5 - text.geometry.boundingBox!.max.x / 2
    text.position.y += 0.1
    text.position.z -= 0.5 - text.geometry.boundingBox!.max.y / 2
    city.object.add(text)
    city.object.position.set(...position3d(...city.position))
    player.world.get(...city.position).city = city
    player.game.scene.add(city.object)
    player.cities.push(city)

    return city
  }
}