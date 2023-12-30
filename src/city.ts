import { Object3D } from "three"
import Player from "./player"
import { Point } from "./world"

export default class City {
  player: Player
  position: Point
  name: string
  size: number = 1
  object: Object3D = new Object3D()

  constructor(player: Player, position: Point, name: string) {
    this.player = player
    this.position = position
    this.name = name
  }
}