## Loyalty Platform with tokenized rewards
Loyalty programs are on the rise in retail, hospitality and airlines and will be here forever Reason: Consumers who accept (and approve) the rewards program Nearly 80% more likely to continue spending on the brand. However, when customers stop participating in benefits, it affects the bottom of the brand The line is huge. Nearly $100 billion in points go unused each year Missed Consumer Engagement Opportunities and Balance Sheet Liability Comparison The cost of marketing and maintenance programs. Help consumers solidify their rewards program and help brands win back Client Mindtree develops $wap, a blockchain-based loyalty exchange platform Customers can redeem reward points for supplier goods and services.

## System overview

This chaincode is intended to be installed on all Organizations peers and only 1 channel is needed. 2 Organizations are involved in the the blockchain network: Retailers and Customers. The development of this Chaincode was intended to to evaluate the performane of Hyperledger Fabric under heavy CPU demanding transactions. Therefore, only one function was used for this purpose: a matrix multiplication function. The function takes as input an argument n and computes the square matrix multiplication of size n.

## Usage on Hyperledger Fabric
1. Clone the repository under /HyperLedgerLab-2.0/fabric/chaincode

```
git clone https://gitlab.lrz.de/ge72zar/thesis-workspace.git
cp -r thesis-workspace/chaincodes/loyalty-platform ./
rm -r thesis-workspace
```

2. Setup the blockchain network configuration file ```network-configuration.yaml``` under /HyperledgerLab-2.0/fabric by using the following setup:

```
fabric_num_orgs: 2
fabric_peers_per_org: 2
fabric_num_orderer: 2
stateDatabase: CouchDB
fabric_batch_timeout: "1s"
fabric_batchsize: ["300", "98 MB", "10 MB"]
fabric_tls_enabled: false
rule: "OutOf(1, 'Org1MSP.member', 'Org2MSP.member')"        # e.g "OR('Org1MSP.member', 'Org2MSP.member')"
channels:                   # List of channel objects
  - name: "mychannel"
    chaincodes:
      - id: loyalty-platform
        contractID: loyalty-platform           # NOTE: This should be unique for chaincodes across channels
        path: "chaincode/loyalty-platform"      # NOTE: Relative path to Directory where chaincode file is located
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
