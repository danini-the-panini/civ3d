import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class HangingGardens extends BaseWonder {
  static type = Wonder.HangingGardens
  static requires = Advance.Pottery
  static production = 300
  static obsoleteBy = Advance.Invention
}