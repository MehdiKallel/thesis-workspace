import re
import sys

target = sys.argv[1]

fout = open('../newConfig.yaml', 'wt')
i = 0
with open('../config.yaml', 'rt') as f:
    lines = f.readlines()
    for line in lines:
        if (("txDuration" in line) and (i==1)):
            list = line.split(':')
            print(list[1])
            toReplace = list[1]
            fout.write(line.replace(str(list[1]), ' ' + target + '\n'))
            i = i + 1;
        else:
            fout.write(line)
f.close()
fout.close()
