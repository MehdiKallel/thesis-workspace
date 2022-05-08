import re
import sys

target = sys.argv[1]

fout = open('../newConfig.yaml', 'wt')
with open('../config.yaml', 'rt') as f:
    lines = f.readlines()
    for line in lines:
        if "module" in line:
            print(type(line))
            list = line.split('/')
            print(list[2])
            toReplace = list[2]
            fout.write(line.replace(str(list[2]),target+',\n'))
        else:
            fout.write(line)
f.close()
fout.close()
