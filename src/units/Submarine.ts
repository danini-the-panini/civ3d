import Advance from "../advances";
import BaseSeaUnit from "./BaseSeaUnit";
import { Unit } from "./BaseUnit";

export default class Submarine extends BaseSeaUnit {
  static type = Unit.Submarine
  static production = 50
  static price = 450
  static attack = 8
  static defense = 2
  static movement = 3
  static los = 2
  static requires = Advance.MassProduction
}