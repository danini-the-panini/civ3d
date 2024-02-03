import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class Lighthouse extends BaseWonder {
  static type = Wonder.Lighthouse
  static requires = Advance.MapMaking
  static production = 200
  static obsoleteBy = Advance.Magnetism
}