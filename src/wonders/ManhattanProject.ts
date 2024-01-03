import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class ManhattanProject extends BaseWonder {
  type = Wonder.ManhattanProject
  requires = Advance.NuclearFission
  production = 600
}