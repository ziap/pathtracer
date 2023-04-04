vec3 get_ray_direction() {
  vec2 uv = gl_FragCoord.xy / u_resolution - 0.5;

  vec2 plane;
  
  plane.y = tan(radians(FOV * 0.5)) * 2.0;
  plane.x = plane.y * u_resolution.x / u_resolution.y;

  vec2 sin_angle = sin(u_angle);
  vec2 cos_angle = cos(u_angle);

  // No normalization required because all of them are unit vectors
  vec3 dir = vec3(sin_angle.x * cos_angle.y, sin_angle.y, cos_angle.x * cos_angle.y);
  vec3 side = normalize(vec3(cos_angle.x, 0.0, -sin_angle.x));
  vec3 up = cross(dir, side);

  // I refuse to use matrix
  vec2 coord = uv * plane;

  return normalize(dir + side * coord.x + up * coord.y);
}

void set_normal(inout ray_t ray, vec3 n) {
  if (dot(ray.dir, n) > 0.0) {
    ray.hit_normal = -n;
    ray.hit_front = false;
  } else {
    ray.hit_normal = n;
    ray.hit_front = true;
  }
}

void ray_reflect(inout ray_t ray, inout uint state) {
  ray.origin = ray.origin + ray.dir * ray.length;
  ray.dir = normalize(ray.hit_normal + random_dir(state));

  // avoid self-intersection (disabled for now)
  // ray.origin += ray.dir / 65536.0;
  ray.length = -1.0;
}
