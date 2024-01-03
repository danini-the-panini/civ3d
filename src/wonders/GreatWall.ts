import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class GreatWall extends BaseWonder {
  type = Wonder.GreatWall
  requires = Advance.Masonry
  production = 300
  obsoleteBy = Advance.Gunpowder
}