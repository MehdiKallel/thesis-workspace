import re
import sys

target = sys.argv[1]
counter = 0;
fout = open('../newConfig.yaml', 'wt')
with open('../config.yaml', 'rt') as f:
    lines = f.readlines()
    for line in lines:
        if ("tps" in line):
            counter = counter + 1;
        if ("tps" in line) and (counter == 3):
            print(line)
            if counter == 3:
                print(type(line))
                list = line.split()
                print(list)
                toReplace = list[7]
                fout.write(line.replace(str(list[7]),target))
        else:
            fout.write(line)
f.close()
fout.close() 
