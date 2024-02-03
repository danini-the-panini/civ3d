import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class ManhattanProject extends BaseWonder {
  static type = Wonder.ManhattanProject
  static requires = Advance.NuclearFission
  static production = 600
}