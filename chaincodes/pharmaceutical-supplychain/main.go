package main

import (
	"bytes"
	"crypto/sha256"
	"drugs/lib"
	"drugs/utils"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"strconv"
	"strings"
	"time"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	pb "github.com/hyperledger/fabric-protos-go/peer"
)
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)
	if function == "registerCompany" { //add a company asset on the ledger
		return t.registerCompany(stub, args)
	} else if function == "getAllCompanies" { //return all companies on the ledger
		return t.getAllCompanies(stub)
	} else if function == "getAllDrugs" { //return all drugs from a particular seller 
		return t.getAllDrugs(stub)
	} else if function == "addDrug" { //add a drug to ledger 
		return t.addDrug(stub, args)
	} else if function == "deleteAllDrugsFromSeller" { //delete all Drugs from a particular Seller
		return t.deleteAllDrugsFromSeller(stub, args)
	} else if function == "deleteAllOrdersFromSeller" { //delete all Orders from a particular Seller
		return t.deleteAllOrdersFromSeller(stub, args)
	} else if function == "deleteAllShipmentsFromSeller" { //delete all Shipments from a particular seller 
		return t.deleteAllShipmentsFromSeller(stub, args)
	} else if function == "viewDrugHistory" { 
		return t.viewDrugHistory(stub, args)
	} else if function == "createOrder" { //order creation relying on key based query by default 
		return t.createOrder(stub, args)
	} else if function == "createOrderRichQuery" { //order creation relying on rich query 
		return t.createOrderRichQuery(stub, args)
	} else if function == "checkOrderPrivateP1" { //computes
		return t.verifyOrderDetails(stub, args)
	} else if function == "createPrivateOrder" {
		return t.createPrivateOrder(stub, args)
	} else if function == "checkOrderPublic" { //public read verification(price public)
		return t.checkOrderPublic(stub, args)
	} else if function == "checkOrderPrivateP3" { // private read verification
		return t.checkOrderPrivate(stub, args)
	} else if function == "checkOrderPrivateP2" { // hash comparision verification
		return t.checkOrderPrivateP2(stub, args)
	} else if function == "checkOrderPrivateP4" { // private insertion verification
		return t.checkOrderPrivateP4(stub, args)
	} else if function == "getAllOrders" { //get all orders from a particular seller
		return t.getAllOrders(stub)
	} else if function == "getAllShipments" {//get all shipments from a particular seller
		return t.getAllShipments(stub)
	} else if function == "updateShipment" { //mark a shipment as delivered
		return t.updateShipment(stub, args)
	} else if function == "createShipment" { //create a shipment asset and append drugs to it (using simple key-based query)
		return t.createShipment(stub, args)
	} else if function == "createShipmentRichQuery" { //create a shipment asset and append drugs to it (using rich query)
		return t.createShipmentRichQuery(stub, args)
	} else if function == "Init" { //populate ledger with drugs
		return t.Init(stub)
	}
	return shim.Error("Invalid function name")

}

type SimpleChaincode struct{}

var counter = 1

const assetCollection = "assetCollection"
const Org1MSPPrivateCollection = "Org1MSPPrivateCollection"
const Org2MSPPrivateCollection = "Org2MSPPrivateCollection"

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("populating Ledger")

	var companiesMat = [6]string{
		"MX32344",
		"MX3",
		"MX2",
		"MX1",
		"MX0",
		"MX4",
	}
	var userNames = [6]string{"PharmaDrugs", "MehdiStore", "DrugsKings", "DHL", "StadtApotheke", "IsarApotheke"}
	var roles = [6]string{"Manufacturer", "Retailer", "Manufacturer", "Manufacturer", "Manufacturer", "Manufacturer"}

	for i, val := range companiesMat {
		company := &lib.Company{
			Matriculation: val,
			Name:          userNames[i],
			Country:       "Germany",
			City:          "Munich",
			Reputation:    0,
			Role:          roles[i],
		}

		if err := utils.WriteLedger(company, stub, "companyMat", []string{val}); err != nil {
			return shim.Error(fmt.Sprintf("%s", err))
		}
	}
	return shim.Success(nil)
}

/**
 * This transaction is used by any participant in the network to register a company
 *
 * Transaction's groups: Manufacturer
 *
 * @param companyName -  Name of the Drug
 * @param matriculation - Company's matriculation
 * @param country -  Company location/country
 * @param city - Company location/city
 * @param company reputation - quality of service
 *
 * @returns  A Compamy asset on the ledger
 */

