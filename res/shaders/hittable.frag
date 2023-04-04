void hit_sphere(inout ray_t ray, sphere_t sphere) {
  vec3 va = ray.origin - sphere.center;

  float a = dot(ray.dir, ray.dir);
  float b = 2.0 * dot(va, ray.dir);
  float c = dot(va, va) - sphere.radius * sphere.radius;

  float delta = b * b - 4.0 * a * c;
  
  if (delta >= 0.0) {
    float t = (-b - sqrt(delta)) / (2.0 * a);

    vec3 n = normalize(va + ray.dir * t);

    if (t > 0.0 && (ray.length < 0.0 || ray.length > t)) {
      ray.length = t;
      ray.hit_mat = sphere.mat;
      set_normal(ray, n);
    } 
  }
}

void hit_floor(inout ray_t ray, material_t tile1, material_t tile2) {
  float t = -ray.origin.y / ray.dir.y;
  if (t > 0.0 && ray.dir.y < 0.0 && (ray.length < 0.0 || ray.length > t)) {
    ray.length = t;
    vec3 hit = ray.origin + ray.dir * ray.length;
    int tile = int(hit.x) + int(hit.z) + int(hit.x < 0.0) + int(hit.z < 0.0);

    // TODO: Procedural mip-mapping to reduce moire pattern
    if (tile % 2 == 0) ray.hit_mat = tile1;
    else ray.hit_mat = tile2;
    set_normal(ray, vec3(0.0, 1.0, 0.0));
  }
}

