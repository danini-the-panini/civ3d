import Advance from "../advances";
import BaseLandUnit from "./BaseLandUnit";
import { Unit } from "./BaseUnit";

export default class Musketeers extends BaseLandUnit {
  static type = Unit.Musketeers
  static production = 30
  static price = 210
  static attack = 2
  static defense = 3
  static movement = 1
  static requires = Advance.Gunpowder
}