func (t *SimpleChaincode) registerCompany(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	var err error
	fmt.Println("company creation started")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("4th argument must be a non-empty string")
	}
	if len(args[4]) <= 0 {
		return shim.Error("5th argument must be a non-empty string")
	}
	if len(args[5]) <= 0 {
		return shim.Error("6th argument must be a non-empty string")
	}
	reputation, err := strconv.Atoi(args[4])
	if err != nil {
		return shim.Error("5th argument must be a numeric string")
	}

	company_object := lib.Company{Name: args[0], Matriculation: args[1], Country: strings.ToLower(args[2]), City: strings.ToLower(args[3]), Reputation: reputation, Role: strings.ToLower(args[5])}

	if err := utils.WriteLedger(company_object, stub, "companyMat", []string{company_object.Matriculation}); err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}
	return shim.Success(nil)

}

func (s *SimpleChaincode) getAllCompanies(APIstub shim.ChaincodeStubInterface) pb.Response {
	return s.getAllAssets(APIstub, "companyMat")
}

/**
 * This transaction is used by any registed company to register a new drug on the ledger.
 *
 * Transaction's groups: Manufacturer
 *
 * @param drugReference -  Name of the Drug [0]
 * @param serialNo - Drug's serial no
 * @param mfgDate -  Date of manufacturing of the drug [1]
 * @param expDate - Expiration date of the drug [2]
 * @param companyCRN - Key to identify Manufacturer [3]
 *
 * @returns  A ‘Drug’ asset on the ledger
 */
func (s *SimpleChaincode) addDrug(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	drug_object := lib.Drug{ProductID: args[0], SerialNumber: args[4] , Manufacturer: args[3], ManufacturingDate: args[1], ExpiryDate: args[2], InWareHouse: true, Owner: args[3]}
	if err := utils.WriteLedger(drug_object, stub, lib.DrugKey, []string{drug_object.ProductID, drug_object.Manufacturer, drug_object.SerialNumber}); err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}
	return shim.Success(nil)
}

//args[0]: drugRef args[1]: seller name
func (s *SimpleChaincode) deleteAllDrugsFromSeller(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	resultIterator, err := stub.GetStateByPartialCompositeKey(lib.DrugKey, []string{args[0], args[1]})
	if err != nil {
		return shim.Error("Failed to retrieve the list of added drugs for the given seller ")
	}
	defer resultIterator.Close()
	for resultIterator.HasNext() {
		val, err := resultIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		drug := lib.Drug{}
		json.Unmarshal(val.GetValue(), &drug)
		if drug.Manufacturer == args[1] {
			myKey, err := stub.CreateCompositeKey(lib.DrugKey, []string{drug.ProductID, drug.Manufacturer, drug.SerialNumber})
			if err != nil {
				return shim.Error("")
			}
			stub.DelState(myKey)
		}
	}
	return shim.Success(nil)
}

//args[0]: drugRef args[1]: seller name
func (s *SimpleChaincode) deleteAllOrdersFromSeller(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	allOrdersIterator, err := stub.GetStateByPartialCompositeKey(lib.OrderKey, []string{args[0]})
	if err != nil {
		shim.Error(err.Error())
	}
	for allOrdersIterator.HasNext() {
		val, err := allOrdersIterator.Next()
		if err != nil {
			shim.Error(err.Error())
		}
		order := lib.Order{}
		json.Unmarshal(val.GetValue(), &order)
		if order.CompanySellerMat == args[0] {
			myKey, err := stub.CreateCompositeKey(lib.OrderKey, []string{args[0], order.OrderReference})
			if err != nil {
				shim.Error(err.Error())
			}
			err = stub.DelState(myKey)
			if err != nil {
				return shim.Error("unable to find order")
			}
		}
	}
	return shim.Success(nil)
}

//args[0]: drugRef args[1]: seller name
func (s *SimpleChaincode) deleteAllShipmentsFromSeller(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	allOrdersIterator, err := stub.GetStateByPartialCompositeKey(lib.ShipmentKey, []string{args[0]})
	if err != nil {
		shim.Error(err.Error())
	}
	for allOrdersIterator.HasNext() {
		val, err := allOrdersIterator.Next()
		if err != nil {
			shim.Error(err.Error())
		}
		shipment := lib.Shipment{}
		json.Unmarshal(val.GetValue(), &shipment)
		if shipment.SellerMat == args[0] {
			myKey, err := stub.CreateCompositeKey(lib.ShipmentKey, []string{args[0], shipment.ShipmentReference})
			if err != nil {
				shim.Error(err.Error())
			}
			err = stub.DelState(myKey)
			if err != nil {
				shim.Error(err.Error())
			}
		}
	}
	return shim.Success(nil)
}

