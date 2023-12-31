import { Camera, Plane, Ray, Raycaster, Vector2, Vector3 } from 'three';
import { Point } from './World';
import { position3d } from './helpers';
import * as TweenHelper from './tween'
import { Easing, Tween } from 'three/examples/jsm/libs/tween.module.js';

const SPEED = 1.0
const ZOOM_FACTOR=0.1
const MIN_DIST = 2.0
const MAX_DIST = 20.0

function easeInOut(x: number, a: number = 2.0) {
  return (x**a)/(x**a + (1-x)**a)
}

export default class CameraControls {
  camera: Camera;
  domElement: HTMLElement;
  groundPlane: Plane;
  dragging: boolean = false

  private _camDirection: Vector3;
  private _camRight: Vector3;
  private _zoomDistance: number;
  private _ray: Ray;
  private _groundPoint: Vector3;
  private _mousePoint: Vector3;
  private _mousePoint2: Vector3;
  private _raycaster: Raycaster;
  private _mouse: Vector2;
  
  constructor(camera: Camera, domElement: HTMLElement = document.body, events = true) {
    this.camera = camera
    this.domElement = domElement
    this.groundPlane = new Plane(new Vector3(0, 1, 0), 0)

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleWheel = this.handleWheel.bind(this)
    this.handleContextMenu = this.handleContextMenu.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    if (events) {
      this.domElement.addEventListener('keydown', this.handleKeyDown, false)
      this.domElement.addEventListener('wheel', this.handleWheel, false)
      this.domElement.addEventListener('contextmenu', this.handleContextMenu, false)
      window.addEventListener('mousedown', this.handleMouseDown, false)
      window.addEventListener('mouseup', this.handleMouseUp, false)
      window.addEventListener('mousemove', this.handleMouseMove, false)
      // this.domElement.addEventListener('mouseleave', this.handleMouseUp, false)
    }
    
    this._camDirection = new Vector3()
    this._camRight = new Vector3()
    this._ray = new Ray()
    this._groundPoint = new Vector3()
    this._mousePoint = new Vector3()
    this._mousePoint2 = new Vector3()
    this._raycaster = new Raycaster()
    this._mouse = new Vector2()

    this._zoomDistance = 0.5
    this._updateCameraPosition()
  }

  set zoomDistance(v: number) {
    if (v < 0.0) v = 0.0
    if (v > 1.0) v = 1.0
    this._zoomDistance = v
    this._updateCameraPosition()
  }

  get zoomDistance(): number {
    return this._zoomDistance
  }

  destroy() {
    this.domElement.removeEventListener('keydown', this.handleKeyDown, false)
    this.domElement.removeEventListener('wheel', this.handleWheel, false)
    this.domElement.removeEventListener('contextmenu', this.handleContextMenu, false)
    window.removeEventListener('mousedown', this.handleMouseDown, false)
    window.removeEventListener('mouseup', this.handleMouseUp, false)
    window.removeEventListener('mousedown', this.handleMouseMove, false)
    // this.domElement.removeEventListener('mouseleave', this.handleMouseUp, false)
  }

  goTo([x, y]: Point, zoom: number = this.zoomDistance) {
    this.camera.getWorldDirection(this._camDirection)
    this._groundPoint.set(...position3d(x, y))
    this._groundPoint.x += 0.5
    this._groundPoint.z -= 0.5
    this._zoomDistance = zoom
    this._updateCameraPositionFromGroundPoint()
  }

  flyTo([x, y]: Point, zoom: number = this.zoomDistance) {
    this.camera.getWorldDirection(this._camDirection)

    this._getCurrentGroundPosition()
    let coords = { x: this._groundPoint.x, y: this._groundPoint.z, zoom: this._zoomDistance }
    this._groundPoint.set(...position3d(x, y))
    let tween = new Tween(coords, false)
      .to({ x: this._groundPoint.x + 0.5, y: this._groundPoint.z - 0.5, zoom }, 250)
      .easing(Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.camera.getWorldDirection(this._camDirection)
        this._groundPoint.x = coords.x
        this._groundPoint.z = coords.y
        this._zoomDistance = coords.zoom
        this._updateCameraPositionFromGroundPoint()
      })
      .onComplete(() => {
        TweenHelper.removeTween(tween)
      })
      .start()
    TweenHelper.addTween(tween)
  }

  getMousePointOnMap(event: MouseEvent, v: Vector3 = new Vector3()) {
    let { x, y } = this.domElement.getBoundingClientRect()
    let cx = event.clientX - x
    let cy = event.clientY - y
    this._mouse.set((cx / this.domElement.clientWidth) * 2 - 1, -(cy / this.domElement.clientHeight) * 2 + 1)
    this._raycaster.setFromCamera(this._mouse, this.camera)
    this._raycaster.ray.intersectPlane(this.groundPlane, v)
    return v
  }

  handleKeyDown(event: KeyboardEvent) {
    this.camera.getWorldDirection(this._camDirection)
    this._camRight.copy(this._camDirection).cross(this.camera.up)
    this._camDirection.y = 0.0
    this._camDirection.normalize().multiplyScalar(SPEED)
    this._camRight.y = 0.0
    this._camRight.normalize().multiplyScalar(SPEED)
    switch (event.key) {
      case 'ArrowUp':
        this.camera.position.add(this._camDirection)
        break
      case 'ArrowDown':
        this.camera.position.add(this._camDirection.negate())
        break
      case 'ArrowLeft':
        this.camera.position.add(this._camRight.negate())
        break
      case 'ArrowRight':
        this.camera.position.add(this._camRight)
        break
    }
  }
  
  handleWheel(event: WheelEvent) {
    let delta = (event.deltaY / 102) * ZOOM_FACTOR
    this.zoomDistance += delta
  }

  handleContextMenu(event: MouseEvent) {
    event.preventDefault()
  }

  handleMouseDown(event: MouseEvent) {
    if (event.target === this.domElement && event.button === 0) {
      this.dragging = true
      this.getMousePointOnMap(event, this._mousePoint)
    }
  }

  handleMouseUp(event: MouseEvent) {
    if (event.button === 0) {
      this.dragging = false
    }
  }

  handleMouseMove(event: MouseEvent) {
    if (this.dragging) {
      this.getMousePointOnMap(event, this._mousePoint2)
      this._groundPoint.copy(this._mousePoint).sub(this._mousePoint2)
      this.camera.position.add(this._groundPoint)
    }
  }

  _getCurrentGroundPosition(groundPoint = this._groundPoint, camDirection = this._camDirection) {
    this.camera.getWorldDirection(camDirection)
    this._ray.origin.copy(this.camera.position)
    this._ray.direction.copy(camDirection.normalize())
    this._ray.intersectPlane(this.groundPlane, groundPoint)
    return groundPoint
  }

  _updateCameraPosition(groundPoint = this._groundPoint, camDirection = this._camDirection) {
    this._getCurrentGroundPosition(groundPoint, camDirection)
    this._updateCameraPositionFromGroundPoint()
  }

  _updateCameraPositionFromGroundPoint(groundPoint = this._groundPoint, camDirection = this._camDirection) {
    this._ray.origin.copy(groundPoint)
    this._ray.direction.copy(camDirection.negate())
    let newDistance = MIN_DIST + (MAX_DIST-MIN_DIST)*(easeInOut(this._zoomDistance))
    this._ray.at(newDistance, this.camera.position)
  }
}