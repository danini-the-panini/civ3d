import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class DarwinsVoyage extends BaseWonder {
  static type = Wonder.DarwinsVoyage
  static requires = Advance.RailRoad
  static production = 300
}