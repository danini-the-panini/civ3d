import Advance from "../Advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class ApolloProgram extends BaseWonder {
  static type = Wonder.ApolloProgram
  static requires = Advance.SpaceFlight
  static production = 600
}