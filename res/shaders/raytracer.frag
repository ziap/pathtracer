vec3 environment_color(ray_t ray) {
  float t = 0.5 * (ray.dir.y + 1.0);
  vec3 sky_gradient = mix(vec3(1.0), vec3(0.5, 0.7, 1.0), t);

  vec3 sun_dir = normalize(vec3(1.0, -1.0, 2.0));
  float sun_intensity = 100.0;
  float sun_focus = 125.0;

  float sun = pow(max(0.0, dot(ray.dir, -sun_dir)), sun_focus) * sun_intensity;

  return sky_gradient + sun;
}

// TODO: Generate this function with scene information in the CPU
void cast_ray(inout ray_t ray) {
  material_t red = material_t(vec3(1.0, 0.0, 0.0), 0.0, 0.0, 0.0);
  material_t green = material_t(vec3(0.0, 0.8, 0.0), 0.0, 0.0, 0.0);
  material_t blue = material_t(vec3(0.0, 0.0, 0.8), 0.0, 0.0, 0.0);
  material_t black = material_t(vec3(0.0, 0.0, 0.0), 0.0, 0.0, 0.0);
  material_t gray = material_t(vec3(0.8, 0.8, 0.8), 0.0, 0.0, 0.0);

  hit_sphere(ray, sphere_t(vec3(3.0, 1.0, 3.0), 1.0, red));
  hit_sphere(ray, sphere_t(vec3(0.0, 1.0, 3.0), 1.0, green));
  hit_sphere(ray, sphere_t(vec3(-3.0, 1.0, 3.0), 1.0, blue));


  material_t mirror1 = material_t(vec3(0.0, 0.0, 0.0), 0.0, 1.0, 0.0);
  material_t mirror2 = material_t(vec3(0.0, 0.0, 0.0), 0.0, 1.0, 0.5);
  material_t mirror3 = material_t(vec3(1.0, 0.0, 0.0), 0.0, 0.4, 0.0);

  hit_sphere(ray, sphere_t(vec3(3.0, 1.0, 6.0), 1.0, mirror1));
  hit_sphere(ray, sphere_t(vec3(0.0, 1.0, 6.0), 1.0, mirror2));
  hit_sphere(ray, sphere_t(vec3(-3.0, 1.0, 6.0), 1.0, mirror3));

  material_t light = material_t(vec3(1.0, 1.0, 1.0), 10.0, 0.0, 0.0);
  material_t red_light = material_t(vec3(1.0, 0.0, 0.0), 5.0, 0.0, 0.0);
  material_t blue_light = material_t(vec3(0.0, 0.0, 1.0), 2.0, 0.0, 0.0);

  hit_sphere(ray, sphere_t(vec3(3.0, 1.0, 9.0), 1.0, blue_light));
  hit_sphere(ray, sphere_t(vec3(0.0, 1.0, 9.0), 1.0, red_light));
  hit_sphere(ray, sphere_t(vec3(-3.0, 1.0, 9.0), 1.0, light));

  material_t tile1 = material_t(vec3(0.8, 0.8, 0.8), 0.0, 0.0, 0.0);
  material_t tile2 = material_t(vec3(0.6, 0.6, 0.6), 0.0, 0.0, 0.0);
  hit_floor(ray, tile1, tile2);
}

#define BOUNCE_LIMIT 10
vec4 color_pixel(uint state) {
  ray_t ray;
  ray.origin = u_origin;
  ray.dir = get_ray_direction();
  ray.length = -1.0;

  vec3 color = vec3(0.0);
  vec3 ray_color = vec3(1.0);

  for (int i = 0; i < BOUNCE_LIMIT; ++i) {
    cast_ray(ray);

    if (ray.length > 0.0) {
      if (rand(state) > ray.hit_mat.metallic) {
        color += ray.hit_mat.emissive * ray.hit_mat.albedo * ray_color;
        ray_color *= ray.hit_mat.albedo;
        ray_diffuse(ray, state);
      } else {
        ray_reflect(ray, state);
      }
    }
    else {
      color += ray_color * environment_color(ray);
      break;
    }
  }

  return vec4(color, 1.0);
}

#define SAMPLES 0
void main() {
  uint state = get_seed();

#if SAMPLES
  vec4 color = vec4(0.0);
  for (int i = 0; i < SAMPLES; ++i) {
    color += color_pixel(state) / float(SAMPLES);
  }

  frag_color = color;
#else
  frag_color = color_pixel(state);
#endif
}
