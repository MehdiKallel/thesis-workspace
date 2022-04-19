from ast import parse
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import re

values = {'Size': None,'Succ': None, 'Fail': None, 'Send Rate (TPS)': None, 'Max Latency': None, 'Min Latency (s)' : None, 'Avg Latency (s)' : None, 'Throughput (TPS)' : None, 'Experiment' : None }
results = pd.DataFrame()
for name in os.listdir("./"):
    if("_results" in name):
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
results.Size = pd.to_numeric(results.Size, errors='coerce')
print((os.getcwdb()).decode('utf8').split('/'))
print(results.dtypes)
print(results.sort_values(by=['Size']))
results = results.rename(columns={"Size": "Payload_size", "Max Latency": "MaxLat", "Min Latency" : "MinLat"})


df = results
df['Program'] = df.index
df['%'] = df['Fail']/(df['Succ'] + df['Fail'])*100
#df = df[(df['Experiment'] != 3) & (df['%'] == 100)] 
print(df.dtypes)

df = df[df['%'] == 0]
latency = df.groupby('Payload_size')['AvgLat'].mean().reset_index()


print(latency)
throughput = df.groupby('Payload_size')['Throughput(TPS)'].mean().reset_index()
failSucc = df.groupby('Payload_size')['%'].mean().reset_index()

#df.groupby('Payload_size')['AvgLat'].mean()
#x = sns.catplot( x="Payload_size", y="AvgLat", hue="Experiment", kind="swarm", data=df, aspect=2)
print(df)
print(df.dtypes)
print(latency)
print(latency.dtypes)
#g = sns.factorplot(x="Payload_size", y="AvgLat", hue='Experiment', data=df)
a = sns.lineplot(data=throughput, x="Payload_size", y="Throughput(TPS)", marker='o')
a.set(xlabel='payload size (Byte)', ylabel='Throughput (TPS)')
plt.savefig('./failureTrans.png', dpi=1080)

