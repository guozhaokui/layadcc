#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
if (process.argv.length < 3) {
    console.log('用法：');
    console.log('   layadcc 输入目录，[options]');
    console.log('   options:');
    console.log('       -cache 生成cache.');
    console.log('       -lwr 文件路径全部转为小写。');
    console.log('       -url url 生成cache的话，对应的url.');
    console.log('例如:');
    console.log('   layadcc d:/game/wow -cache -url www.game.com');
    process.exit(1);
}

var options={lwr:false,cache:false,url:null};
process.argv.forEach((v,i,arr)=>{
    if(v.charAt(0)==='-'){
        switch(v){
        case '-lwr':
            options.lwr=true;
            break;
        case '-cache':
            options.cache=true;
            break;
        case '-url':
            options.url=arr[i+1];
            break;
        }
    }
});

var srcpath = path.resolve(process.cwd(), process.argv[2]);
if(!fs.existsSync(srcpath)){
    var desc = 'directory [' + srcpath + ']not exist, the first parameter should be a valid path.';
    process.exit(1);
}

var outpath = srcpath + '/update';
if( options.url && options.cache){
    outpath = path.resolve(process.cwd(),'layadccout');
}
if (!fs.existsSync(outpath)) {
    console.log('输出目录'+outpath+' 不存在，创建一个.');
    fs.mkdirSync(outpath);
}

var gendcc = require('../lib/genDcc');
gendcc.gendcc (srcpath, outpath, options.cache, options.lwr, options.url); 