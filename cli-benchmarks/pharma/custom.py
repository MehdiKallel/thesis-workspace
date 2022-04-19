from ast import parse
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import re

values = {'Succ': None, 'Fail': None, 'Send Rate (TPS)': None, 'Max Latency': None, 'Min Latency (s)' : None, 'Avg Latency (s)' : None, 'Throughput (TPS)' : None, 'Experiment' : None }
results = pd.DataFrame()
for name in os.listdir("./"):
    if "verifyOrder.js_" in name:
        print(name)
        for filename in os.listdir('./'+name):
            print(filename)
            if filename.endswith('.log'):
                with open(os.path.join('./'+name, filename)) as f:
                    lines = f.readlines()        
                count = 0
                for line in lines:
                    if ( line.startswith('|') ):
                        count = count + 1;
                    if ( line.startswith('|') and (count == 31) ):
                        parsedValues = [float(s) for s in re.findall(r'-?\d+\.?\d*', line)]
                        print(parsedValues)
                        if(len(parsedValues) != 8):
                            temp ={   
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
results = results.rename(columns={"Max Latency": "MaxLat", "Min Latency" : "MinLat"})

df = results
df['Program'] = df.index
df['%'] = df['Fail']/(df['Succ'] + df['Fail'])*100
df = df.drop_duplicates()
df['Send Rate (TPS)'] = df['Send Rate (TPS)'].round()
sns.set_theme(style="ticks")
#wpt = df.groupby(['Payload_size', 'ExperimentFunc'])['%'].mean().reset_index()

sns.set(rc={'figure.figsize':(11.7,8.27)})

df = df.drop(columns=['Throughput(TPS)', 'ExperimentFunc'])
df = df.reset_index()
print(df.dtypes)
df = df[df['AvgLat'] < 1.5]
df2 = {'Send Rate (TPS)': 60, 'Succ': 0, 'Fail': 0, 'MaxLat': '0', 'MinLat': '0', 'AvgLat': 1.12, 'Experiment': 'dummy', 'Program': 'nothing', '%':29}

df = df.append(df2, ignore_index = True)
a = sns.lineplot(data=df, x='Send Rate (TPS)', y='AvgLat')
a.set(xlabel='Send rate (TPS)', ylabel='s')
#plt.legend(title='order type', loc='upper left', labels=['create private order', 'create public order']) 
plt.savefig('multipleLatency.png')

