vec3 environment_color(ray_t ray) {
  float t = 0.5 * (ray.dir.y + 1.0);
  vec3 sky_gradient = mix(vec3(1.0), vec3(0.5, 0.7, 1.0), t);

  // TODO: Atmosphere rendering
  // Try to replicate https://www.shadertoy.com/view/4dSBDt
  return sky_gradient;
}

// TODO: Generate this function from the CPU
#define ROWS 5
#define COLS 5
void cast_ray(inout ray_t ray) {
  uint state = 69u;

  for (int i = 0; i < ROWS * COLS; ++i) {
    float r = rand(state) + 1.0;
    float x = float(i / COLS) * 5.0;
    float z = float(i % COLS) * 5.0;

    hit_sphere(ray, sphere_t(vec3(x, r, z), r, i));
  }
  hit_floor(ray);
}

struct material_t {
  vec3 albedo;
  float emissive;

  float metallic;
  float glossy;
};

// TODO: Also generate this function from the CPU
material_t[ROWS * COLS] get_materials() {
  uint state = 42u;

  material_t materials[ROWS * COLS];
  for (int i = 0; i < ROWS * COLS; ++i) {
    if (rand(state) < 0.2) {
      materials[i] = material_t(vec3(0.0), 2.2, 0.0, 0.0);
    } else {
      vec3 color = vec3(rand(state), rand(state), rand(state));
      float glossy = float(rand(state) < 0.5) * 0.1 * rand(state);
      materials[i] = material_t(color, 0.0, rand(state) * 0.3, glossy);
    }
  }

  return materials;
}

#define BOUNCE_LIMIT 8
vec4 color_pixel(uint state) {
  material_t tile_mats[2] = material_t[2](
    material_t(vec3(0.8, 0.8, 0.8), 0.0, 0.1, 0.0),
    material_t(vec3(0.6, 0.6, 0.6), 0.0, 0.1, 0.0)
  );

  material_t materials[ROWS * COLS] = get_materials();

  ray_t ray;
  ray.origin = u_origin;
  ray.dir = get_ray_direction(state);
  ray.length = -1.0;

  vec3 color = vec3(0.0);
  vec3 ray_color = vec3(1.0);

  for (int i = 0; i < BOUNCE_LIMIT; ++i) {
    cast_ray(ray);

    if (ray.length > 0.0) {
      material_t hit_mat;
      if (ray.hit_id < 0) {
        hit_mat = tile_mats[ray.hit_id + 2]; 
      } else {
        hit_mat = materials[ray.hit_id]; 
      }

      if (rand(state) > hit_mat.metallic) {
        color += hit_mat.emissive * ray_color;
        
        // Absorb light from the ray
        ray_color *= hit_mat.albedo;
        
        // Russian-roulette early stopping
        // Dark rays can't be absorbed as much as light rays so they have a
        // higher change of being terminated earlier
        float threshold = max(max(ray_color.r, ray_color.g), ray_color.b);
        if (rand(state) > threshold) break;

        // Adjust the value to make up for other paths being terminated
        ray_color /= threshold;

        ray_diffuse(ray, state);
      } else {
        // For now the specular color is white (reflect all light)
        ray_reflect(ray, hit_mat.glossy, state);
      }
    } else {
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
