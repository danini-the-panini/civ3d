import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class ShakespearesTheatre extends BaseWonder {
  type = Wonder.ShakespearesTheatre
  requires = Advance.Medicine
  production = 400
  obsoleteBy = Advance.Electronics
}