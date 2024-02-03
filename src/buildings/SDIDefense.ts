import Advance from "../Advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class SDIDefense extends BaseBuilding {
  static type = Building.SDIDefense
  static production = 200
  static price = 800
  static sell = 200
  static maintenance = 4
  static requires = Advance.Superconductor
}