// PCG RXS-M-XS 32/32
// https://www.pcg-random.org
uint rand_u32(inout uint state) {
  uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  state = state * 747796405u + 2891336453u;
  return (word >> 22u) ^ word;
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
  uint state = uint(gl_FragCoord.x + u_resolution.x * gl_FragCoord.y);

  // Hash the noise before adding the sample count otherwise the noise will be
  // shifted instead of randomly change over time
  return rand_u32(state) + u_samples;
}
