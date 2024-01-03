import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Colosseum extends BaseBuilding {
  static type = Building.Colosseum
  static production = 100
  static price = 400
  static sell = 100
  static maintenance = 4
  static requires = Advance.Construction
}