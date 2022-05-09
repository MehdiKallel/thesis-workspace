from ast import parse
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import re

values = {'Size': None,'Succ': None, 'Fail': None, 'Send Rate (TPS)': None, 'Max Latency': None, 'Min Latency (s)' : None, 'Avg Latency (s)' : None, 'Throughput (TPS)' : None, 'Experiment' : None }
results = pd.DataFrame()
for name in os.listdir("./"):
    if("addcomplaints__" in name):
        print(name)
        for filename in os.listdir('./'+name):
            print(filename)
            if filename.endswith('.log'):
                with open(os.path.join('./'+name, filename)) as f:
                    lines = f.readlines()        
                count = 0
                for line in lines:
                    if ( line.startswith('|') and (count == 2) ):
                        print(line)
                        parsedValues = [float(s) for s in re.findall(r'-?\d+\.?\d*', line)]
                        print(len(parsedValues))
                        print(name)
                        print(filename)
                        if(len(parsedValues) != 8):
                            temp ={   
                            'Size': int(filename.split('.')[0]),
                            'Succ': parsedValues[1],
                            'Fail': parsedValues[2],
                            'Send Rate (TPS)': parsedValues[3],
                            'Max Latency': parsedValues[4],
                            'Min Latency' : parsedValues[5],
                            'AvgLat': parsedValues[6],
                            'Throughput(TPS)': 0,
                            'Experiment': name.split('_')[-2]
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
                                'Experiment': name.split('_')[-2]
                            }
                        temp = pd.DataFrame([temp])
                        results = pd.concat([results, temp])
                    if ( line.startswith('|')):
                        count += 1
                result = list(values.items())
print((os.getcwdb()).decode('utf8').split('/'))
print(results.dtypes)
results = results.rename(columns={"Size": "Payload_size", "Max Latency": "MaxLat", "Min Latency" : "MinLat"})
df = results
df['Program'] = df.index
df['%'] = df['Fail']/(df['Succ'] + df['Fail'])*100

latency = df.groupby('Payload_size')['AvgLat'].mean().reset_index()
throughput = df.groupby('Payload_size')['Throughput(TPS)'].mean().reset_index()

# relation payload - latency clean
a = sns.lineplot(data=latency, x="Payload_size", y="AvgLat")
a.set(xlabel='payload size (Byte)', ylabel='(s)')
plt.savefig('./avgLatencyLinearClean.png', dpi=1080)
plt.figure()

# relation payload - throughput clean
a = sns.lineplot(data=throughput, x="Payload_size", y="Throughput(TPS)")
a.set(xlabel='payload size (Byte)', ylabel='TPS')
plt.savefig('./avgThroughputLinearClean.png', dpi=1080)
