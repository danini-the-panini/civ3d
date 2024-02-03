import Advance from "../Advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class CityWalls extends BaseBuilding {
  static type = Building.CityWalls
  static production = 120
  static price = 480
  static sell = 120
  static maintenance = 2
  static requires = Advance.Masonry
}