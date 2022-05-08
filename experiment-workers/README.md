## Experiments automation

This script is intended to automate the pharmaceutical supply-chain chaincode benchmarking and plot the obtained results from Hyperledger Caliper logs.


## Usage of pharmaWorker on HyperledgerLab2

1. place the `pharmaWorker.sh` and  `watchHelper.sh` script into your `\home` directory
2. run both scripts: `source pharmaWorker` and  `source watcherHelper.sh` 
3. the results can be plotted 


**Note: the current script conducts an experiment with 10 companies and 20 variety of drugs and a total. The experiment is assessing the "createPrivateOrder" function. To test another function or scenario, some changes need to be made**


## License
[MIT](https://choosealicense.com/licenses/mit/)
