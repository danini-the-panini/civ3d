import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class DarwinsVoyage extends BaseWonder {
  type = Wonder.DarwinsVoyage
  requires = Advance.RailRoad
  production = 300
}