//args[0]:drugRef
func (s *SimpleChaincode) viewDrugHistory(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	key, _ := stub.CreateCompositeKey(lib.DrugKey, args)
	keysIter, err := stub.GetHistoryForKey(key)
	if err != nil {
		return shim.Error(fmt.Sprintf("GetHistoryForKey failed.Error accessing state %s", err))
	}
	defer keysIter.Close()
	var keys []string
	for keysIter.HasNext() {
		response, iterErr := keysIter.Next()
		if iterErr != nil {
			return shim.Error(fmt.Sprintf("GetHistoryForKey operation failed.Error accessing state %s", err))
		}

		txid := response.TxId

		txvalue := response.Value

		txstatus := response.IsDelete

		txtimestamp := response.Timestamp

		tm := time.Unix(txtimestamp.Seconds, 0)
		datestr := tm.Format("2006-01-02 03:04:05 PM")

		fmt.Printf("Tx info - txid:%s value: %s if delete %t datetime:%s\n", txid, string(txvalue), txstatus, datestr)
		keys = append(keys, string(txvalue)+":"+datestr)
	}

	jsonKeys, err := json.Marshal(keys)
	if err != nil {
		return shim.Error(fmt.Sprintf("query operation failed.Error marshaling JSON :%s", err))
	}

	return shim.Success(jsonKeys)
}

/**
*
*
* Transaction allowed for: Manufacturer, Distributor, Pharmacies
*
*
* @returns  all availble drugs on the Ledger
 */

func (s *SimpleChaincode) getAllDrugs(APIstub shim.ChaincodeStubInterface) pb.Response {
	return s.getAllAssets(APIstub, lib.DrugKey)
}

func verifyClientOrgMatchesPeerOrg(stub shim.ChaincodeStubInterface) error {
	clientMSPID, err := shim.GetMSPID()
	if err != nil {
		return fmt.Errorf("failed getting the client's MSPID: %v", err)
	}
	peerMSPID, err := shim.GetMSPID()
	if err != nil {
		return fmt.Errorf("failed getting the peer's MSPID: %v", err)
	}

	if clientMSPID != peerMSPID {
		return fmt.Errorf("client from org %v is not authorized to read or write private data from an org %v peer", clientMSPID, peerMSPID)
	}

	return nil
}

// pattern 3: order verification when the price is public
func (s SimpleChaincode) checkOrderPublic(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	seller := args[0]
	orderRef := args[1]
	key, err := stub.CreateCompositeKey(lib.OrderKey, []string{seller, orderRef})
	if err != nil {
		return shim.Error("the order you entered doesnt exist")
	}
	orderAsBytes, err := stub.GetState(key)
	if err != nil {
		return shim.Error("unable to find order")
	}
	var order lib.Order
	err = json.Unmarshal(orderAsBytes, &order)
	if err != nil {
		return shim.Error("unable to find order")
	}
	if order.Price == 100 {
		order.Status = "ACCEPTED"
	} else {
		order.Status = "REFUSED"
	}
	orderAsBytes, err = json.Marshal(order)
	if err != nil {
		return shim.Error("unable to find order")
	}
	err = stub.PutState(key, orderAsBytes)
	if err != nil {
		return shim.Error("unable to add order to the ledger")
	}

	return shim.Success(nil)
}

