import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class SETIProgram extends BaseWonder {
  type = Wonder.SETIProgram
  requires = Advance.Computers
  production = 600
}