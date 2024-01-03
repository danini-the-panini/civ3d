import BaseUnit, { MovementType } from "./BaseUnit";

export default abstract class BaseSeaUnit extends BaseUnit {
  static movementType = MovementType.Sea
}