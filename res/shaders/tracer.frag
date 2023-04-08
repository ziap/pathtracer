vec3 environment_color(ray_t ray) {
  float t = 0.5 * (ray.dir.y + 1.0);
  vec3 sky_gradient = mix(vec3(1.0), vec3(0.5, 0.7, 1.0), t);

  // TODO: Atmosphere rendering
  // Try to replicate https://www.shadertoy.com/view/4dSBDt
  return sky_gradient;
}

// TODO: Generate this function with scene information in the CPU
void cast_ray(inout ray_t ray) {
  uint state = 69u;

  // TODO: Optmize this before moving scene to the CPU
  for (int i = 0; i < 25; ++i) {
    float r = rand(state) + 1.0;

    material_t mat;
    if (rand(state) < 0.2) {
      mat = material_t(vec3(0.0), 2.0, 0.0, 0.0);
    } else {
      vec3 color = vec3(rand(state), rand(state), rand(state));
      mat = material_t(color, 0.0, rand(state) * 0.3, round(rand(state)) * 0.1);
    }
    hit_sphere(ray, sphere_t(vec3(float(i / 5) * 5.0, r, float(i % 5) * 5.0), r, mat));
  }

  material_t tile1 = material_t(vec3(0.8, 0.8, 0.8), 0.0, 0.0, 0.0);
  material_t tile2 = material_t(vec3(0.6, 0.6, 0.6), 0.0, 0.0, 0.0);
  hit_floor(ray, tile1, tile2);
}

#define BOUNCE_LIMIT 10
vec4 color_pixel(uint state) {
  ray_t ray;
  ray.origin = u_origin;
  ray.dir = get_ray_direction(state);
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
  vec4 accumulated = texture2D(u_texture, tex_coord) * float(u_samples);
  frag_color = (accumulated + color_pixel(state)) / float(u_samples + 1u);
}
