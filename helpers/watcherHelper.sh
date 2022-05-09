#!/bin/bash

#this script will delete Hyperledger Caliper in case the benchmarking gets stuck (due to nodes crash)

while true
do
        target=$(kubectl get pods | grep "caliper-manager"| awk '{print $5}')
        if [[ "$target" == "15m" ]];
                then
                        echo "Destroying manager"
                        source ./HyperLedgerLab-2.0/scripts/caliper_delete.sh
			break
                else
                        echo "caliper manager age is $target"
        fi
done 
