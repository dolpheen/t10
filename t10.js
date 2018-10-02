const fs = require('fs');
const extract = require('extract-zip');
const JSZip = require('jszip');
const program = require('commander');
const path = require('path');
var glob = require("glob");


program
  .version('v0.0.1 Dolpheen 2018')
  .description('This program handle specific firmware .bin files for T10 cameras')
  .option('-u, --unpack <firmware file name>', 'unpack firmware file to current folder')
  .option('-p, --pack <folder name with firmware files>', 'assemble firmware to file')
  .option('-o, --output <firmware output file name default is system.bin>', 'output file name')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

if(program.unpack){
	console.log('');
	
	let data = fs.readFileSync(program.unpack);
	let idx = 0;
	// Read Magic String

	let magic = data.slice(idx, idx += 0x20);
	if( magic == 'www.object-camera.com.by.hongzx.'){
		console.log( 'Magic found. Unpacking...\n');	
	}else{
		console.log( 'Wrong magic. Quitting...', magic.toString() );	
		exit();
	}

	let fileCount = 0; 
	while( filePath = data.slice(idx, idx += 0x40).toString().replace(/\0[\s\S]*$/g,'') ){
		
		// Check Magic in the end	
		if( filePath == '.xzgnoh.yb.moc.aremac-tcejbo.www'){
			break;
		}

		// Read File Name
		let fileName = data.slice(idx, idx += 0x40).toString().replace(/\0[\s\S]*$/g,'');
		

		// Read File Size
		let fileSize = data.readUInt32LE(idx);
		console.log('%s%s %d',filePath, fileName, fileSize);

		// Read Something 1
		let fileSomething1 = data.readUInt32LE(idx += 4);
		// Read Something 2
		let fileSomething2 = data.readUInt32LE(idx += 4);

		// Read zip file
		fs.writeFileSync(fileName, data.slice(idx += 4, idx += fileSize));

		// Extract zip file
		extract( fileName, { dir: process.cwd() }, function (err) {
		 	if(err == undefined){
		 		fs.unlinkSync( fileName );	
			}
		});

		fileCount++;
	}

	console.log('\nSuccesefully unpacked %d files.', fileCount);
}else if(program.pack){
	console.log( '\nStart packing...\n');

	glob('system/**/*', null, function (er, files) {
		let filesCount = zippedfilesCount = 0;
		let outputFileName = program.output ? program.output : 'system.bin';

		var zip = new JSZip();
		files.map( filename => {
			if( !fs.lstatSync(filename).isDirectory()){
				filesCount++;
				zip.file(filename, fs.readFileSync(filename));
				let stream = zip.generateNodeStream({type:'nodebuffer', compression: 'DEFLATE'}).pipe(fs.createWriteStream( '$temp$_'+ path.basename(filename)+'.zip'))
					.on('finish', function () {
    					zippedfilesCount++;
    					if(filesCount == zippedfilesCount){
    						fs.writeFileSync(outputFileName, Buffer.from('www.object-camera.com.by.hongzx.'));
								files.map( filename => {
									if( !fs.lstatSync(filename).isDirectory()){
										console.log('%s', filename);
										fs.writeFileSync(outputFileName, Buffer.concat( [Buffer.from(path.dirname(filename)), Buffer.alloc(64)], 64), {flag:'a'});
										fs.writeFileSync(outputFileName, Buffer.concat( [Buffer.from(path.basename(filename) + '.zip'), Buffer.alloc(64)], 64), {flag:'a'});
										let size = Buffer.alloc(4);
										size.writeUInt32LE(fs.lstatSync('$temp$_'+ path.basename(filename)+'.zip').size, 0);
										fs.writeFileSync(outputFileName, size, {flag:'a'});
										size.writeUInt32LE(0x10, 0);
										fs.writeFileSync(outputFileName, size, {flag:'a'});
										size.writeUInt32LE(0x0, 0);
										fs.writeFileSync(outputFileName, size, {flag:'a'});
										fs.writeFileSync(outputFileName, fs.readFileSync( '$temp$_'+ path.basename(filename)+'.zip' ), {flag:'a'});
										fs.unlinkSync('$temp$_'+ path.basename(filename)+'.zip');
									}
								});					
								fs.writeFileSync(outputFileName, Buffer.from('.xzgnoh.yb.moc.aremac-tcejbo.www'), {flag:'a'});
								console.log('\nSuccesefully packed %d files to %s', zippedfilesCount, outputFileName);
    					}
					});
				zip = new JSZip();	
			}
		});
	})
}else{
	program.help();
}