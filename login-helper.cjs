const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = '/tmp/login-helper.log';
const linkFile = '/tmp/login-link.txt';
const statusFile = '/tmp/login-status.txt';

// Clear previous files
if (fs.existsSync(linkFile)) fs.unlinkSync(linkFile);
if (fs.existsSync(statusFile)) fs.unlinkSync(statusFile);

const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(msg);
};

log('Starting superdesign login...');

const child = spawn('superdesign', ['login', '--no-browser'], {
  env: { ...process.env, FORCE_COLOR: '0' }
});

let outputBuffer = '';

child.stdout.on('data', (data) => {
  const str = data.toString();
  outputBuffer += str;
  log(`STDOUT: ${str}`);

  // Look for the auth URL
  // Example: Opened browser to: https://superdesign.dev/auth/cli?code=XXXX-XXXX
  const match = outputBuffer.match(/Opened browser to:\s*(https:\/\/superdesign\.dev\/auth\/cli\S+)/i);
  if (match) {
    const url = match[1];
    log(`FOUND URL: ${url}`);
    fs.writeFileSync(linkFile, url, 'utf8');
  }
});

child.stderr.on('data', (data) => {
  log(`STDERR: ${data.toString()}`);
});

child.on('close', (code) => {
  log(`Child process exited with code ${code}`);
  if (code === 0) {
    fs.writeFileSync(statusFile, 'SUCCESS', 'utf8');
  } else {
    fs.writeFileSync(statusFile, `FAILED: code ${code}`, 'utf8');
  }
});
