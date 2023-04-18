struct ray_t {
  vec3 origin;
  vec3 dir;
  float length;
  int hit_id;
  vec3 hit_normal;
};

#define FOV 70.0
vec3 get_ray_direction(inout uint state) {
  // Jitter the ray a bit to reduce aliasing
  vec2 jittered = gl_FragCoord.xy + (vec2(rand(state), rand(state)) - 0.5);
  vec2 uv = jittered / u_resolution - 0.5;

  vec2 plane;
  plane.y = tan(radians(FOV * 0.5)) * 2.0;
  plane.x = plane.y * u_resolution.x / u_resolution.y;

  vec2 sin_a = sin(u_angle);
  vec2 cos_a = cos(u_angle);

  vec3 forward = vec3(sin_a.x * cos_a.y, sin_a.y, cos_a.x * cos_a.y);
  vec3 right = vec3(cos_a.x, 0.0, -sin_a.x);
  vec3 up = vec3(sin_a.x * -sin_a.y, cos_a.y, cos_a.x * -sin_a.y);

  // I refuse to use matrix
  vec2 coord = uv * plane;
  return normalize(forward + right * coord.x + up * coord.y);
}

#define VERY_FAR 1e6

void ray_diffuse(inout ray_t ray, inout uint state) {
  ray.origin = ray.origin + ray.dir * ray.length;
  ray.dir = normalize(ray.hit_normal + random_dir(state));

  // avoid self-intersection (disabled for now)
  // ray.origin += ray.dir / 65536.0;
  ray.length = VERY_FAR;
}

void ray_reflect(inout ray_t ray, float glossy, inout uint state) {
  ray.origin = ray.origin + ray.dir * ray.length;
  vec3 reflected_dir = reflect(ray.dir, ray.hit_normal);
  ray.dir = normalize(reflected_dir + random_dir(state) * glossy);
  ray.length = VERY_FAR;
}
