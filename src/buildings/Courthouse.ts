import Advance from "../Advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class Courthouse extends BaseBuilding {
  static type = Building.Courthouse
  static production = 80
  static price = 320
  static sell = 80
  static maintenance = 1
  static requires = Advance.CodeOfLaws
}