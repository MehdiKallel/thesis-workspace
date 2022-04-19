import re
import sys

target = sys.argv[1]

fout = open('../newConfig.yaml', 'wt')
with open('../config.yaml', 'rt') as f:
    lines = f.readlines()
    for line in lines:
        if "tps" in line:
            print(type(line))
            list = line.split()
            toReplace = list[7]
            fout.write(line.replace(str(list[7]),target))
        else:
            fout.write(line)
f.close()
fout.close()
