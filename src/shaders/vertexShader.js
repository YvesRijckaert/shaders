const vertexShader = `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  // convert the rectangle from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  vec3 pos = vec3(1.0, -1.0, 0.0);
  gl_Position = vec4(clipSpace * pos.xy, pos.z, 1);

  // pass the vUv and position to the fragment shader
  // The GPU will interpolate this value between points.
  vUv = a_texCoord;
  vPosition = vec3(clipSpace * pos.xy, pos.z);
}
`;
export default vertexShader;
