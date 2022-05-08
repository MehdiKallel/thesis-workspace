for(( i=0; i<=$1; i++ ))
do
	curl "https://api.mockaroo.com/api/b93913d0?count=1000&key=c6843060" --output "/home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/basic/ids${i}.json"
done
