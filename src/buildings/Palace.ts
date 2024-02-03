import Advance from "../Advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Palace extends BaseBuilding {
  static type = Building.Palace
  static production = 200
  static price = 800
  static sell = 200
  static maintenance = 0
  static requires = Advance.Masonry
}