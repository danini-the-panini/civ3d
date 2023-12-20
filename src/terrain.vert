varying vec2 vUv;
varying vec2 vUv2;

void main() {
  vUv = uv;
  vUv2 = vec2(position.x, -position.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}