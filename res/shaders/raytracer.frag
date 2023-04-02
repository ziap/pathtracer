#version 300 es

#ifdef GL_ES
precision highp float;
#endif

#define FOV 45.0

uniform vec2 u_resolution;
uniform vec2 u_angle;
uniform float u_time;

out vec4 frag_color;

// 3D extension of the ray direction calculation I made for the raycasting project
vec3 get_ray_direction() {
  vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;

  vec2 plane;
  
  // TODO: Make plane size a uniform and only update when resize (or change FOV)
  plane.x = tan(radians(FOV * 0.5)) * 2.0;
  plane.y = plane.x * u_resolution.x / u_resolution.y;

  // I refuse to do matrix multiplication
  vec2 tan_dir = uv * plane;
  vec2 cos_dir = 1.0 / sqrt(tan_dir * tan_dir + 1.0);
  vec2 sin_dir = tan_dir * cos_dir;

  vec2 cos_angle = cos_dir * cos(u_angle) - sin_dir * sin(u_angle);
  vec2 sin_angle = sin_dir * cos(u_angle) + cos_dir * sin(u_angle);

  vec3 dir = vec3(sin_angle.x * cos_angle.y, sin_angle.y, cos_angle.x * cos_angle.y);

  // It should be normalized already
  return dir;
}

void main() {
  vec3 ray_dir = get_ray_direction();

  frag_color = vec4(ray_dir, 1.0);
}
