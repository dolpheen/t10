# t10
T10 firmware Tools

# install
npm install

# help
Usage: t10 [options]

This program handle specific firmware .bin files for T10 cameras

Options:

  -V, --version                                                   output the version number
  -u, --unpack <firmware file name>                               unpack firmware file to current folder
  -p, --pack <folder name with firmware files>                    assemble firmware to file
  -o, --output <firmware output file name default is system.bin>  output file name
  -h, --help                                                      output usage information

# Usage
Unpack .bin firmware to current folder
node t10.js system.bin  

Pack system folder to system-my.bin firmware file
node t10.js -p system -o system.bin  


