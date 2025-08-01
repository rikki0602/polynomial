const fs = require('fs');

const MOD = 1000000007n;

// Base conversion for BigInt (works for bases > 10 and large strings)
function parseBigIntFromBase(str, base) {
    const b = BigInt(base);
    let result = 0n;
    for (const digit of str.toLowerCase()) {
        let val;
        if (digit >= '0' && digit <= '9') val = BigInt(digit);
        else val = BigInt(digit.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        result = result * b + val;
    }
    return result;
}

// Modular inverse using Extended Euclidean Algorithm
function modInverse(a, mod) {
    let m0 = mod, t, q;
    let x0 = 0n, x1 = 1n;
    if (mod === 1n) return 0n;

    a = (a % mod + mod) % mod;

    while (a > 1n) {
        q = a / mod;
        t = mod;
        mod = a % mod;
        a = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
    }

    return x1 < 0n ? x1 + m0 : x1;
}

// Lagrange Interpolation at x=0 (mod MOD)
function lagrangeInterpolationAtZero(points, k) {
    let result = 0n;

    for (let i = 0; i < k; i++) {
        const xi = points[i].x;
        const yi = points[i].y;

        let num = 1n;
        let den = 1n;

        for (let j = 0; j < k; j++) {
            if (i === j) continue;
            const xj = points[j].x;
            num = (num * (-xj)) % MOD;
            den = (den * (xi - xj)) % MOD;
        }

        const inv = modInverse(den, MOD);
        const term = (((yi * num) % MOD) * inv) % MOD;
        result = (result + term + MOD) % MOD;
    }

    return result;
}

// Load and parse JSON input
function parseInput(filename) {
    const raw = fs.readFileSync(filename, 'utf8');
    const data = JSON.parse(raw);
    const k = data.keys.k;
    const points = [];

    for (const key in data) {
        if (key === 'keys') continue;
        const x = BigInt(key);
        const base = parseInt(data[key].base);
        const y = parseBigIntFromBase(data[key].value, base);
        points.push({ x, y });
    }

    // Sort by x and pick first k points
    points.sort((a, b) => (a.x < b.x ? -1 : 1));
    return { k, points: points.slice(0, k) };
}

// Main execution
const { k, points } = parseInput('input.json');
const secret = lagrangeInterpolationAtZero(points, k);
console.log("✅ Secret (constant term at x=0):", secret.toString());
