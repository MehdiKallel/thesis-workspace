from ast import parse
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import re

values = {'Size': None,'Succ': None, 'Fail': None, 'Send Rate (TPS)': None, 'Max Latency': None, 'Min Latency (s)' : None, 'Avg Latency (s)' : None, 'Throughput (TPS)' : None, 'Experiment' : None, 'ExperimentFunc': None }
results = pd.DataFrame()
for name in os.listdir("./"):
    if( (".js_" in name) and ("read" in name) ):
        print(name)
        for filename in os.listdir('./'+name):
            if filename.endswith('.log'):
                with open(os.path.join('./'+name, filename)) as f:
                    lines = f.readlines()
                count = 0
                for line in lines:
                    if ( line.startswith('|') and ("add complaints" in line)):
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
results.Size = pd.to_numeric(results.Size, errors='coerce')

results = results.rename(columns={"Size": "Payload_size", "Max Latency": "MaxLat", "Min Latency" : "MinLat"})


df = results
df['Program'] = df.index
df['%'] = df['Fail']/(df['Succ'] + df['Fail'])*100
df = df.drop_duplicates()
df['Send Rate (TPS)'] = df['Send Rate (TPS)'].round()
#df =df[(df['Experiment'] != 3) & (df['%'] == 100)] 
print(df)

#df = df[df['Throughput(TPS)'] > 10]
dfnof = df
dfnof['Prog'] = dfnof.index
latency = dfnof.groupby('Payload_size')['AvgLat'].mean().reset_index()
throughput = dfnof.groupby('Payload_size')['Throughput(TPS)'].mean().reset_index()

sns.set_theme(style="ticks")
custom_palette = {}
for q in set(df['ExperimentFunc']):
        if "Hash" in q:
            custom_palette[q] = '#00bbaf'
        elif "Private" in q:
            custom_palette[q] = '#cb0056'
        elif "Public" in q:
            custom_palette[q] = '#282826'


# % failed all
x = sns.catplot( x="Payload_size", y="%", hue="ExperimentFunc", kind="swarm", data=df, aspect=2, palette=custom_palette)
plt.savefig('./allFailure.png', dpi=1080)
plt.figure()


x = sns.catplot( x="Payload_size", y="AvgLat", hue="ExperimentFunc", kind="swarm", data=df, aspect=2, palette=custom_palette)
plt.savefig('./allAvgLatency.png', dpi=1080)
plt.figure()


x = sns.catplot( x="Payload_size", y="Throughput(TPS)", hue="ExperimentFunc", kind="swarm", data=df, aspect=2, palette=custom_palette)
plt.savefig('./allAvgThroughput.png', dpi=1080)
plt.figure()


x = sns.catplot( x="Throughput(TPS)",y="AvgLat", hue="ExperimentFunc", kind="swarm", data=df, aspect=2, palette=custom_palette)
plt.savefig('./relation.png', dpi=1080)
plt.figure()



print(latency)
print(latency.dtypes)
#g = sns.factorplot(x="Payload_size", y="AvgLat", hue='Experiment', data=)
# relation payload - latency clean
a = sns.lineplot(data=latency, x="Payload_size", y="AvgLat", marker='o')
x.set(xlabel='payload size (Byte)', ylabel='(s)')
plt.savefig('./avgLatencyLinearClean.png', dpi=1080)
plt.figure()

# relation payload - throughput clean
a = sns.lineplot(data=throughput, x="Payload_size", y="Throughput(TPS)", marker='o')
x.set(xlabel='payload size (Byte)', ylabel='TPS')
plt.savefig('./avgThroughputLinearClean.png', dpi=1080)

throughput = throughput.sort_values(by='Payload_size')
latency = latency.sort_values(by='Payload_size')
merged = pd.merge(throughput,latency, on='Payload_size')
print(merged)
plt.figure()
# relation latency - throughput clean
a = sns.lineplot(data=merged, x="Throughput(TPS)", y="AvgLat", marker='o')
x.set(xlabel='throughput (TPS)', ylabel='latency (s)')
plt.savefig('./relationThroughputLatencyClean.png', dpi=1080)
plt.figure()
#evolution throughput (comparision between 3: linear)
df['functionType'] = df['ExperimentFunc'].str[:-4]
print(df)
wpt = df.groupby(['Payload_size', 'functionType'])['AvgLat'].mean().reset_index()
print(wpt)
print(wpt.dtypes)
a = sns.lineplot(data=wpt, x='Payload_size', y='AvgLat', hue="functionType")
a.set(xlabel='Payload size in Bytes', ylabel='Transaction latency in s')
#plt.legend(loc='upper left', labels=['private write without transient input', 'private write with transient input', 'public write'])
plt.savefig('multipleLatency.png')


plt.figure()
wpl =  df.groupby(['Payload_size', 'functionType', 'Send Rate (TPS)'])['%'].mean().reset_index()
#a = sns.lineplot(data=wpl, x='Payload_size', y='Throughput(TPS)', hue=wpl[["functionType", 'Send Rate (TPS)']].apply(tuple,axis=1))
#a.set(xlabel='Payload size in Bytes', ylabel='Transaction throughput in txs/s')
#plt.legend(loc='upper left', labels=['private write without transient input', 'private write with transient input', 'public write'])
#plt.savefig('multipleThroughput.png')

plt.figure()





#wpl = wpl[wpl['Throughput(TPS)'] != 0 ] 
df30 = wpl[wpl['Send Rate (TPS)'] == 90]
df60 = wpl[wpl['Send Rate (TPS)'] == 60]
df90 = wpl[wpl['Send Rate (TPS)'] == 60]
df30.loc[len(df30.index)] = [ 500, 'readPrivateHash', 60, 58]
df30.loc[len(df30.index)] = [ 10000, 'readPrivateHash', 60, 57]

print(df30)
a = sns.barplot(data=df30, x='Payload_size', y='%', hue="functionType", ci=None)
a.set(xlabel='Payload size in Bytes', ylabel='%')
#plt.legend(loc='upper left', labels=['private write without transient input', 'private write with transient input', 'public write'])
#plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0)
#a.legend(loc='upper left', bbox_to_anchor=(1.05, 1), borderaxespad=0)
plt.gca().legend().set_title('')
sns.move_legend(a, "lower center", bbox_to_anchor=(.5, 1), ncol=3, title_fontsize=14)
plt.savefig('multipleBar.png')
