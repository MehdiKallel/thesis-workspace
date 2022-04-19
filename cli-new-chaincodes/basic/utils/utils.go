package utils

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type drug struct {
	ProductID         string `json:"productID"`
	SerialNumber      string `json:"serialNumber"`
	Manufacturer      string `json:"manufacturer"`
	ManufacturingDate string `json:"manufacturingDate"`
	ExpiryDate        string `json:"expiryDate"`
	InWareHouse       bool   `json:"inWareHouse"`
	Owner             string `json:"owner"`
}

// WriteLedger
func WriteLedger(obj interface{}, stub shim.ChaincodeStubInterface, objectType string, keys []string) error {
	//create primary composite key
	var key string
	if val, err := stub.CreateCompositeKey(objectType, keys); err != nil {
		return errors.New(fmt.Sprintf("%s-Error creating composite primary key %s", objectType, err))
	} else {
		key = val
	}
	//object serialization
	bytes, err := json.Marshal(obj)
	if err != nil {
		return errors.New(fmt.Sprintf("%s-Failed to serialize json data error: %s", objectType, err))
	}

	//push object to the Ledger
	if err := stub.PutState(key, bytes); err != nil {
		return errors.New(fmt.Sprintf("%s-Error writing to the blockchain ledger: %s", objectType, err))
	}
	return nil
}

// Delete asset from the ledger
func DelLedger(stub shim.ChaincodeStubInterface, objectType string, keys []string) error {
	//create primary composite key
	var key string
	if val, err := stub.CreateCompositeKey(objectType, keys); err != nil {
		return errors.New(fmt.Sprintf("%s-Error creating primary composite key %s", objectType, err))
	} else {
		key = val
	}
	//push object to the Ledger
	if err := stub.DelState(key); err != nil {
		return errors.New(fmt.Sprintf("%s-error while deleting from the ledger: %s", objectType, err))
	}
	return nil
}

func GetStateByPartialCompositeKeys(stub shim.ChaincodeStubInterface, objectType string, keys []string) (results [][]byte, err error) {
	if len(keys) == 0 {

		resultIterator, err := stub.GetStateByPartialCompositeKey(objectType, keys)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("%s-Error while retrieving data: %s", objectType, err))
		}
		defer resultIterator.Close()

		for resultIterator.HasNext() {
			val, err := resultIterator.Next()
			if err != nil {
				return nil, errors.New(fmt.Sprintf("%s-Error in returned data: %s", objectType, err))
			}

			results = append(results, val.GetValue())
		}
	} else {
		for _, v := range keys {

			key, err := stub.CreateCompositeKey(objectType, []string{v})
			if err != nil {
				return nil, errors.New(fmt.Sprintf("%s-error while creating  composite key: %s", objectType, err))
			}

			bytes, err := stub.GetState(key)
			if err != nil {
				return nil, errors.New(fmt.Sprintf("%s-Error getting data : %s", objectType, err))
			}

			if bytes != nil {
				results = append(results, bytes)
			}
		}
	}

	return results, nil
}

func GetStateByPartialCompositeKeys2(stub shim.ChaincodeStubInterface, objectType string, keys []string) (results [][]byte, err error) {
	resultIterator, err := stub.GetStateByPartialCompositeKey(objectType, keys)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("%s-Error while getting the data: %s", objectType, err))
	}
	defer resultIterator.Close()

	for resultIterator.HasNext() {
		val, err := resultIterator.Next()
		if err != nil {
			return nil, errors.New(fmt.Sprintf("%s-Error in the return data: %s", objectType, err))
		}

		drug := drug{}
		json.Unmarshal(val.GetValue(), &drug)
		if drug.InWareHouse {
			results = append(results, val.GetValue())
		}
	}
	return results, nil
}

// =========================================================================================
// getQueryResultForQueryString executes the passed in query string.
// Result set is built and returned as a byte array containing the JSON results.
// =========================================================================================
func GetQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) (shim.StateQueryIteratorInterface, error) {

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	return resultsIterator, err
}

// ===========================================================================================
// constructQueryResponseFromIterator constructs a JSON array containing query results from
// a given result iterator
// ===========================================================================================
func ConstructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) (*bytes.Buffer, error) {
	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	return &buffer, nil
}

func GetCollectionName(ctx contractapi.TransactionContextInterface) (string, error) {

	// Get the MSP ID of submitting client identity
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return "", fmt.Errorf("failed to get verified MSPID: %v", err)
	}

	// Create the collection name
	orgCollection := clientMSPID + "PrivateCollection"

	return orgCollection, nil
}




