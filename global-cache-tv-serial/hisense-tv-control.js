#!/usr/bin/env node

// Controls a hisense TV via a Global Cache serial port adapter

const net = require('net');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const PORT = 4999;

const COMMANDS = {
  on:  Buffer.from([0xA6, 0x01, 0x00, 0x00, 0x00, 0x04, 0x01, 0x18, 0x02, 0xB8]),
  off: Buffer.from([0xA6, 0x01, 0x00, 0x00, 0x00, 0x05, 0x01, 0xB0, 0x00, 0x74, 0x67]),
};

const ipOption = {
  ip: {
    alias: 'i',
    type: 'string',
    description: 'IP address of the Global Cache serial adapter',
    demandOption: true,
  },
};

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> --ip <address>')
  .command('on',  'Power on the Hisense TV',  ipOption)
  .command('off', 'Power off the Hisense TV', ipOption)
  .demandCommand(1, 'You must specify a command: on or off')
  .strict()
  .help()
  .argv;

const [cmd] = argv._;
const IP = argv.ip;

const client = net.createConnection({ host: IP, port: PORT }, () => {
  console.log(`Connected to ${IP}:${PORT}, sending power-${cmd} command...`);
  client.write(COMMANDS[cmd], () => {
    console.log('Command sent.');
    client.destroy();
  });
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
  process.exit(1);
});

client.on('close', () => {
  console.log('Connection closed.');
});
