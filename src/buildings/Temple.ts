import Advance from "../Advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Temple extends BaseBuilding {
  static type = Building.Temple
  static production = 40
  static price = 160
  static sell = 40
  static maintenance = 1
  static requires = Advance.CeremonialBurial
}