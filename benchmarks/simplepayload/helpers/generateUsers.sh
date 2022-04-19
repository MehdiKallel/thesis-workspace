#!/bin/bash
numFiles=$(sed -n '/workers:/,/spec:/p' ../config.yaml | grep -oP '(?<=number: ).*')
echo "$numFiles are needed for the benchmark"

for ((i=0; i < $numFiles; i++))
do
	echo "generating users data for Worker $i"
	curl "https://api.mockaroo.com/api/f3c00fe0?count=100&key=c6843060" > "user.json" --output "/home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/simplepayload/users$i.json"
done
