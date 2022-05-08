#!/bin/bash
echo "Which Chaincode do you want to test? - press Enter after input"
read c;
chaincodeId=$c

echo "Please enter the assets sizes that you want to test - type exit then enter"
payloads=()
tps=()
while IFS= read -r line; do
	[[ $line = exit ]] && break      
	if [[ "$line" =~ ^[0-9]+$ ]];
	then payloads+=( "$line" ); 
	fi
done
echo "****************Assets inputs completed****************"

echo "Please enter the TPS list then exit"
while IFS= read -r line; do
	[[ $line = exit ]] && break      
	if [[ "$line" =~ ^[0-9]+$ ]];
	then tps+=( "$line" ); 
	fi
done
echo "****************PS input completed****************"

echo -n "How many rounds do you want to run? - press enter";
read x;
echo "****************Rounds input saved****************"
wait


echo "Which bechmarks are you launching? - write exit then press Enter"

functionss=()
while IFS= read -r line; do
	[[ $line = exit ]] && break 
	functions+=( "$line" );
done

for l in "${functionss[@]}"
do
	echo $l
done
for t in "${functions[@]}"
do
	jsFile=$t
	echo $t
	cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/helpers
	python3 scriptConfigFunction.py $jsFile
	cd ..
	rm config.yaml
	mv newConfig.yaml config.yaml
	for n in "${tps[@]}"
	do
		:
		echo "starting bechmark with $n TPS "
		currentTPS=$n
		echo "****************Setting up config.yaml****************"
		cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/helpers
		python3 scriptConfigFix.py $currentTPS
		cd ..
		rm config.yaml
		mv newConfig.yaml config.yaml
		echo "****************config.yaml setup finished****************" 
		wait    
		for (( j=0; j<$x; j++))
		do
			:
			targetDirectory="${jsFile}_${currentTPS}_${j}_results"
			echo "****************Creating result directory $j for $currentTPS TPS****************"
			mkdir -p  /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/"$targetDirectory"

			echo "****************Running experiment: $j with $currentTPS ****************"
			sleep 4s
			for i in "${payloads[@]}"
			do
				:
				currentPayload=$i
				cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/helpers
				python3 scriptConfigAssets.py $currentPayload
		                cd ..
                		rm config.yaml
                		mv newConfig.yaml config.yaml
				echo "****************Beginning benchmark with $i assets"****************
				value=$i
				echo "****************target is $i.log****************"
				echo "************deleting network************"
				sleep 2s
				cd /home/ubuntu/HyperLedgerLab-2.0/scripts
				./network_delete.sh
				wait
				sleep 10s
				echo "************deleting caliper************"
				cd home/ubuntu/HyperLedgerLab-2.0/scripts
				./caliper_delete.sh
				sleep 10s
				cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/simple-payload
				rm *.json
				cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/helpers
				source generateDrugs.sh 10
				source generateCompanies.sh
				sleep 10s
				cd /home/ubuntu/HyperLedgerLab-2.0/scripts
				echo "************running network_run************"
				./network_run.sh
				sleep 15s
				echo "************running caliper_run************"
				cd /home/ubuntu/HyperLedgerLab-2.0/scripts
				./caliper_run.sh "$chaincodeId"
				wait
				sleep 5s
				manager=$(kubectl get pods -o=jsonpath='{range .items..metadata}{.name}{"\n"}{end}' | fgrep manager)
				cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/"$targetDirectory"
				wait
				echo "target is $value.log"
				kubectl logs $manager > "$value.log"
			done
		done
	done
done	 
