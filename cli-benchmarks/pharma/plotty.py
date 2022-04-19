from ast import parse
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import re

values = {'Size': None,'Succ': None, 'Fail': None, 'Send Rate (TPS)': None, 'Max Latency': None, 'Min Latency (s)' : None, 'Avg Latency (s)' : None, 'Throughput (TPS)' : None, 'Experiment' : None, 'ExperimentFunc': None }
results = pd.DataFrame()
for name in os.listdir("./"):
    if( ("createOrderRichQueryUpdated.js_" in name)):
        print(name)
        for filename in os.listdir('./'+name):
            if filename.endswith('.log'):
                with open(os.path.join('./'+name, filename)) as f:
                    lines = f.readlines()
                count = 0
                for line in lines:
                    if ( line.startswith('|')):
                        parsedValues = [float(s) for s in re.findall(r'-?\d+\.?\d*', line)]
                        if(len(parsedValues) != 8):
                            print(parsedValues)
                            print(len(parsedValues))
                            temp ={
                                'Size': int(filename.split('.')[0]),
                                'Succ': parsedValues[1],
                                'Fail': parsedValues[2],
                                'Send Rate (TPS)': parsedValues[3],
                                'Max Latency': parsedValues[4],
                                'Min Latency' : parsedValues[5],
                                'AvgLat': parsedValues[6],
                                'Throughput(TPS)': 0,
                                'Experiment': name.split('_')[-2],
                                'ExperimentFunc': name.split('_')[0]+name.split('_')[-2]
                        }
                        else:
                            temp ={
                                'Size': int(filename.split('.')[0]),
                                'Succ': parsedValues[1],
                                'Fail': parsedValues[2],
                                'Send Rate (TPS)': parsedValues[3],
                                'Max Latency': parsedValues[4],
                                'Min Latency' : parsedValues[5],
                                'AvgLat': parsedValues[6],
                                'Throughput(TPS)': parsedValues[7],
                                'Experiment': name.split('_')[-2],
                                'ExperimentFunc': name.split('_')[0]+name.split('_')[-2]
                            }
                        temp = pd.DataFrame([temp])
                        results = pd.concat([results, temp])
                    if ( line.startswith('|')):
                        count += 1
                result = list(values.items())
results = results.rename(columns={"Size": "Payload_size", "Max Latency": "MaxLat", "Min Latency" : "MinLat"})
print(results)

df = results
print(df)
