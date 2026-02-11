// 直接测试路径解析函数
const { join } = require('path');
const { homedir } = require('os');

function normalize(path) {
  return require('path').normalize(path);
}

function isAbsolute(path) {
  return require('path').isAbsolute(path);
}

function resolveOutputDirectory(configPath, workspace) {
  if (!configPath) {
    return join(workspace, 'qr-codes');
  }
  
  let resolvedPath;
  
  if (configPath.startsWith('~/')) {
    resolvedPath = join(homedir(), configPath.slice(2));
  } else if (configPath.startsWith('./')) {
    resolvedPath = join(workspace, configPath);
  } else if (isAbsolute(configPath)) {
    resolvedPath = configPath;
  } else {
    resolvedPath = join(workspace, configPath);
  }
  
  // 安全检查
  const normalizedPath = normalize(resolvedPath);
  const homeDir = homedir();
  
  if (!normalizedPath.startsWith(workspace) && !normalizedPath.startsWith(homeDir)) {
    throw new Error('Path traversal detected: path must be within workspace or home directory');
  }
  
  return normalizedPath;
}

// 测试用例
const workspace = '/Users/test/workspace';
const testCases = [
  { input: './safe-dir', expected: true, desc: 'Relative path (safe)' },
  { input: '../etc/passwd', expected: false, desc: 'Path traversal attempt' },
  { input: '~/Documents/qr', expected: true, desc: 'Home directory path' },
  { input: '/tmp/unsafe', expected: false, desc: 'Absolute path outside allowed dirs' },
  { input: '/Users/test/workspace/subdir', expected: true, desc: 'Absolute path in workspace' }
];

console.log('🧪 Testing Path Security...\n');

testCases.forEach(test => {
  try {
    const result = resolveOutputDirectory(test.input, workspace);
    if (test.expected) {
      console.log(`✅ ${test.desc}: PASSED - ${result}`);
    } else {
      console.log(`❌ ${test.desc}: FAILED - Should have thrown error`);
    }
  } catch (error) {
    if (!test.expected) {
      console.log(`✅ ${test.desc}: PASSED - Correctly blocked: ${error.message}`);
    } else {
      console.log(`❌ ${test.desc}: FAILED - Unexpected error: ${error.message}`);
    }
  }
});

console.log('\n✅ Path security tests completed!');