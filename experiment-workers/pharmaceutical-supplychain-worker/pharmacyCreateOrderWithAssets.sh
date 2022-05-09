#!/bin/bash
echo "Which Chaincode do you want to test? - press Enter after input"
read c;
chaincodeId=$c

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

assets=()
echo "Please enter the assets list then exit"
while IFS= read -r line; do
	[[ $line = exit ]] && break
	if [[ "$line" =~ ^[0-9]+$ ]];
	then assets+=( "$line" );
	fi
done
echo "****************PS input completed****************"


for t in "${functions[@]}"
do
	jsFile=$t
	echo $t
	for n in "${assets[@]}"
	do
		currentAsset=$n
		for (( j=0; j<$x; j++))
		do
			:
			targetDirectory="${jsFile}_${currentAsset}_${j}_results"
			echo "****************Creating result directory $j for $currentTPS TPS****************"
			
			mkdir -p  /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/"$targetDirectory"
			
			echo "****************Running experiment: $j with $currentAsset****************"
			sleep 4s	
			
			echo "****************populating ledger ****************"
			cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"
			rm config.yaml
			cp populatorConfig/config.yaml ./
			goal=$(($currentAsset/50))
			cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/helpers
			python3 scriptConfigAssetsUpdated.py $goal
			cd ..
			rm config.yaml
			mv newConfig.yaml config.yaml		
			
			
			cd /home/ubuntu/HyperLedgerLab-2.0/scripts
			echo "************deleting network************"	
			source network_delete.sh
			sleep 10s
			echo "************deleting caliper************"
			cd /home/ubuntu/HyperLedgerLab-2.0/scripts
			source caliper_delete.sh	
			
			cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"
			cd /home/ubuntu/HyperLedgerLab-2.0/scripts
			echo "************running network_run************"
			source network_run.sh

			sleep 15s
			cd /home/ubuntu
			bash watcherHelper.sh &
			echo "************running caliper_run for populator************"
			cd /home/ubuntu/HyperLedgerLab-2.0/scripts
			source caliper_run.sh "$chaincodeId"

			manager=$(kubectl get pods -o=jsonpath='{range .items..metadata}{.name}{"\n"}{end}' | fgrep manager)
			cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"
			mkdir "${jsFile}_${currentTPS}_${j}_results_addDrug"
			cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/"${jsFile}_${currentAsset}_${j}_results_addDrug"
			kubectl logs $manager > "$j.log"
			ps -ef | grep 'watcherHelper' | grep -v grep | awk '{print $2}' | xargs -r kill -9
			cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"
			rm config.yaml
			cp function/config.yaml ./
			cd helpers
			python3 scriptConfigFunction.py $jsFile
			cd ..
			rm config.yaml
			mv newConfig.yaml config.yaml
			echo "************deleting caliper from  populator************"
			cd /home/ubuntu/HyperLedgerLab-2.0/scripts
			source caliper_delete.sh
			
			
			sleep 10s
			cd /home/ubuntu
			
			echo "*******launching watcher*******"
			bash watcher.sh &	
			check=$(kubectl get pods | grep "peer"| head -1 | awk '{print $3}')
			echo $check
			cd /home/ubuntu/HyperLedgerLab-2.0/scripts
			source caliper_run.sh "$chaincodeId"
			manager=$(kubectl get pods -o=jsonpath='{range .items..metadata}{.name}{"\n"}{end}' | fgrep manager)
			cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/"$targetDirectory"
			echo "target is $value.log"
			kubectl logs $manager > "$j.log"
			ps -ef | grep 'watcher' | grep -v grep | awk '{print $2}' | xargs -r kill -9
		done
	done 
done	 
