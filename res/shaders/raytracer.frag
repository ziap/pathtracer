vec3 sky_gradient(ray_t ray) {
  float t = 0.5 * (ray.dir.y + 1.0);

  return (1.0 - t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
}

// TODO: Generate this function with scene information in the CPU
void cast_ray(inout ray_t ray) {
  material_t red = material_t(vec4(1.0, 0.0, 0.0, 1.0));
  material_t green = material_t(vec4(0.0, 1.0, 0.0, 1.0));
  material_t blue = material_t(vec4(0.0, 0.0, 1.0, 1.0));
  material_t black = material_t(vec4(0.0, 0.0, 0.0, 1.0));

  hit_sphere(ray, sphere_t(vec3(3.0, 1.0, 3.0), 1.0, red));
  hit_sphere(ray, sphere_t(vec3(0.0, 1.0, 3.0), 1.0, green));
  hit_sphere(ray, sphere_t(vec3(-3.0, 1.0, 3.0), 1.0, blue));

  hit_sphere(ray, sphere_t(vec3(3.0, 1.0, 6.0), 1.0, green));
  hit_sphere(ray, sphere_t(vec3(0.0, 1.0, 6.0), 1.0, black));
  hit_sphere(ray, sphere_t(vec3(-3.0, 1.0, 6.0), 1.0, red));

  hit_sphere(ray, sphere_t(vec3(3.0, 1.0, 9.0), 1.0, blue));
  hit_sphere(ray, sphere_t(vec3(0.0, 1.0, 9.0), 1.0, red));
  hit_sphere(ray, sphere_t(vec3(-3.0, 1.0, 9.0), 1.0, black));

  // hit_sphere(ray, sphere_t(vec3(0.0, -1000.0, 0.0), 1000.0, black));

  material_t tile1 = material_t(vec4(0.3, 0.3, 0.3, 1.0));
  material_t tile2 = material_t(vec4(0.5, 0.5, 0.5, 1.0));
  hit_floor(ray, black, black);
}

vec4 color_pixel(uint state) {
  ray_t ray;
  ray.origin = u_origin;
  ray.dir = get_ray_direction();
  ray.length = -1.0;

  vec4 color = vec4(0.0);

  // TODO: Control level of diffusion with roughness
  float w = 0.5;
  float total = 0.5;

  for (int i = 0; i < BOUNCE_LIMIT; ++i) {
    cast_ray(ray);

    if (ray.length > 0.0) {
      color += w * ray.hit_mat.albedo;
      w *= 0.5;
      total += w;
      ray_reflect(ray, state);
    }
    else {
      color += w * vec4(sky_gradient(ray), 1.0);
      break;
    }
  }

  return vec4(color.rgb / total, 1.0);
}

void main() {
  uint state = get_seed();

  frag_color = color_pixel(state);
}
