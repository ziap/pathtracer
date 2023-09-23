#version 300 es

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_angle;
uniform vec3 u_origin;
uniform uint u_samples;

uniform sampler2D u_texture;
in vec2 tex_coord;

out vec4 frag_color;

void pcg_next(inout uint state) {
  state = state * 747796405u + 2891336453u;
}

// PCG RXS-M-XS 32/32
// https://www.pcg-random.org
uint pcg_permute(uint state) {
  uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}

uint rand_u32(inout uint state) {
  uint word = pcg_permute(state);
  pcg_next(state);
  return word;
}

uint hash_u32(uint seed) {
  pcg_next(seed);
  return pcg_permute(seed);
}

// Return float in the range [0, 1)
float rand(inout uint state) {
  return float(rand_u32(state)) / 4294967296.0;
}

// Generate a vec3 with random direction and length of 1
// There are many different ways to do this but this is what I went with
vec3 random_dir(inout uint state) {
  // Generate a point on a cylinder with h = 2 and r = 1

  // Random point on the perimeter
  float lambda = radians(float(rand_u32(state) % 360u));
  float x = cos(lambda);
  float z = sin(lambda);

  // Random point on the side
  float y = rand(state) * 2.0 - 1.0;

  // Project point from the cylinder to the sphere
  // https://en.wikipedia.org/wiki/Cylindrical_equal-area_projection
  float sin_phi = y;
  float cos_phi = sqrt(1.0 - y * y);

  return vec3(cos_phi * x, sin_phi, cos_phi * z);
}

uint get_seed() {
  uint state = hash_u32(uint(gl_FragCoord.x));
  state = hash_u32(state + uint(gl_FragCoord.y));
  state = hash_u32(state + u_samples);
  return state;
}

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

void hit_floor(inout ray_t ray) {
  // Plane equation: ((ro + rd*t) * n) - d = 0
  // Floor normal: n = (0, 1, 0)
  // Floor distance to origin: d = 0
  // => (ro + rd*t).y = 0

  // Solve for t:
  // ro.y + rd.y*t = 0
  // t = -ro.y / rd.y
  if (ray.dir.y >= 0.0) return;
  float t = min(-ray.origin.y / ray.dir.y, VERY_FAR - 1.0);

  if (t > 0.0 && ray.length > t) {
    ray.length = t;
    vec3 hit = ray.origin + ray.dir * ray.length;
    ray.hit_normal = vec3(0.0, 1.0, 0.0);

    int tile = int(hit.x) + int(hit.z) + int(hit.x < 0.0) + int(hit.z < 0.0);

    if (tile % 2 == 0) ray.hit_id = -1;
    else ray.hit_id = -2;
  }
}

struct sphere_t {
  vec3 center;
  float radius;
  int id;
};

void hit_sphere(inout ray_t ray, sphere_t sphere) {
  // Sphere equation: (ro + t*rd - center)^2 = r^2

  // let va = ro - center
  // (va + t*rd)^2 = r^2
  vec3 va = ray.origin - sphere.center;

  // va^2 + 2*t*rd*va + t^2*rd^2 = r^2
  // rd^2*t^2 + 2*va*rd*t + va^2 - r^2 = 0
  // ^^^^       ^^^^^^^     ^^^^^^^^^^
  //   a           b             c
  float a = dot(ray.dir, ray.dir);
  float b = 2.0 * dot(va, ray.dir);
  float c = dot(va, va) - sphere.radius * sphere.radius;

  // Solve for t using quadratic formula
  float delta = b * b - 4.0 * a * c;
  
  if (delta >= 0.0) {
    // Always choose the closer distance
    float t = (-b - sqrt(delta)) / (2.0 * a);

    // ro + rd*t - center = va + rd*t
    vec3 n = normalize(va + ray.dir * t);

    if (t > 0.0 && ray.length > t) {
      ray.length = t;
      ray.hit_id = sphere.id;
      ray.hit_normal = n;
    } 
  }
}

// TODO: AABB (more important because VBH)
// TODO: Triangle

vec3 environment_color(in ray_t ray) {
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
  // hit_sphere(ray, sphere_t(vec3(0.0, -1e6, 0.0), 1e6, -1));
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
      materials[i] = material_t(vec3(0.0), 2.5, 0.0, 0.0);
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
    material_t(vec3(0.8, 0.8, 0.8), 0.0, 0.0, 0.0),
    material_t(vec3(0.6, 0.6, 0.6), 0.0, 0.0, 0.0)
  );

  material_t materials[ROWS * COLS] = get_materials();

  ray_t ray;
  ray.origin = u_origin;
  ray.dir = get_ray_direction(state);
  ray.length = VERY_FAR;

  vec3 color = vec3(0.0);
  vec3 ray_color = vec3(1.0);

  for (int i = 0; i < BOUNCE_LIMIT; ++i) {
    cast_ray(ray);

    if (ray.length < VERY_FAR) {
      material_t hit_mat;
      if (ray.hit_id < 0) {
        hit_mat = tile_mats[ray.hit_id + 2]; 
      } else {
        hit_mat = materials[ray.hit_id]; 
      }

      // return vec4(hit_mat.albedo, 1.0);

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
  vec4 accumulated = texture(u_texture, tex_coord) * float(u_samples);
  frag_color = (accumulated + color_pixel(state)) / float(u_samples + 1u);
}
