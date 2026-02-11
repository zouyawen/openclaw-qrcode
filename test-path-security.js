const { resolveOutputDirectory } = require('./PLUGIN/dist/index.js');

const workspace = '/Users/zouyawen/clawd';
const testCases = [
  { input: undefined, expected: 'should be in workspace' },
  { input: './safe-dir', expected: 'should be in workspace' },
  { input: '~/Documents/safe', expected: 'should be in home' },
  { input: '../dangerous', expected: 'should throw error' },
  { input: '/etc/passwd', expected: 'should throw error' }
];

testCases.forEach((testCase, index) => {
  try {
    const result = resolveOutputDirectory(testCase.input, workspace);
    if (testCase.expected.includes('throw')) {
      console.error(`❌ Test ${index + 1}: Expected error but got ${result}`);
    } else {
      console.log(`✅ Test ${index + 1}: ${result}`);
    }
  } catch (error) {
    if (testCase.expected.includes('throw')) {
      console.log(`✅ Test ${index + 1}: Correctly rejected dangerous path`);
    } else {
      console.error(`❌ Test ${index + 1}: Unexpected error: ${error.message}`);
    }
  }
});