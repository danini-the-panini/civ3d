import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class ShakespearesTheatre extends BaseWonder {
  static type = Wonder.ShakespearesTheatre
  static requires = Advance.Medicine
  static production = 400
  static obsoleteBy = Advance.Electronics
}