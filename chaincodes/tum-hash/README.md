## TUM-Hash: a blockchain based review system
Nowadays, and mainly since the start of the pandemic, most examinations [11] have been conducted online due to the COVID-19 pandemic. Trust, transparency, and security are three major concerns for students willing to get fair grades. Usually, after the examinations phase comes the review phase. During this phase, students submit their complaints on a TUM-Exam platform, and after some time, they get feedback. If their complaints are approved, their respective grades are updated and validated on TUMOnline. This chapter proposes a Blockchain-based system for conducting exam reviews transparently. In this application, students register themselves on the platform and upload the exam that they want to get reviewed. A hash is then computed for the uploaded exam. The latter is accessible via a hash that is kept secret and off-chain. After a successful upload, the student adds his complaints about a specific exam. A tutor can then check the complaints, accept them or refuse them and update the total exam points.
## System overview

This chaincode is intended to be installed on all Organizations peers and only 1 channel is needed. 3 Organizations are involved in the the blockchain network: Professors, Students and Tutors.

## Usage on Hyperledger Fabric
1. Clone the repository under /HyperLedgerLab-2.0/fabric/chaincode

```
git clone https://gitlab.lrz.de/ge72zar/thesis-workspace.git
cp -r thesis-workspace/chaincodes/tum-hash ./
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
      - id: tum-hash
        contractID: tum-hash           # NOTE: This should be unique for chaincodes across channels
        path: "chaincode/tum-hash"      # NOTE: Relative path to Directory where chaincode file is located
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
