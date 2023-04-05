vec3 environment_color(ray_t ray) {
  float t = 0.5 * (ray.dir.y + 1.0);
  vec3 sky_gradient = mix(vec3(1.0), vec3(0.5, 0.7, 1.0), t);

  return sky_gradient;
}

// TODO: Generate this function with scene information in the CPU
void cast_ray(inout ray_t ray) {
  material_t red = material_t(vec3(0.8, 0.0, 0.0), 0.0, 0.0, 0.0);
  material_t green = material_t(vec3(0.0, 0.8, 0.0), 0.0, 0.0, 0.0);
  material_t blue = material_t(vec3(0.0, 0.0, 0.8), 0.0, 0.0, 0.0);
  material_t yellow = material_t(vec3(0.8, 0.8, 0.0), 0.0, 0.0, 0.0);
  material_t cyan = material_t(vec3(0.0, 0.8, 0.8), 0.0, 0.0, 0.0);

  material_t mirror0 = material_t(vec3(0.0, 0.0, 0.0), 0.0, 1.0, 0.0);
  material_t mirror1 = material_t(vec3(0.0, 0.0, 0.0), 0.0, 1.0, 0.1);

  material_t light = material_t(vec3(0.0, 0.0, 0.0), 10.0, 0.0, 0.0);

  hit_sphere(ray, sphere_t(vec3(-6.0, 1.0, 4.0), 1.0, red));
  hit_sphere(ray, sphere_t(vec3(-3.0, 1.0, 3.0), 1.0, green));
  hit_sphere(ray, sphere_t(vec3(0.0, 1.0, 2.0), 1.0, blue));
  hit_sphere(ray, sphere_t(vec3(3.0, 1.0, 3.0), 1.0, yellow));
  hit_sphere(ray, sphere_t(vec3(6.0, 1.0, 4.0), 1.0, cyan));

  hit_sphere(ray, sphere_t(vec3(6.0, 5.0, 12.0), 5.0, mirror0));
  hit_sphere(ray, sphere_t(vec3(-6.0, 5.0, 12.0), 5.0, mirror1));
  hit_sphere(ray, sphere_t(vec3(0, 8.0, 6.0), 1.0, light));

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
        color += ray.hit_mat.emissive * ray_color;
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

void main() {
  uint state = get_seed();
  frag_color = (texture2D(texture, tex_coord) * float(u_samples) + color_pixel(state)) / float(u_samples + 1);
}
