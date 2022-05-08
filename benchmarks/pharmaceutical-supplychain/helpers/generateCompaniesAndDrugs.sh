#!/bin/bash
curl -H "X-API-Key: c6843060" https://my.api.mockaroo.com/companies.json --output '/home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/basic/companies.json'

curl -H "X-API-Key: c6843060" https://my.api.mockaroo.com/drugs.json --output '/home/ubuntu/HyperLedgerLab-2.0/caliper/benchmarks/basic/drugs.json'
