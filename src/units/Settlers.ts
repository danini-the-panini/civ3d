import BaseLandUnit from './BaseLandUnit'
import { Unit } from './BaseUnit'

export default class Settlers extends BaseLandUnit {
  static type = Unit.Settlers
  static production = 40
  static price = 320
  static attack = 0
  static defense = 1
}