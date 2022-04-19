jq -c '.[]' myfile.json | while read i; do
    echo $i
done
