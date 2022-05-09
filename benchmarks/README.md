## workloads for the developped chaincodes
this directory contains, workloads and config files to assess the performance of the chaincodes functions. Some of the functions may require to initialize on the Ledger. For example, when using the "createOrder.js" as workload, we assume that the Ledger is already populated with companies and drugs. We also assume that CouchDB is used as state database. 

## Pharmaceutical supplychain system

- createOrderRichQuery: performs an order creation relying on rich query (ledger must be populated with drugs and companies)
- createOrder: performs a public order creation relying on composite-based query (ledger must be populated with drugs and companies)
- createPrivateOrder: performs a private order creating with the private price stored in the private data collection of the seller (ledger must be populated with drugs and companies)
- addDrug: add a drug asset to the ledger ( ledger must be populated with companies)
- createShipment: performs a shipment creation by appending the requested drugs by the buyer to a shipment asset that will be added to the ledger (ledger must be populated with drugs, companies and orders) 
- verifyOrderDetails: the buyer confirms the price of the order by updating its status (this step can be performmed using several patterns) (ledger must be populated with drugs, companies and orders)


## TUM-Hash

- addComplaints: add complaints of a specific size. The payload can be 







## License
[MIT](https://choosealicense.com/licenses/mit/)
