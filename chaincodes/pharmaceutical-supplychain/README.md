## Hyperledger Fabric Chaincode for drug traceability

Counterfeiting drugs is a big issue in the pharmaceutical industry. The increasing public use of online pharmacies has made the monitoring of the drug supply chain process complicated. This chapter proposes a blockchain-based system that tracks drugs in the supply chain process. The proposed Chaincode makes it possible to execute transactions between different organizations without a trusted centralized authority and provides records of every transaction performed on the network. The developed Chaincode also demonstrates the use of private data collection in Hyperledger Fabric.

## System overview

This chaincode is intended to be installed on all Organizations peers and three channels are needed for the supply chain system:

- ch1: channel linking the Manufacturer to the Distributor
- ch2: channel linking the Distributor to the Retailer
- ch3: channel linking the Retailer to the Consumer

The Transporter is supposed to be joining all channels to be able to trace drugs, shipments and drugs from the Seller to the Buyer. 

The use of private data collections depends on the private data sharing pattern. When the protection of sensitive information on the same channel is desired, private data collections should be implemented. The chaincode allows you as a seller to hide the order price of one of your customers from other customers. 


![Alt text](./images/architecture.png?raw=true "blockchain network setup")



*Note: for the sake of simplicity and also because HyperledgerLab2 doesn't support the configurations of channels number, private data access control using the the client credentials (for example using GetMSPID()) wasn't implemented.*


## Folder structures
```
|- META-INF/statedb/couchdb/indexes/                  ... drug index used by rich queries
|- lib/                     			      ... includes the types of data existing on the Ledger
|- utils/               			      ... includes functions to add assets to the ledger using composite key, composte-key based queries, rich queries...
```

## Chaincode usage on HyperledgerLab-2.0
*Prerequisite: HyperledgerLab-2.0 is set up and a k8s cluster of 3 nodes is deployed*

1. Clone the repository under /HyperLedgerLab-2.0/fabric/chaincode

```
git clone https://gitlab.lrz.de/ge72zar/thesis-workspace.git
cp -r thesis-workspace/chaincodes/pharmaceutical-supplychain ./
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
      - id: pharmaceutical-supplychain
        contractID: pharmaceutical-supplychain           # NOTE: This should be unique for chaincodes across channels
        path: "chaincode/pharmaceutical-supplychain"      # NOTE: Relative path to Directory where chaincode file is located
        language: node
        version: v1

```

3. Run the blockchain network setup script:

```
cd ..
./scripts/network_run.sh
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
