from ast import parse
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import re

values = {'Size': None,'Succ': None, 'Fail': None, 'Send Rate (TPS)': None, 'Max Latency': None, 'Min Latency (s)' : None, 'Avg Latency (s)' : None, 'Throughput (TPS)' : None }
results = pd.DataFrame()
print [for name in os.listdir("./") print name]

for name in os.listdir("./"):
    if("_results" in name):
        for filename in os.listdir('./'+name):
            if filename.endswith('.log'):
                with open(os.path.join('./', filename)) as f:
                    lines = f.readlines()        
                count = 0
                for line in lines:
                    if ( line.startswith('|') and (count == 2) ):
                        parsedValues = [float(s) for s in re.findall(r'-?\d+\.?\d*', line)]
                        temp ={   
                            'Size': int(filename.split('.')[0]),
                            'Succ': parsedValues[1],
                            'Fail': parsedValues[2],
                            'Send Rate (TPS)': parsedValues[3],
                            'Max Latency': parsedValues[4],
                            'Min Latency' : parsedValues[5],
                            'AvgLat': parsedValues[6],
                            'Throughput(TPS)': parsedValues[7]
                        }
                        temp = pd.DataFrame([temp])
                        results = pd.concat([results, temp])
                    if ( line.startswith('|')):
                        count += 1
                result = list(values.items())
results.Size = pd.to_numeric(results.Size, errors='coerce')
results['experiment']=os.getcwdb().decode('utf8').split('/')[-1].split('_')[-2]

print((os.getcwdb()).decode('utf8').split('/'))
print(results.dtypes)
print(results.sort_values(by=['Size']))
results = results.rename(columns={"Size": "Payload_size", "Max Latency": "MaxLat", "Min Latency" : "MinLat"})


df = results
df['Program'] = df.index
df['%'] = df['Succ']/(df['Succ'] + df['Fail'])*100

print(df)
print(df.dtypes)
print(df.columns.duplicated().any)
df = df.reset_index(drop=True)

#line plot latency
sns.lineplot(data=df, x='Payload_size', y='MaxLat', color="firebrick", marker='o', label='Max latency').set(title='Latency for different payload sizes - addComplaints 30TPS')
sns.lineplot(data=df, x='Payload_size', y='MinLat', color="green", marker='o', label='Min latency')
sns.lineplot(data=df, x='Payload_size', y='AvgLat', marker='o', label='Avg latency' ).set(ylabel='Latency (s)')
plt.show()
plt.savefig('./latency.png', dpi=1080)
print('passed')
plt.figure()
sns.lineplot(data=df, x='Payload_size', y='%', color="firebrick", marker='o').set(title='% Success for different payload sizes - sendReview 30TPS')
sns.lineplot().set(ylabel='testing')

#line plot %success
plt.savefig('./failure_perc_transactions.png', dpi=1080)
plt.figure()

#line plot Throughput 
sns.lineplot(data=df, x='Payload_size', y='Throughput(TPS)', color="firebrick", marker='o').set(title='Throughput for different payload sizes - sendReview 30TPS')
plt.savefig('./throughput.png', dpi=1080)
