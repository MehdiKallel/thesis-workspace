package lib

const (
	CompanyKey  = "companyMat"
	DrugKey     = "drugReference"
	OrderKey    = "orderReference"
	ShipmentKey = "shipmentReference"
	DealKey     = ""
)

type Company struct {
	ObjectType    string `json:"docType"`
	Name          string `json:"name"`
	Matriculation string `json:"matriculation"`
	Country       string `json:"country"`
	City          string `json:"city"`
	Reputation    int    `json:"reputation"`
	Role          string `json:"role"`
}

type OrganizationHistory struct {
	ObjectType string   `json:"docType"`
	TxId       string   `json:"TxId"`
	Value      *Company `json:"Value"`
	Timestamp  string   `json:"Timestamp"`
	IsDelete   string   `json:"IsDelete"`
}

type Drug struct {
	ObjectType        string `json:"docType"`
	ProductID         string `json:"productID"`
	SerialNumber      string `json:"serialNumber"`
	Manufacturer      string `json:"manufacturer"`
	ManufacturingDate string `json:"manufacturingDate"`
	ExpiryDate        string `json:"expiryDate"`
	InWareHouse       bool   `json:"inWareHouse"`
	Owner             string `json:"owner"`
}

type Order struct {
	ObjectType       string `json:"docType"`
	OrderReference   string `json:"orderReference"`
	DrugsName        string `json:"drugsName"`
	Quantity         int    `json:"quantity"`
	CompanyBuyerMat  string `json:"companyBuyerMat"`
	CompanySellerMat string `json:"companySellerMat"`
	Status           string `json:"status"`
	Price            int    `json:"price"`
}

type OrderPrivateDetails struct {
	OrderReference string `json:"orderReference"`
	Value          string `json:"value"`
	Status         string `json:"status"`
}

type DealAgreement struct {
	ObjectType       string `json:"docType"`
	OrderReference   string `json:"orderReference"`
	CompanyBuyerMat  string `json:"companyBuyerMat"`
	CompanySellerMat string `json:"companySellerMat"`
}

type Shipment struct {
	ObjectType        string `json:"docType"`
	ShipmentReference string `json:"shipmentReference"`
	BuyerMat          string `json:"buyerMat"`
	SellerMat         string `json:"sellerMat"`
	DrugsList         []Drug `json:"drugsList"`
	Quantity          int    `json:"quantity"`
	Status            string `json:"status"`
}

type OrderTransientInput struct {
	Type           string `json:"objectType"`
	OrderReference string `json:"orderReference"`
	Price          int    `json:"price"`
	Status         string `json:"status"`
	Seller         string `json:"seller"`
}

type OrderInsert struct {
	Type           string `json:"objectType"`
	OrderReference string `json:"orderReference"`
	Price          int    `json:"price"`
	Status         bool   `json:"status"`
}

type InfoInput struct {
	Result string `json:"result"`
}
