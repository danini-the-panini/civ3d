import Advance from "../advances";
import BaseWonder, { Wonder } from "./BaseWonder";

export default class ApolloProgram extends BaseWonder {
  type = Wonder.ApolloProgram
  requires = Advance.SpaceFlight
  production = 600
}