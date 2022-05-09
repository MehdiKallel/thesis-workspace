## Data visualization
This directory inclues useful scripts to plot the obtained results from Hyperledger Caliper. Each use case has a plotter script that should be modified according to the function, which is plotted but also according to the data plotted. By default, the script will deliver 2 plots:

- relation between throughput and payload size
- relation between transaction latency and payload size

the current script can be extended to add a plot showing the transaction failure rates or the relation between the throughput and tranasction latency.


run the following commands in your terminal under your project root directory:
1. `npm install prompt-sync`
2. `pip3 install pandas`
3. `pip3 install seaborn`
4. to plot results of a specifc workload `python3 plotter.py $(name of the workload).js`


## License
[MIT](https://choosealicense.com/licenses/mit/)