// checkOrderPrivate / Pattern 3: the buyer checks the private data on the seller side and confirms the order
func (s *SimpleChaincode) checkOrderPrivate(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	assetID := args[1]
	assetJSON, err := stub.GetPrivateData(Org1MSPPrivateCollection, assetID)
	if err != nil {
		return shim.Error("")
	}
	var asset lib.OrderPrivateDetails
	err = json.Unmarshal(assetJSON, &asset)
	if err != nil {
		return shim.Error(err.Error())
	}

	if asset.Value == "100" {
		asset.Status = "ACCEPTED"
	} else {
		asset.Status = "REFUSED"
	}
	assetAsBytes, err := json.Marshal(asset)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutPrivateData(Org1MSPPrivateCollection, assetID, assetAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

func (s SimpleChaincode) createPrivateOrder(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	bothCollections := args[5]
	companySellerMat := args[3]
	companyBuyerMat := args[2]

	resultsCompaniesBuyer, err := utils.GetStateByPartialCompositeKeys(stub, lib.CompanyKey, []string{companyBuyerMat})
	if err != nil || len(resultsCompaniesBuyer) != 1 {
		return shim.Error(fmt.Sprintf("The buyer Company company matriculation verificaiton failed%s", err))
	}

	resultsCompaniesSeller, err := utils.GetStateByPartialCompositeKeys(stub, lib.CompanyKey, []string{companySellerMat})
	if err != nil || len(resultsCompaniesSeller) != 1 {
		return shim.Error(fmt.Sprintf("The seller Company company matriculation verificaiton failed%s", err))
	}

	drugRef := args[0]

	number, err := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}

	//check that the amount is available on the network before confirming the Order and creating the shipment
	drugsResults, err := utils.GetStateByPartialCompositeKeys2(stub, lib.DrugKey, []string{drugRef, companySellerMat})
	if err != nil {
		return shim.Error(fmt.Sprintf("error while proceeding the order%s", err))
	}

	if len(drugsResults) < number {
		return shim.Error("not enough supply on the network from the requested seller. Please try another Seller.")
	}

	var customMat string
	if args[4] == "" {
		customMat = RandomString(7)
	} else {
		customMat = args[4]
	}
	order_object := lib.Order{OrderReference: customMat, Quantity: number, CompanyBuyerMat: args[2], CompanySellerMat: args[3], Status: "PENDING", DrugsName: drugRef}

	if err := utils.WriteLedger(order_object, stub, "orderReference", []string{order_object.CompanySellerMat, order_object.OrderReference}); err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}
	// Save asset details to collection visible to owning organization
	orderPrivateDetails := lib.OrderPrivateDetails{
		OrderReference: order_object.OrderReference,
		Value:          "100",
		Status:         "PENDING",
	}
	orderPrivateDetailsAsBytes, err := json.Marshal(orderPrivateDetails) // marshal asset details to JSON
	if err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}
	err = stub.PutPrivateData("Org1MSPPrivateCollection", order_object.OrderReference, orderPrivateDetailsAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	if bothCollections == "true" {
		err = stub.PutPrivateData("Org2MSPPrivateCollection", order_object.OrderReference, orderPrivateDetailsAsBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}

	if err := utils.WriteLedger(order_object, stub, "orderReference", []string{order_object.CompanySellerMat, order_object.OrderReference}); err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}
	return shim.Success(nil)
}

func (s *SimpleChaincode) createOrderRichQuery(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	companySellerMat := args[3]
	number, err := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}
	
	//rich query
	argsStringDrug := fmt.Sprintf("{\"selector\":{\"productID\":\"%s\",\"manufacturer\":\"%s\"}}", args[0], companySellerMat)

	//run rich query
	resultsQuery, err := utils.GetQueryResultForQueryString(APIstub, argsStringDrug)
	if err != nil {
		return shim.Error(fmt.Sprintf("error while executing rich query%s", err))
	}

	//iterate over rich query result and check if there is enough supply
	var results [][]byte
	for resultsQuery.HasNext() {
		val, err := resultsQuery.Next()
		if err != nil {
			return shim.Error(fmt.Sprintf("%s", err))
		}
		results = append(results, val.GetValue())
	}
	if len(results) < number {
		return shim.Error("not enough supply on the network from the requested seller. Please try another Seller.")
	}

	order_object := lib.Order{OrderReference: RandomString(7), Quantity: number, CompanyBuyerMat: args[2], CompanySellerMat: args[3], Status: "confirmed", DrugsName: args[0]}
	if err := utils.WriteLedger(order_object, APIstub, lib.OrderKey, []string{order_object.OrderReference}); err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}
	return shim.Success(nil)
}

/*
* @param DrugsName - reference of the requested Drug: (ex: DOLIP500 for Doliprane 500mg)
* @param Quantity - requested Quantity
* @param CompanyBuyerMat -  Matricule of the Buyer Company
* @param CompanySellerMat - Matricule of the Seller Company
 */
func (s *SimpleChaincode) createOrder(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	//check that the companies exist on the Network
	companySellerMat := args[3]
	companyBuyerMat := args[2]

	resultsCompaniesBuyer, err := utils.GetStateByPartialCompositeKeys(APIstub, "companyMat", []string{companyBuyerMat})
	if err != nil || len(resultsCompaniesBuyer) != 1 {
		return shim.Error(fmt.Sprintf("The buyer Company company matriculation verificaiton failed%s", err))
	}

	resultsCompaniesSeller, err := utils.GetStateByPartialCompositeKeys(APIstub, "companyMat", []string{companySellerMat})
	if err != nil || len(resultsCompaniesSeller) != 1 {
		return shim.Error(fmt.Sprintf("The seller Company company matriculation verificaiton failed%s", err))
	}

	drugRef := args[0]

	number, err := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}

	//check that the amount is available on the network before confirming the Order and creating the shipment
	drugsResults, err := utils.GetStateByPartialCompositeKeys2(APIstub, lib.DrugKey, []string{drugRef, companySellerMat})
	if err != nil {
		return shim.Error(fmt.Sprintf("error while proceeding the order%s", err))
	}

	if len(drugsResults) < number {
		return shim.Error("not enough supply on the network from the requested seller. Please try another Seller.")
	}

	if args[4] != "" {
		order_object := lib.Order{OrderReference: args[4], Quantity: number, CompanyBuyerMat: args[2], CompanySellerMat: args[3], Status: "PENDING", DrugsName: drugRef, Price: 100}
		if err := utils.WriteLedger(order_object, APIstub, "orderReference", []string{order_object.CompanySellerMat, order_object.OrderReference}); err != nil {
			return shim.Error(fmt.Sprintf("%s", err))
		}
	} else {
		order_object := lib.Order{OrderReference: RandomString(7), Quantity: number, CompanyBuyerMat: args[2], CompanySellerMat: args[3], Status: "PENDING", DrugsName: drugRef, Price: 100}
		if err := utils.WriteLedger(order_object, APIstub, "orderReference", []string{order_object.CompanySellerMat, order_object.OrderReference}); err != nil {
			return shim.Error(fmt.Sprintf("%s", err))
		}
	}
	return shim.Success(nil)
}


