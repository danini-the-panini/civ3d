import Advance from "../advances";
import BaseSeaUnit from "./BaseSeaUnit";
import { Unit } from "./BaseUnit";

export default class Ironclad extends BaseSeaUnit {
  static type = Unit.Ironclad
  static production = 60
  static price = 600
  static attack = 4
  static defense = 4
  static movement = 4
  static requires = Advance.SteamEngine
}