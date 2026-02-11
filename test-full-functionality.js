#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 模拟 OpenClaw API 对象
const mockApi = {
  registerTool: function(toolConfig) {
    this.tool = toolConfig;
    console.log('✅ Tool registered:', toolConfig.name);
  },
  config: {
    plugins: {
      entries: {
        'qr-code': {
          config: {
            outputDirectory: './qr-codes/',
            assetsDirectory: './qr-assets/'
          }
        }
      }
    }
  },
  agents: {
    defaults: {
      workspace: '/tmp/openclaw-test-workspace'
    }
  },
  context: {
    channel: 'webchat'
  },
  logger: {
    warn: (msg) => console.log('⚠️ WARN:', msg),
    error: (msg) => console.log('❌ ERROR:', msg)
  }
};

// 加载插件
require('./PLUGIN/index.ts')(mockApi);

// 创建测试目录
const testWorkspace = '/tmp/openclaw-test-workspace';
const outputDir = path.join(testWorkspace, 'qr-codes');
const assetsDir = path.join(testWorkspace, 'qr-assets');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// 创建测试 logo
const testLogoPath = path.join(assetsDir, 'test-logo.png');
if (!fs.existsSync(testLogoPath)) {
  fs.writeFileSync(testLogoPath, 'fake image data for testing');
}

async function testGenerate() {
  console.log('\n🧪 Testing QR Code Generation...');
  
  try {
    const result = await mockApi.tool.execute('test', {
      operation: 'generate',
      input: 'https://example.com',
      options: {
        color: 'red',
        backgroundColor: 'white',
        size: 10,
        format: 'png'
      }
    });
    
    if (result.content[0].text.includes('QR Code Generated Successfully')) {
      console.log('✅ Generate test PASSED');
      return true;
    } else {
      console.log('❌ Generate test FAILED:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Generate test ERROR:', error.message);
    return false;
  }
}

async function testGenerateWithLogo() {
  console.log('\n🧪 Testing QR Code Generation with Logo...');
  
  try {
    const result = await mockApi.tool.execute('test', {
      operation: 'generate',
      input: 'https://example.com',
      options: {
        color: 'blue',
        backgroundColor: 'yellow',
        logoPath: 'test-logo.png',
        size: 12,
        format: 'png'
      }
    });
    
    if (result.content[0].text.includes('QR Code Generated Successfully')) {
      console.log('✅ Generate with logo test PASSED');
      return true;
    } else {
      console.log('❌ Generate with logo test FAILED:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Generate with logo test ERROR:', error.message);
    return false;
  }
}

async function testDecode() {
  console.log('\n🧪 Testing QR Code Decode (will fail without real QR image)...');
  
  try {
    const result = await mockApi.tool.execute('test', {
      operation: 'decode',
      input: '/tmp/nonexistent-qr.png',
      options: {}
    });
    
    // Decode should handle the error gracefully
    if (result.content[0].text.includes('QR Code operation failed')) {
      console.log('✅ Decode error handling PASSED');
      return true;
    } else {
      console.log('❌ Decode test unexpected result:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Decode test ERROR:', error.message);
    return false;
  }
}

async function testBeautify() {
  console.log('\n🧪 Testing QR Code Beautify (will fail without real QR image)...');
  
  try {
    const result = await mockApi.tool.execute('test', {
      operation: 'beautify',
      input: '/tmp/nonexistent-qr.png',
      options: {
        color: 'green',
        backgroundColor: 'black'
      }
    });
    
    // Beautify should handle the error gracefully
    if (result.content[0].text.includes('QR Code operation failed')) {
      console.log('✅ Beautify error handling PASSED');
      return true;
    } else {
      console.log('❌ Beautify test unexpected result:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Beautify test ERROR:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Full Functionality Tests...\n');
  
  let passed = 0;
  let total = 4;
  
  if (await testGenerate()) passed++;
  if (await testGenerateWithLogo()) passed++;
  if (await testDecode()) passed++;
  if (await testBeautify()) passed++;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests PASSED! Ready for publication.');
  } else {
    console.log('⚠️ Some tests failed. Please review above errors.');
  }
}

// 运行测试
runAllTests().catch(console.error);