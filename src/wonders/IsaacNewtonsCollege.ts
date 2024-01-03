import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class IsaacNewtonsCollege extends BaseWonder {
  type = Wonder.IsaacNewtonsCollege
  requires = Advance.TheoryOfGravity
  production = 400
  obsoleteBy = Advance.NuclearFission
}