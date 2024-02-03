import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class GreatWall extends BaseWonder {
  static type = Wonder.GreatWall
  static requires = Advance.Masonry
  static production = 300
  static obsoleteBy = Advance.Gunpowder
}