// Permuted congruential generator
// https://www.pcg-random.org/
float rand(inout uint state) {
	state = state * 747796405u + 2891336453u;
	uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
	uint result = (word >> 22u) ^ word;
  return float(result) / float(4294967295u);
}

// Generate a vec3 with random direction and length of 1
// To do this we can uniformly distribute a random point on the surface of a
// sphere with radius 1
vec3 random_dir(inout uint state) {
  // Generate a point on a cylinder with h = 2 and r = 1

  // Random point on the perimeter
  float lambda = radians(rand(state) * 360.0);
  float x = cos(lambda);
  float z = sin(lambda);

  // Random point on the side
  float y = rand(state) * 2.0 - 1.0;

  // Project point from the cylinder to the sphere
  // https://en.wikipedia.org/wiki/Lambert_cylindrical_equal-area_projection
  float sin_phi = y;
  float cos_phi = sqrt(1.0 - y * y);

  return vec3(cos_phi * x, sin_phi, cos_phi * z);
}

uint get_seed() {
  uint state = uint(gl_FragCoord.x + u_resolution.x * gl_FragCoord.y);

  // Hash the noise before adding the sample count otherwise the noise will be
  // shifted instead of randomly change over time
  rand(state);
  return state + u_samples;
}
