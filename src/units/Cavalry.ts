import Advance from '../Advances'
import BaseLandUnit from './BaseLandUnit'
import { Unit } from './BaseUnit'

export default class Cavalry extends BaseLandUnit {
  static type = Unit.Cavalry
  static production = 20
  static price = 120
  static attack = 2
  static defense = 1
  static movement = 2
  static requires = Advance.HorsebackRiding
}