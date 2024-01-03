import Advance from "../advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Aqueduct extends BaseBuilding {
  static type = Building.Aqueduct
  static production = 120
  static price = 480
  static sell = 120
  static maintenance = 2
  static requires = Advance.Construction
}