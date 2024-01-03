import Advance from "../advances";
import BaseSeaUnit from "./BaseSeaUnit";
import { Unit } from "./BaseUnit";

export default class Transport extends BaseSeaUnit {
  static type = Unit.Transport
  static production = 50
  static price = 450
  static attack = 0
  static defense = 3
  static movement = 4
  static capacity = 8
  static requires = Advance.Industrialization
}