/*
* @param DrugsName - reference of the requested Drug: (ex: DOLIP500 for Doliprane 500mg)
* @param Quantity - requested Quantity
* @param CompanyBuyerMat -  Matricule of the Buyer Company
* @param CompanySellerMat - Matricule of the Seller Company
 */
func (s *SimpleChaincode) createOrderAccepted(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	//check that the companies exist on the Network
	companySellerMat := args[3]
	companyBuyerMat := args[2]

	resultsCompaniesBuyer, err := utils.GetStateByPartialCompositeKeys(APIstub, "companyMat", []string{companyBuyerMat})
	if err != nil || len(resultsCompaniesBuyer) != 1 {
		return shim.Error(fmt.Sprintf("The buyer Company company matriculation verificaiton failed%s", err))
	}

	resultsCompaniesSeller, err := utils.GetStateByPartialCompositeKeys(APIstub, "companyMat", []string{companySellerMat})
	if err != nil || len(resultsCompaniesSeller) != 1 {
		return shim.Error(fmt.Sprintf("The seller Company company matriculation verificaiton failed%s", err))
	}

	drugRef := args[0]

	number, err := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}

	//check that the amount is available on the network before confirming the Order and creating the shipment
	drugsResults, err := utils.GetStateByPartialCompositeKeys2(APIstub, lib.DrugKey, []string{drugRef, companySellerMat})
	if err != nil {
		return shim.Error(fmt.Sprintf("error while proceeding the order%s", err))
	}

	if len(drugsResults) < number {
		return shim.Error("not enough supply on the network from the requested seller. Please try another Seller.")
	%
	if args[4] != "" {
		order_object := lib.Order{OrderReference: args[4], Quantity: number, CompanyBuyerMat: args[2], CompanySellerMat: args[3], Status: "ACCEPTED", DrugsName: drugRef, Price: 100}
		if err := utils.WriteLedger(order_object, APIstub, "orderReference", []string{order_object.CompanySellerMat, order_object.OrderReference}); err != nil {
			return shim.Error(fmt.Sprintf("%s", err))
		}
	} else {
		order_object := lib.Order{OrderReference: RandomString(7), Quantity: number, CompanyBuyerMat: args[2], CompanySellerMat: args[3], Status: "ACCEPTED", DrugsName: drugRef, Price: 100}
		if err := utils.WriteLedger(order_object, APIstub, "orderReference", []string{order_object.CompanySellerMat, order_object.OrderReference}); err != nil {
			return shim.Error(fmt.Sprintf("%s", err))
		}
	}
	return shim.Success(nil)
}

