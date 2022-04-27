## Hyperledger Fabric Chaincode for drug traceability

Counterfeiting drugs is a big issue in the pharmaceutical industry. The increasing public use of online pharmacies has made the monitoring of the drug supply chain process complicated. This chapter proposes a blockchain-based system that tracks drugs in the supply chain process. The proposed Chaincode makes it possible to execute transactions between different organizations without a trusted centralized authority and provides records of every transaction performed on the network. The developed Chaincode also demonstrates the use of private data collection in Hyperledger Fabric.

## System overview
This chaincode is intended to be installed on all Organizations peers and three channels are needed for the supply chain system:

- ch1: channel linking the Manufacturer to the Distributor
- ch2: channel linking the Distributor to the Retailer
- ch3: channel linking the Retail to the Consumer

The Transporter is supposed to be joining all channels to be able to trace the Seller to the Buyer. 

(add png)


*Note: for the sake of simplicity and also because HyperledgerLab2 doesn't support the configurations of channels number, private data access control using the the client credentials (for example using GetMSPID()) wasn't implemented.*   

```bash
pip install foobar
```

## Usage

```python
import foobar

# returns 'words'
foobar.pluralize('word')

# returns 'geese'
foobar.pluralize('goose')

# returns 'phenomenon'
foobar.singularize('phenomena')
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
