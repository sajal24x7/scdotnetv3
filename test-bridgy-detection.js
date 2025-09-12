#!/usr/bin/env node

/**
 * Test script to simulate Bridgy requests and check page size
 * Usage: node test-bridgy-detection.js
 */

const https = require('https');
const http = require('http');

// Test URLs (replace with your actual domain)
const testUrls = [
  'https://sajalchoudhary.net/notes/sample-post/',
  'https://sajalchoudhary.net/blog/sample-post/',
  'https://sajalchoudhary.net/micro/sample-post/'
];

// Simulate Bridgy user agent
const bridgyUserAgent = 'Bridgy/1.0 (+https://brid.gy/about)';

function makeRequest(url, userAgent = 'Mozilla/5.0 (Regular Browser)') {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': userAgent
      }
    };
    
    const req = client.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          size: Buffer.byteLength(data, 'utf8'),
          content: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testBridgyDetection() {
  console.log('🧪 Testing Bridgy Detection and Page Size\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      
      // Test regular request
      const regularResponse = await makeRequest(url);
      console.log(`  Regular request: ${regularResponse.size} bytes (${(regularResponse.size / 1024).toFixed(1)} KB)`);
      
      // Test Bridgy request
      const bridgyResponse = await makeRequest(url, bridgyUserAgent);
      console.log(`  Bridgy request:  ${bridgyResponse.size} bytes (${(bridgyResponse.size / 1024).toFixed(1)} KB)`);
      
      // Check if Bridgy version is smaller
      const sizeDifference = regularResponse.size - bridgyResponse.size;
      const percentageReduction = ((sizeDifference / regularResponse.size) * 100).toFixed(1);
      
      console.log(`  Size reduction: ${sizeDifference} bytes (${percentageReduction}% smaller)`);
      
      // Check if under 2MB limit
      const bridgySizeKB = bridgyResponse.size / 1024;
      const bridgySizeMB = bridgySizeKB / 1024;
      
      if (bridgySizeMB < 2) {
        console.log(`  ✅ Bridgy version is under 2MB limit (${bridgySizeMB.toFixed(2)} MB)`);
      } else {
        console.log(`  ❌ Bridgy version exceeds 2MB limit (${bridgySizeMB.toFixed(2)} MB)`);
      }
      
      // Check for Bridgy-specific content
      if (bridgyResponse.content.includes('Read the full post:')) {
        console.log(`  ✅ Bridgy-optimized content detected`);
      } else {
        console.log(`  ⚠️  No Bridgy-optimized content detected`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`  ❌ Error testing ${url}: ${error.message}\n`);
    }
  }
}

// Run the test
testBridgyDetection().catch(console.error);