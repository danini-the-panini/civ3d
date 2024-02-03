import Advance from "../Advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Factory extends BaseBuilding {
  static type = Building.Factory
  static production = 200
  static price = 800
  static sell = 200
  static maintenance = 4
  static requires = Advance.Industrialization
}