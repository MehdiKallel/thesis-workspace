from ast import parse
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import re

values = {'Size': None,'Succ': None, 'Fail': None, 'Send Rate (TPS)': None, 'Max Latency': None, 'Min Latency (s)' : None, 'Avg Latency (s)' : None, 'Throughput (TPS)' : None, 'Experiment' : None }
results = pd.DataFrame()
for name in os.listdir("./"):
    if((".js_" in name) and (('createPrivateOrder' in name))):
        print(name)
        for filename in os.listdir('./'+name):
            print(filename)
            if filename.endswith('.log'):
                with open(os.path.join('./'+name, filename)) as f:
                    lines = f.readlines()        
                count = 0
                for line in lines:
                    if ( line.startswith('|') ):
                        print(line)
                        count = count + 1;
                    if ( line.startswith('|') and (count == 2) ):
                        print(line)
                        parsedValues = [float(s) for s in re.findall(r'-?\d+\.?\d*', line)]
                        print(len(parsedValues))
                        print(name)
                        print(filename)
                        print(name.split('_'))
                        if(len(parsedValues) != 8):
                            temp ={   
                            'Size': name.split('_')[1],
                            'Succ': parsedValues[1],
                            'Fail': parsedValues[2],
                            'Send Rate (TPS)': parsedValues[3],
                            'Max Latency': parsedValues[4],
                            'Min Latency' : parsedValues[5],
                            'AvgLat': parsedValues[6],
                            'Throughput(TPS)': 0,
                            'Experiment': name.split('_')[-2],
                            'ExperimentFunc': name.split('_')[0]
                        }
                        else:
                            temp ={   
                                'Size': name.split('_')[1],
                                'Succ': parsedValues[1],
                                'Fail': parsedValues[2],
                                'Send Rate (TPS)': parsedValues[3],
                                'Max Latency': parsedValues[4],
                                'Min Latency' : parsedValues[5],
                                'AvgLat': parsedValues[6],
                                'Throughput(TPS)': parsedValues[7],
                                'Experiment': name.split('_')[-2],
                                'ExperimentFunc': name.split('_')[0]
                            }
                        temp = pd.DataFrame([temp])
                        results = pd.concat([results, temp])
                    if ( line.startswith('|')):
                        count += 1
                result = list(values.items())
results.Size = pd.to_numeric(results.Size, errors='coerce')
results = results.rename(columns={"Size": "Payload_size", "Max Latency": "MaxLat", "Min Latency" : "MinLat"})

print(results)
df = results
df = df[df['Throughput(TPS)'] > 15 ]
print(results)
df['Program'] = df.index
df['%'] = df['Fail']/(df['Succ'] + df['Fail'])*100
df = df.drop_duplicates()
df['Send Rate (TPS)'] = df['Send Rate (TPS)'].round()
sns.set_theme(style="ticks")
df['ExperimentFunc'] = df['ExperimentFunc'].replace('createPrivateOrderUpdated.js', 'create private order')
df['ExperimentFunc'] = df['ExperimentFunc'].replace('createOrderUpdatedSimple.js', 'create public order')
print(df)
wpt = df.groupby(['Payload_size', 'ExperimentFunc'])['%'].mean().reset_index()
print(wpt)
sns.set(rc={'figure.figsize':(11.7,8.27)})

a = sns.lineplot(data=wpt, x='Payload_size', y='AvgLat', hue="ExperimentFunc")
a.set(xlabel='number of assets', ylabel='%')
plt.savefig('latency.png')

a = sns.lineplot(data=wpt, x='Payload_size', y='Throughput (TPS)', hue="ExperimentFunc")
a.set(xlabel='number of assets', ylabel='TPS')
plt.savefig('throughput.png')