func (s *SimpleChaincode) verifyOrderDetails(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	transMap, err := stub.GetTransient()
	if err != nil {
		return shim.Error("")
	}

	/// Asset properties must be retrieved from the transient field as they are private
	orderDetailsDistributorJSON := transMap["asset_properties"]

	var details lib.OrderPrivateDetails
	err = json.Unmarshal(orderDetailsDistributorJSON, &details)
	if err != nil {
		return shim.Error(err.Error())
	}

	toCompareObjBytes, err := json.Marshal(details)
	if err != nil {
		return shim.Error(err.Error())
	}

	orderDetailsManufacturer, err := stub.GetPrivateDataHash(Org1MSPPrivateCollection, details.OrderReference)
	if err != nil {
		return shim.Error("failed to read asset private properties hash from seller's collection")
	}
	if orderDetailsManufacturer == nil {
		return shim.Error("No hash exists for this order")
	}

	hash := sha256.New()
	hash.Write(toCompareObjBytes)
	calculatedPropertiesHash := hash.Sum(nil)

	//compare two computed hashes
	if !bytes.Equal(orderDetailsManufacturer, calculatedPropertiesHash) {
		return shim.Error(err.Error())
	}
	key, err := stub.CreateCompositeKey(lib.OrderKey, []string{args[0], args[1]})
	if err != nil {
		return shim.Error(err.Error())
	}

	orderAsBytes, err := stub.GetState(key)
	if err != nil {
		return shim.Error(err.Error())
	}

	var order lib.Order

	err = json.Unmarshal(orderAsBytes, &order)
	if err != nil {
		return shim.Error(err.Error())
	}

	order.Status = "ACCEPTED"

	orderAsBytes, err = json.Marshal(order)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutState(key, orderAsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// order verification pattern 5
func (s *SimpleChaincode) checkOrderPrivateP2(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	orderReference := args[0]
	orderDetailsSeller, err := stub.GetPrivateDataHash(Org1MSPPrivateCollection, orderReference)
	if err != nil {
		return shim.Error("failed to read asset private properties hash from seller's collection")
	}
	if orderDetailsSeller == nil {
		return shim.Error("No hash exists for this order")
	}

	orderDetailsBuyer, err := stub.GetPrivateDataHash(Org2MSPPrivateCollection, orderReference)
	if err != nil {
		return shim.Error("failed to read asset private properties hash from seller's collection")
	}

	if !bytes.Equal(orderDetailsBuyer, orderDetailsSeller) {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

//order verification pattern 4
func (s *SimpleChaincode) checkOrderPrivateP4(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	// Get new asset from transient map
	transientMap, err := APIstub.GetTransient()
	if err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}

	// Order price is private, therefore it get passed in the transient field
	transientAssetJSON, ok := transientMap["asset_properties"]
	if !ok {
		return shim.Error(fmt.Sprintf("%s", err))
	}

	var insertTransaction lib.OrderInsert
	err = json.Unmarshal(transientAssetJSON, &insertTransaction)
	if err != nil {
		shim.Error(err.Error())
	}

	if len(insertTransaction.OrderReference) == 0 || insertTransaction.Price == 0 {
		return shim.Error(err.Error())
	}

	err = APIstub.PutPrivateData(Org1MSPPrivateCollection, insertTransaction.OrderReference, transientAssetJSON)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

// when an order is created, the status is set on pending: during this time the seller add a price to the order and waits for the buyer to confirm the price
func (s *SimpleChaincode) addPriceOrder(APIstub shim.ChaincodeStubInterface, args []string, ctx contractapi.TransactionContextInterface) pb.Response {

	// Get new asset from transient map
	transientMap, err := APIstub.GetTransient()
	if err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}

	// Order price is private, therefore it get passed in the transient field
	transientAssetJSON, ok := transientMap["asset_properties"]
	if !ok {
		//log error to stdout
		return shim.Error(fmt.Sprintf("%s", err))
	}

	var priceInput lib.OrderTransientInput
	err = json.Unmarshal(transientAssetJSON, &priceInput)
	if err != nil {
		shim.Error(err.Error())
	}

	if len(priceInput.OrderReference) == 0 || priceInput.Price == 0 {
		return shim.Error("please check the Input")
	}

	// Check if offer already exists: manufacturer cannot make more than 1 offer to the buyer
	orderOfferAsBytes, err := APIstub.GetPrivateData(assetCollection, priceInput.OrderReference)
	if err != nil {
		return shim.Error(fmt.Sprintf("failed to get the order offer: %s", err))
	} else if orderOfferAsBytes != nil {
		fmt.Println("Order offer already exists: " + priceInput.OrderReference)
		return shim.Error("Order offer already exists")
	}

	err = APIstub.PutPrivateData(assetCollection, priceInput.OrderReference, orderOfferAsBytes)
	if err != nil {
		return shim.Error("failed to put offer in the private data collection")
	}

	// Get collection name for this organization.
	orgCollection, err := utils.GetCollectionName(ctx)
	if err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}

	err = APIstub.PutPrivateData(orgCollection, priceInput.OrderReference, orderOfferAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}
	return shim.Success(nil)
}

// shipment creation based on rich query
func (s *SimpleChaincode) createShipmentRichQuery(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	specificOrder := fmt.Sprintf("{\"selector\":{\"orderReference\":\"%s\"}}", args[0])
	resultsQuery, err := utils.GetQueryResultForQueryString(APIstub, specificOrder)
	if err != nil {
		return shim.Error(fmt.Sprintf("error while executing rich query%s", err))
	}

	order := lib.Order{}

	for resultsQuery.HasNext() {
		val, err := resultsQuery.Next()
		if err != nil {
			return shim.Error(fmt.Sprintf("%s", err))
		}
		json.Unmarshal(val.GetValue(), &order)

	}

	if order.Status == "PENDING" {
		shim.Error(err.Error())
	}

	specificOrderDrugs := fmt.Sprintf("{\"selector\":{\"productID\":\"%s\",\"manufacturer\":\"%s\"}}", order.DrugsName, order.CompanySellerMat)
	resultsSpecificOrderDrugs, err := utils.GetQueryResultForQueryString(APIstub, specificOrderDrugs)
	if err != nil {
		return shim.Error(fmt.Sprintf("error while executing rich query%s", err))
	}

	var results []lib.Drug

	for resultsSpecificOrderDrugs.HasNext() {
		if counter > order.Quantity {
			break
		}
		val, err := resultsSpecificOrderDrugs.Next()
		if err != nil {
			shim.Error(err.Error())
		}
		drug := lib.Drug{}
		json.Unmarshal(val.GetValue(), &drug)
		//choose only drugs which are available in the WareHouse
		if drug.InWareHouse {
			drug.InWareHouse = false
			drug.Owner = order.CompanyBuyerMat
			results = append(results, drug)
			drugAsBytes, _ := json.Marshal(drug)
			err4 := APIstub.PutState(val.GetKey(), drugAsBytes)

			if err4 != nil {
				return shim.Error("Failed to update Drug State")
			}
			counter++
		}
	}
	counter = 1

	shipment_object := lib.Shipment{ShipmentReference: RandomString(52), DrugsList: results, BuyerMat: order.CompanyBuyerMat, Quantity: order.Quantity, Status: "IN PROGRESS"}

	if err := utils.WriteLedger(shipment_object, APIstub, lib.ShipmentKey, []string{shipment_object.ShipmentReference}); err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}

	return shim.Success(nil)
}

//create a Shipment label based on order reference (only if there is enough supply of the requested drug)
func (s *SimpleChaincode) createShipment(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	pattern, err := strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("pattern argument must be numeric")
	}

	// pattern using 1 private collection at the Manufacturer side only: read-only==false // write-only == true
	if pattern == 1 {
		// Check if the offer exists already exists: manufacturer cannot make more than 1 offer to the buyer.
		orderOfferAsBytes, err := APIstub.GetPrivateData(Org1MSPPrivateCollection, args[0])
		if err != nil {
			return shim.Error(fmt.Sprintf("failed to get the order offer: %s", err))
		} else if orderOfferAsBytes != nil {
			fmt.Println("Distributor request exists. Proceed to shipment")
		}
		//for this pattern we use the Hash as input to check if properties match
	} else if pattern == 2 {
		manufacturerAppraisedValueHash, err := APIstub.GetPrivateDataHash(Org1MSPPrivateCollection, args[0])
		if err != nil {
			return shim.Error("failed to get hash of appraised value from owners collection")
		}
		if manufacturerAppraisedValueHash == nil {
			return shim.Error("hash of the appraised value does not exist")
		}
		distributorAppraisedValueHash, err := APIstub.GetPrivateDataHash(Org2MSPPrivateCollection, args[0])
		if err != nil {
			return shim.Error("failed to get hash of appraised value from owners collection")
		}
		if distributorAppraisedValueHash == nil {
			return shim.Error("hash of the appraised value does not exist")
		}
		if !bytes.Equal(manufacturerAppraisedValueHash, distributorAppraisedValueHash) {
			return shim.Error("not same price at both collections")
		}

		//for this pattern Org1MSPPrivateCollection should be set on read-only == true, write only == false
	} else if pattern == 3 {
		assetJSON, err := APIstub.GetPrivateData(Org1MSPPrivateCollection, args[0]) //get the asset from chaincode state
		if err != nil {
			return shim.Error("order doesnt exist, please wait for order creation")
		}
		var asset lib.OrderPrivateDetails
		err = json.Unmarshal(assetJSON, &asset)
		if err != nil {
			return shim.Error("unable to find order")
		}

		if asset.Status == "pending" {
			return shim.Error("order not accepted by client, please wait for approval")
		}
	}

	//fetch requested drug
	key, err := APIstub.CreateCompositeKey("orderReference", []string{args[0], args[1]})
	if err != nil {
		return shim.Error(err.Error())
	}
	bytes, err := APIstub.GetState(key)

	order := lib.Order{}
	if err != nil {
		return shim.Error("Failed to get Shipment")
	}
	json.Unmarshal(bytes, &order)

	if order.Status == "PENDING" {
		return shim.Error(err.Error())
	}

	resultIterator, err := APIstub.GetStateByPartialCompositeKey(lib.DrugKey, []string{order.DrugsName, order.CompanySellerMat})
	if err != nil {
		return shim.Error("Failed to retrieve")
	}
	defer resultIterator.Close()
	var results []lib.Drug

	for resultIterator.HasNext() {
		if counter > order.Quantity {
			break
		}
		val, err := resultIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		drug := lib.Drug{}
		json.Unmarshal(val.GetValue(), &drug)
		//choose only drugs which are available in the WareHouse
		if drug.InWareHouse {
			drug.InWareHouse = false
			drug.Owner = order.CompanyBuyerMat
			results = append(results, drug)
			drugAsBytes, _ := json.Marshal(drug)
			err4 := APIstub.PutState(val.GetKey(), drugAsBytes)

			if err4 != nil {
				return shim.Error("Failed to update Drug State")
			}
			counter++
		}
	}
	counter = 1

	shipment_object := lib.Shipment{ShipmentReference: RandomString(52), DrugsList: results, BuyerMat: order.CompanyBuyerMat, SellerMat: order.CompanySellerMat, Quantity: order.Quantity, Status: "IN PROGRESS"}

	if err := utils.WriteLedger(shipment_object, APIstub, lib.ShipmentKey, []string{shipment_object.SellerMat, shipment_object.ShipmentReference}); err != nil {
		return shim.Error(fmt.Sprintf("%s", err))
	}

	return shim.Success(nil)
}

