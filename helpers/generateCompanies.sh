#!/bin/bash
numFiles=$(sed -n '/workers:/,/spec:/p' ../config.yaml | grep -oP '(?<=number: ).*')
echo "$numFiles are needed for the benchmark"

for ((i=0; i < $numFiles; i++))
do
	echo "generating companies data for Worker $i"
	curl "https://api.mockaroo.com/api/fd697110?count=1&key=c6843060" --output "/home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/basic/companies$i.json"
done
