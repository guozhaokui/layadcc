
var fs = require('fs');
var path = require('path');

function log(m){
	console.log('\x1b[0m\x1b[37m'+m);
}

function logNotify(m){
	console.log('\x1b[1m\x1b[37m'+m+'\x1b[0m\x1b[37m');
}

function logErr(m){
	console.log('\x1b[0m\x1b[31m'+m+'\x1b[0m\x1b[37m');
}

var excludes=[
	'.git',
	'.svn',
	'update',
	'dccTools',
];

var excludeExts={'.exportjson':1,'.pngz':1,'.jpgz':1,'.jngz':1};

//统计文件类型
var extfilest={};

//遍历每个文件，执行func,传入完整的文件名字
function allFiles(root,func){
  var files = fs.readdirSync(root);
  files.forEach(function(file){
    var pathname = root+'/'+file;
	try{
		var stat = fs.lstatSync(pathname);
		if (!stat.isDirectory()){
			var ext = path.extname(file);
			if(extfilest[ext]==undefined)
				extfilest[ext]=1;
			else
				extfilest[ext]++;
			//扩展名过滤
			if(excludeExts[ext])
				return true;
		   func(pathname);
		} else {
		var exclude = (function(){
			//目录过滤
			var i=0,sz=excludes.length;
			for(i=0; i<sz; i++){
				if(excludes[i]==file)
					return true;
			}
			return false;
			})();
			if(exclude)	return;
			allFiles(pathname,func);
		}
	}catch(e){
		logErr('Error:'+e);
		logErr(e.stack);
	}
  });
}

function chkdir(dir,msg){
	try{
	var stat = fs.lstatSync(dir);
	if (!stat.isDirectory()){
		throw msg;
	}}catch(e){throw msg;}
}
function chkval(v,msg){
	if(!v)
		throw msg;
}

var srcpath;
var outpath;
var urlToLower=false;
var genCache=false;
try{
	chkval(process.argv.length>=4,'用法：node genDcc.js 输入目录，输出目录 [写缓存么] [转小写么].');
	srcpath = process.argv[2];
	outpath = process.argv[3];
	chkdir(srcpath,'第一个参数应该是一个目录。\n'+srcpath);
	chkdir(outpath,'第二个参数应该是一个存在的目录。\n'+outpath);
	genCache=process.argv[4] && process.argv[4]*1;
	urlToLower=process.argv[5] && process.argv[5]*1;
}catch(e){
	logErr(e);
	return;
}

var crypto = require('crypto');
var md5 = crypto.createHash('md5')

var bindcc=[0xffeeddcc,1];	//标志和版本号
var outc=[];
var outc1=[];	//新的校验，统一已知文本的回车换行
var allrelfile=[];
var modifytm=true;

allFiles(srcpath,function(p){
	if(modifytm){
		var cdt = new Date();
		fs.utimesSync(srcpath, cdt, cdt);
	}
	var relpath = '/'+path.relative(srcpath,p).replace(/\\/g,'/');
	if(urlToLower)
		relpath=relpath.toLowerCase();//转成小写
	allrelfile.push(relpath);
	var pathcrcv = require('./crc32').crc32(relpath); bindcc.push(pathcrcv*1);
	var pathcrc = pathcrcv.toString(16);
	var padd=8-pathcrc.length;
	pathcrc='00000000'.substr(0,padd)+pathcrc;
	//计算校验的时候统一把\r\n换成\n
	var ext = path.extname(p).toLowerCase();
	var contentcrc = require('./scrc32').crc32(p); bindcc.push(contentcrc*1);
	var content = contentcrc.toString(16);
	outc.push(pathcrc+' '+content);
	outc1.push(pathcrc+' '+content);
	
	if(ext==='.txt' || ext==='.html' || ext==='.js' || ext==='.exportjson' || ext==='.css' || ext==='.htm' || ext==='.ini' || ext==='.log' ){
		/*
		var strbuff = fs.readFileSync(p,'utf8');	这有个问题，如果不是utf8的会导致与c端的不一致而产生校验错误
		strbuff = strbuff.replace(/\r\n/g,'\n');	
		var buff = new Buffer(strbuff);
		*/
		var strbuff = fs.readFileSync(p);
		var tempBuff = new Buffer(strbuff.length);
		var si=0,di=0;
		var srclen=strbuff.length;
		while(si<srclen){
			if(strbuff[si]==0x0d && strbuff[si+1]==0x0a ){
				si++;si++;
				tempBuff[di++]=0x0a;
			}else{
				tempBuff[di++]=strbuff[si++];
			}
		}
		tempBuff = tempBuff.slice(0,di);
		content = require('./scrc32').crc32mem(tempBuff).toString(16);
		outc1.pop();
		outc1.push(pathcrc+' '+content);
	}
		
	//log( pathcrc+' '+content+'   \t'+relpath);
	//copy
	var inbuf = fs.readFileSync(p);
	md5.update(inbuf);
	if(genCache)
		fs.writeFileSync(path.resolve(outpath,pathcrc),inbuf);
	//log(relpath);
});

fs.writeFileSync(path.resolve(outpath,'filetable.txt'),outc.join('\r\n'));
//写二进制的dcc
var bindccBuff = new Buffer(4*bindcc.length);
bindccBuff.fill(0);
for(var i=0; i<bindcc.length; i++){
	bindccBuff.writeUInt32LE(bindcc[i],i*4);
}
fs.writeFileSync(path.resolve(outpath,'filetable.bin'),bindccBuff);

fs.writeFileSync(path.resolve(outpath,'filetable1.txt'),outc1.join('\r\n'));
fs.writeFileSync(path.resolve(outpath,'assetsid.txt'), md5.digest('hex'));
fs.writeFileSync(path.resolve(outpath,'allfiles.txt'),allrelfile.join('\r\n'));

log(JSON.stringify(extfilest));
//require("./UnitTest.js").testall(new alltest(),'testEJFile2Bin');//,'fff');
