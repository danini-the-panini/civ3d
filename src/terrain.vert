uniform sampler2D roadTex;
uniform sampler2D railroadTex;

varying vec2 vUv;
varying vec2 vUv2;

uniform int roadTile;
uniform int railroadTile;

void main() {
  vUv = uv;
  vUv2 = vec2(position.x, -position.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}