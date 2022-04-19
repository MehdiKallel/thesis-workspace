import re
import sys

target = sys.argv[1]

fout = open('../newConfig.yaml', 'wt')
with open('../config.yaml', 'rt') as f:
    lines = f.readlines()
    for line in lines:
        if "assets" in line:
            print(type(line))
            list = line.split(',')
            print(list[1])
            toReplace = list[1]
            fout.write(line.replace(str(list[1]),'assets: '+target))
        else:
            fout.write(line)
f.close()
fout.close()
