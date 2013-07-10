#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var HTMLPATH_DEFAULT = "http://immense-harbor-5282.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
}

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
}

if (require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), undefined)
	.option('-u, --url <html_path>', 'Path to website', undefined)
	.parse(process.argv);
    if (program.url != undefined) {
	rest.get(program.url).on('complete', function(result) {
	    fs.writeFile('temp.html', result, 'utf8', function(err) {
		if (err) {
		    console.log('Error!');
		    process.exit(1);
		}
		//console.log('Contents written to temp.html');
	    });
	});
	program.file = 'temp.html';
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    } else if (program.file != undefined) {
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    } else {
	console.log("No URL or filename given. Terminating.");
	process.exit(1);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
