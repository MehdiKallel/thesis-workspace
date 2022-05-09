#!/bin/bash
echo "Which Chaincode do you want to test?"
read c;
chaincodeId=$c

echo "Please enter the payloads sizes that you want to test (min payload size: 80B) - type exit then enter"
payloads=()
tps=()
workloads=()
while IFS= read -r line; do
        [[ $line = exit ]] && break
        if [[ "$line" =~ ^[0-9]+$ ]];
        then payloads+=( "$line" );
        fi
done
echo "****************Payloads inputs completed****************"
echo "You entered ${#payloads[@]} correct payload(s)"
for i in "${payloads[@]}"
do
        :
        echo $i
done

sleep 5s

echo "Please enter the TPS list then exit"
while IFS= read -r line; do
        [[ $line = exit ]] && break
        if [[ "$line" =~ ^[0-9]+$ ]];
        then tps+=( "$line" );
        fi
done
echo "****************PS input completed****************"

echo "Please enter the workloads list then exit"
while IFS= read -r line; do
        [[ $line = exit ]] && break
        if [[ "$line" =~ ^[0-9]+$ ]];
        then workloads+=( "$line" );
        fi
done
echo "****************workloads input completed****************"

for i in "${workloads[@]}"
do
        :
        echo $i
done
sleep 3s
echo -n "How many rounds do you want to run? - press enter";
read x;
echo "****************Rounds input saved****************"
wait

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
                targetDirectory="${currentTPS}_${j}_results"
                echo "****************Creating result directory $j for $currentTPS TPS****************"
                mkdir -p  /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/"$targetDirectory"

                echo "****************Running experiment: $j with $currentTPS ****************"
                sleep 4s
                for i in "${payloads[@]}"
                do
                        :
                        echo "****************Beginning benchmark with payload of $i Bytes"****************
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
                        rm *users*
                        rm *complaints*
                        cd /home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/"$chaincodeId"/helpers
                        node complaintsGenerator.js $i $i 1
                        source generateUsers.sh
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
                                                              
~                       
