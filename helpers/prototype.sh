#!/bin/bash
while true
do
        target=$(kubectl get pods | grep "peer"| head -1 | awk '{print $3}')
	echo $target
        if [ "$target" == "Running" ]
        then
		echo "not running"
	fi
done            
