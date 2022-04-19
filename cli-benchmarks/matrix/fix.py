import re
import sys

target = sys.argv[1]

fout = open('./newConfig.yaml', 'wt')
with open('./config.yaml', 'rt') as f:
    lines = f.readlines()
    for line in lines:
        if "size" in line:
            listT = line.split(':')
            toReplace = listT[3]
            fout.write(line.replace(str(toReplace),' '+target + ' },\n'))
        else:
            fout.write(line)

f.close()
fout.close() 
