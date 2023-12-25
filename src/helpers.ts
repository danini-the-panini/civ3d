import { WIDTH } from "./world"

export function irand(i: number): number {
  return Math.floor(Math.random() * i)
}

export function position3d(x: number, y: number): [number, number, number] {
  return [(WIDTH/2)-x-0.5, 0, -y]
}