//set shipment status on delivered
func (s *SimpleChaincode) updateShipment(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	key, err := APIstub.CreateCompositeKey(lib.ShipmentKey, []string{args[0]})
	if err != nil {
		return shim.Error(err.Error())
	}
	bytes, err := APIstub.GetState(key)

	shipment := lib.Shipment{}
	if err != nil {
		return shim.Error("Failed to get Shipment")
	}
	json.Unmarshal(bytes, &shipment)
	shipment.Status = "DELIVERED"
	shipmentAsBytes, _ := json.Marshal(shipment)
	err2 := APIstub.PutState(key, shipmentAsBytes)

	if err2 != nil {
		return shim.Error("Failed to update Shipment State")
	}

	return shim.Success(nil)

}

//used by queries (getAllOrders / getAllShipments)
func (s *SimpleChaincode) getAllAssets(APIstub shim.ChaincodeStubInterface, indexName string) pb.Response {

	allOrdersIterator, orgError := APIstub.GetStateByPartialCompositeKey(indexName, []string{})
	if orgError != nil {
		return shim.Error(orgError.Error())
	}
	defer allOrdersIterator.Close()

	var UserBuffer bytes.Buffer
	UserBuffer.WriteString("[")

	UserArrayMemberAlreadyWritten := false
	for allOrdersIterator.HasNext() {
		UserQueryResponse, orgError1 := allOrdersIterator.Next()
		if orgError1 != nil {
			return shim.Error(orgError1.Error())
		}

		if UserArrayMemberAlreadyWritten == true {
			UserBuffer.WriteString(",")
		}

		UserBuffer.WriteString("{\"Org\":")
		UserBuffer.WriteString("\"")
		_, orgKeyComp, orgKeyCompError := APIstub.SplitCompositeKey(UserQueryResponse.Key)
		if orgKeyCompError != nil {
			return shim.Error(orgKeyCompError.Error())
		}

		UserBuffer.WriteString(orgKeyComp[0])
		UserBuffer.WriteString("\"")

		UserBuffer.WriteString(", \"Details\":")
		UserBuffer.WriteString(string(UserQueryResponse.Value))
		UserBuffer.WriteString("}")
		UserArrayMemberAlreadyWritten = true
	}

	UserBuffer.WriteString("]")

	fmt.Printf(" - all Drugs:\n%s\n", UserBuffer.String())
	return shim.Success(UserBuffer.Bytes())
}

// returns all orders
func (s *SimpleChaincode) getAllOrders(APIstub shim.ChaincodeStubInterface) pb.Response {
	return s.getAllAssets(APIstub, lib.ShipmentKey)
}

// returns all shipments
func (s *SimpleChaincode) getAllShipments(APIstub shim.ChaincodeStubInterface) pb.Response {
	return s.getAllAssets(APIstub, lib.ShipmentKey)
}

// serialNumber generation for Shipments/Drugs/Orders
func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

func GetStateByPartialCompositeKeys2(stub shim.ChaincodeStubInterface, objectType string, keys []string) (results [][]byte, err error) {

	resultIterator, err := stub.GetStateByPartialCompositeKey(objectType, keys)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("%s-Error retrieving the data: %s", objectType, err))
	}
	defer resultIterator.Close()

	//Check whether the returned data is empty, traverse the data if it is not empty, otherwise return an empty array
	for resultIterator.HasNext() {
		val, err := resultIterator.Next()
		if err != nil {
			return nil, errors.New(fmt.Sprintf("%s-error during data during data retrieve: %s", objectType, err))
		}
		results = append(results, val.GetValue())
	}
	return results, nil
}

func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
