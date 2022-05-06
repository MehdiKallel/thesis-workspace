## workloads for the developped chaincodes
this directory inclues workloads uses to assess the performance of the chaincodes functions

## Pharmaceutical supplychain system

- createOrderRichQuery: performs an order creation relying on rich query (CouchDB required)
- createOrder: performs a public order creation relying on composite-based query (CouchDB required)
- createPrivateOrder: performs a private order creating with the private price stored in the private data collection of the seller
- addDrug: add a drug asset to the ledger
- createShipment: performs a shipment creation by appending the requested drugs by the buyer to a shipment asset that will be added to the ledger 
- verifyOrderDetails: the buyer confirms the price of the order by updating its status (this step can be performmed using several patterns)


## License
[MIT](https://choosealicense.com/licenses/mit/)
