import Advance from "../advances";
import BaseSeaUnit from "./BaseSeaUnit";
import { Unit } from "./BaseUnit";

export default class Battleship extends BaseSeaUnit {
  static type = Unit.Battleship
  static production = 160
  static price = 3200
  static attack = 18
  static defense = 12
  static movement = 4
  static los = 2
  static requires = Advance.Steel
}