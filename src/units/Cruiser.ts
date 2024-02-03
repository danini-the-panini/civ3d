import Advance from "../Advances";
import BaseSeaUnit from "./BaseSeaUnit";
import { Unit } from "./BaseUnit";

export default class Cruiser extends BaseSeaUnit {
  static type = Unit.Cruiser
  static production = 80
  static price = 960
  static attack = 6
  static defense = 6
  static movement = 6
  static los = 2
  static requires = Advance.Combustion
}