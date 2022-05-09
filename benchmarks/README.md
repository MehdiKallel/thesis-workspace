## workloads for the developped chaincodes
this directory contains, workloads and config files to assess the performance of the chaincodes functions. Some of the functions may require to initialize assets on the Ledger. For example, when using the "createOrder.js" as workload, we assume that the Ledger is already populated with companies and drugs. We also assume that CouchDB is used as state database. 

## Pharmaceutical supplychain system

- createOrderRichQuery.js: performs an order creation relying on rich query (ledger must be populated with drugs and companies)
- createOrder.js: performs a public order creation relying on composite-based query (ledger must be populated with drugs and companies)
- createPrivateOrder.js: performs a private order creating with the private price stored in the private data collection of the seller (ledger must be populated with drugs and companies)
- addDrug.js: add a drug asset to the ledger ( ledger must be populated with companies)
- createShipment.js: performs a shipment creation by appending the requested drugs by the buyer to a shipment asset that will be added to the ledger (ledger must be populated with drugs, companies and orders) 
- verifyOrderDetails.js: the buyer confirms the price of the order by updating its status (this step can be performmed using several patterns) (ledger must be populated with drugs, companies and orders)


## TUM-Hash

- addComplaints.js: add complaints of a specific size. The payload can be specified  using the complaintsGenerator.js script under /thesis-workspace/benchmarks/pharmaceutical-supplychain/helpers (number of subjects on the ledger can be defined in the config file)
- sendReviewMessge.js: send a message of a specific size between 2 registered users of a network



## Loyalty plaform
- matrix.js: square matrix multiplication of size n (the experiment worker has control over the size of the matrix) 

## simple-payload

includes workloads testing basic functions provided by the node chaincode api.


## License
[MIT](https://choosealicense.com/licenses/mit/)
