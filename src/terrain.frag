uniform sampler2D baseTex;
uniform sampler2D irrigationTex;
uniform sampler2D pollutionTex;
uniform sampler2D fortressTex;
uniform sampler2D terrainTex;
uniform sampler2D roadTex;
uniform sampler2D railroadTex;
uniform sampler2D fogTex;

uniform bool irrigation;
uniform bool pollution;
uniform bool fortress;
uniform bool unitVisible;

varying vec2 vUv;
varying vec2 vUv2;

uniform int road;
uniform int railroad;
uniform int fog;

const vec2[] wangmap = vec2[16](
  vec2(0.0,  0.0),  //  0 (0,0)
  vec2(0.25, 0.0),  //  1 (1,0)
  vec2(0.5,  0.0),  //  2 (2,0)
  vec2(0.0,  0.25), //  3 (0,1)
  vec2(0.0,  0.75), //  4 (0,3)
  vec2(0.0,  0.5),  //  5 (0,2)
  vec2(0.25, 0.75), //  6 (1,3)
  vec2(0.25, 0.5),  //  7 (1,2)
  vec2(0.75, 0.75), //  8 (3,3)
  vec2(0.75, 0.0),  //  9 (3,0)
  vec2(0.5,  0.75), // 10 (2,3)
  vec2(0.5,  0.25), // 11 (2,1)
  vec2(0.75, 0.5),  // 12 (3,2)
  vec2(0.75, 0.25), // 13 (3,1)
  vec2(0.5,  0.5),  // 14 (2,2)
  vec2(0.25, 0.25)  // 15 (1,1)
);

vec4 combine_alpha(vec4 a, vec4 b, float alpha) {
  float alpha2 = b.a * alpha;
  return vec4(a.rgb * (1.0 - alpha2) + b.rgb * alpha2, 1.0);
}

vec4 combine(vec4 a, vec4 b) {
  return combine_alpha(a, b, 1.0);
}

vec2 roadUv(vec2 uv, int k) {
  return (uv + vec2(float(k%3), float(k/3))) / 3.0;
}

vec4 roadTexture2D(sampler2D tex, vec2 uv, int k) {
  return texture2D(tex, roadUv(uv, k));
}

bool isUvInSlab(vec2 uv) {
  return uv.x > 0.2 && uv.y > 0.2 && uv.x < 0.8 && uv.y < 0.8;
}

void main() {
  if (unitVisible && isUvInSlab(vUv2)) {
    discard;
  }

  vec4 col = texture2D(baseTex, vUv2);
  if (irrigation) {
    col = combine(col, texture2D(irrigationTex, vUv2));
  }
  col = combine(col, texture2D(terrainTex, vUv));
  if (road == (1<<4)) {
    col = combine(col, roadTexture2D(roadTex, vUv2, 4));
  } else if (railroad == (1<<4)) {
    col = combine(col, roadTexture2D(railroadTex, vUv2, 4));
  }
  for (int k = 0; k < 9; k++) {
    int r = 1<<k;
    if (k != 4) {
      if ((railroad & r) > 0) {
        col = combine(col, roadTexture2D(railroadTex, vUv2, k));
      } else if ((road & r) > 0) {
        col = combine(col, roadTexture2D(roadTex, vUv2, k));
      }
    }
  }
  if (pollution) {
    col = combine_alpha(col, texture2D(pollutionTex, vUv2), 0.6);
  }
  if (fortress) {
    col = combine_alpha(col, texture2D(fortressTex, vUv2), 0.6);
  }
  vec2 fuv = vUv2/4.0+wangmap[fog];
  fuv = vec2(fuv.x, 1.0-fuv.y);
  col = combine(col, texture2D(fogTex, fuv));

  gl_FragColor = col;
}