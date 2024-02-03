import Advance from "../Advances";
import BaseBuilding, { Building } from "./BaseBuilding";

export default class MassTransit extends BaseBuilding {
  static type = Building.MassTransit
  static production = 160
  static price = 640
  static sell = 160
  static maintenance = 4
  static requires = Advance.MassProduction
}