import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class SETIProgram extends BaseWonder {
  static type = Wonder.SETIProgram
  static requires = Advance.Computers
  static production = 600
}