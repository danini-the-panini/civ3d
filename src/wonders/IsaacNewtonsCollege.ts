import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class IsaacNewtonsCollege extends BaseWonder {
  static type = Wonder.IsaacNewtonsCollege
  static requires = Advance.TheoryOfGravity
  static production = 400
  static obsoleteBy = Advance.NuclearFission
}