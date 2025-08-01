import fs from 'fs';

// Define PolynomialSecretSharing class (converted from TypeScript)
class PolynomialSecretSharing {
  constructor() {
    this.MOD = BigInt(1000000007);
  }

  // Convert value from given base to decimal using BigInt
  convertFromBase(value, base) {
    return BigInt(parseInt(value, base));
  }

  // Extended Euclidean Algorithm for modular inverse
  modInverse(a, m) {
    if (a < BigInt(0)) a = (a % m + m) % m;
    let [old_r, r] = [a, m];
    let [old_s, s] = [BigInt(1), BigInt(0)];

    while (r !== BigInt(0)) {
      const quotient = old_r / r;
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
    }

    return old_s < BigInt(0) ? old_s + m : old_s;
  }

  // Lagrange interpolation at x=0 - identical to Java implementation
  lagrangeInterpolationAtZero(points) {
    let result = BigInt(0);

    for (let i = 0; i < points.length; i++) {
      const xi = points[i].x;
      const yi = points[i].y;

      let num = BigInt(1);
      let den = BigInt(1);

      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        const xj = points[j].x;

        num = (num * (-xj)) % this.MOD;
        den = (den * (xi - xj)) % this.MOD;
      }

      if (num < BigInt(0)) num = (num % this.MOD + this.MOD) % this.MOD;
      if (den < BigInt(0)) den = (den % this.MOD + this.MOD) % this.MOD;

      const denInv = this.modInverse(den, this.MOD);
      const term = (((yi * num) % this.MOD) * denInv) % this.MOD;
      result = (result + term) % this.MOD;
    }

    return result < BigInt(0) ? (result % this.MOD + this.MOD) % this.MOD : result;
  }

  // Main processing function
  processJSON(jsonData) {
    try {
      const k = jsonData.keys.k;
      const points = [];

      // Process each point
      for (const [key, entry] of Object.entries(jsonData)) {
        if (key === 'keys') continue;

        const x = BigInt(key);
        const base = parseInt(entry.base);
        const value = entry.value;
        const y = this.convertFromBase(value, base);

        points.push({ x, y });
      }

      if (points.length < k) {
        throw new Error('Not enough points to interpolate');
      }

      // Sort points and select first k
      points.sort((a, b) => (a.x < b.x ? -1 : 1));
      const selectedPoints = points.slice(0, k);

      // Calculate secret
      const secret = this.lagrangeInterpolationAtZero(selectedPoints);

      return {
        success: true,
        secret: secret.toString(),
        pointsUsed: k,
        totalPoints: points.length,
        points: selectedPoints.map((p) => ({
          x: p.x.toString(),
          y: p.y.toString(),
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }
}

// Test with the provided JSON
const inputData = JSON.parse(fs.readFileSync('input.json', 'utf8'));
const polynomial = new PolynomialSecretSharing();
const result = polynomial.processJSON(inputData);

console.log('\n=== Node.js Polynomial Secret Sharing Test ===');
console.log('Input JSON loaded successfully with', Object.keys(inputData).length - 1, 'points');
console.log('Required k =', inputData.keys.k);
console.log('\nCalculation Result:');
console.log('Success:', result.success);

if (result.success) {
  console.log('✅ Constant term (c) =', result.secret);
  console.log('Points used:', result.pointsUsed, 'of', result.totalPoints);
  console.log('\nPoints selected for calculation:');
  result.points.forEach((point, i) => {
    console.log(`  Point ${i + 1}: x=${point.x}, y=${point.y}`);
  });
} else {
  console.log('❌ Error:', result.error);
}

console.log('\n=== Test Complete ===\n');
