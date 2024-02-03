import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class Pyramids extends BaseWonder {
  static type = Wonder.Pyramids
  static requires = Advance.Masonry
  static production = 300
  static obsoleteBy = Advance.Communism
}