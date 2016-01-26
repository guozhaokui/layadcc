#!/bin/sh
mypath=$(cd "$(dirname "$0")"; pwd)
echo "full path: ${mypath}"

if [ ! -d "${mypath}/dccout" ]; then  
mkdir "${mypath}/dccout"  
fi 

function gendcc()
{
	wpath="${mypath}/../$1"
	echo "gen dcc of ${wpath}"
	if [ ! -d "${wpath}/update/" ]; then  
	mkdir "${wpath}/update/"  
	fi 
	rm ${wpath}/update/filetable.txt
	rm ${wpath}/update/assetsid.txt
	rm ${wpath}/update/allfiles.txt
	./node ${mypath}/genDcc.js ${wpath}/ ${mypath}/dccout 0
	cp ${mypath}/dccout/filetable.txt ${wpath}/update/
	cp ${mypath}/dccout/filetable.bin ${wpath}/update/
	cp ${mypath}/dccout/filetable1.txt ${wpath}/update/
	cp ${mypath}/dccout/assetsid.txt ${wpath}/update/
	cp ${mypath}/dccout/allfiles.txt ${wpath}/update/
}

gendcc "1" 
gendcc "2"
gendcc "3"
gendcc "4"
gendcc "4x5"
gendcc "5"
gendcc "6"
gendcc "7"
gendcc "8"
gendcc "8x5"
gendcc "8baidu"
gendcc "8liebao"
gendcc "starthtml"
gendcc "starthtmlany"
gendcc "miaomiao"
