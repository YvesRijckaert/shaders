const fragmentShader = `
precision mediump float;

uniform sampler2D u_image;
uniform float u_time;
uniform vec2 mouse;
varying vec3 vPosition;
varying vec2 vUv;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  
  float radius = 0.4;
  float progress = 0.15;  

  vec2 direction = normalize(vPosition.xy - vec2(mouse.xy));
  float dist = length(vPosition - vec3(mouse, 0.0));
  float prox = 1.0 - map(dist, 0.0, radius, 0.0, 1.0);

  prox = clamp(prox, 0.0, 1.0);

  vec2 texCoord = vec2(vUv.x, vUv.y);
  // texCoord.x += cos(texCoord.y + (u_time * 80.0)) / 70.0;
  // texCoord.y += cos(texCoord.x + (u_time * 80.0)) / 70.0;

  vec2 zoomedUv = texCoord + direction * prox * progress;
  vec2 zoomedUv1 = mix(texCoord, mouse.xy + vec2(0.5), prox * progress);
  vec4 textColor = texture2D(u_image, zoomedUv1);

  // gl_FragColor = vec4(prox, prox, prox, 1.0);
  // gl_FragColor = vec4(direction, 0.0, 1.0);
  gl_FragColor = textColor;
  
}
`;
export default fragmentShader;
