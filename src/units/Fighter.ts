import Advance from "../advances";
import BaseAirUnit from "./BaseAirUnit";
import { Unit } from "./BaseUnit";

export default class Fighter extends BaseAirUnit {
  static type = Unit.Fighter
  static production = 60
  static price = 600
  static attack = 4
  static defense = 2
  static movement = 10
  static requires = Advance.Flight
}