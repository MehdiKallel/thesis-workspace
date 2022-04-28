## simple-asset chaincode
This Chaincode is intended to benchmark Hyperledger Fabric v2 simple api functions in Javascript and analyze the effect of the transaction payload on transaction latency and throughput.  

## Chaincode usage on HyperledgerLab-2.0
*Prerequisite: HyperledgerLab-2.0 is set up and a k8s cluster is deployed*

1. Clone the repository under /HyperLedgerLab-2.0/fabric/chaincode

```
git clone https://gitlab.lrz.de/ge72zar/thesis-workspace.git
cp -r thesis-workspace/chaincodes/simple-payload ./
rm -r thesis-workspace
```

2. Setup the blockchain network configuration file ```network-configuration.yaml``` under /HyperledgerLab-2.0/fabric by using the following setup:

```
fabric_num_orgs: 3
fabric_peers_per_org: 2
fabric_num_orderer: 2
stateDatabase: CouchDB
fabric_batch_timeout: "1s"
fabric_batchsize: ["300", "98 MB", "10 MB"]
fabric_tls_enabled: false
rule: "OutOf(1, 'Org1MSP.member', 'Org2MSP.member', 'Org3MSP.member')"        # e.g "OR('Org1MSP.member', 'Org2MSP.member')"
channels:                   # List of channel objects
  - name: "mychannel"
    chaincodes:
      - id: simple-payload
        contractID: simple-payload           # NOTE: This should be unique for chaincodes across channels
        path: "chaincode/simple-payload"      # NOTE: Relative path to Directory where chaincode file is located
        language: node
        version: v1

```

3. Run the blockchain network setup script:

```
cd ..
./scripts/network_run.sh
```

*Note: the organizations names specified in collections_config.json file should match your network organizations names*

## License
[MIT](https://choosealicense.com/licenses/mit/)
