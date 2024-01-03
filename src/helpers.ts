import { Vector3 } from "three"
import { Point, WIDTH } from "./World"

export type Class<T> = new (...args: any[]) => T

export function irand(i: number): number {
  return Math.floor(Math.random() * i)
}

export function position3d(x: number, y: number): [number, number, number] {
  return [(WIDTH/2)-x-0.5, 0, -y]
}

export function position2d(v: Vector3): Point {
  return [Math.ceil((WIDTH/2) - v.x - 0.5), Math.ceil(-v.z-1)]
}

export function capitalize(s: string) {
  return `${s[0].toUpperCase()}${s.substring(1)}`
}
