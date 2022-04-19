'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

let companiesRoles = ['Manufacturer', 'Distributor', 'Transporter', 'Retailer']
let drugsNames = ['PAR232']
let orderReferencesWithSellers = new Array()

class MyWorkload extends WorkloadModuleBase {
    
    constructor() {
        super();
    }
    
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        
        const companyMat = `${this.workerIndex}`
        const companyName = `${this.workerIndex}`
        const role = companiesRoles[Math.floor(Math.random() * companiesRoles.length)];
        console.log(`Worker ${this.workerIndex}: registering his company ${companyMat}`);
        
        let myArgs = {
            contractId: 'basic',
            channel: "mychannel",
            contractVersion: 'v1',
            contractFunction: 'registerCompany',
            contractArguments: ["0", "0", "Germany", "Munich", "0", role],
            timeout: 30
        };
        await this.sutAdapter.sendRequests(myArgs);

        for (let i=0; i<30; i++){
            console.log(`Worker ${this.workerIndex}: adding drug`);
            const drug = drugsNames[Math.floor(Math.random() * drugsNames.length)]
            let myArgs = {
                contractId: 'basic',
                channel: "mychannel",
                contractVersion: 'v1',
                contractFunction: 'addDrug',
                contractArguments: [drug, "01/03/2022", "01/03/2022", companyName],
                timeout: 30
            };
            await this.sutAdapter.sendRequests(myArgs);

        }
        for (let i=0; i<30; i++){
	    console.log(`Worker ${this.workerIndex}: createPrivateOrder`);
            let orderReference = Date.now().toString(36);
            let seller = (this.workerIndex+1) % this.totalWorkers
            const myArgs1 = {
                contractId: 'basic',
                contractFunction: 'createPrivateOrder',
                contractArguments: ["PAR232", "1", "0", "0", orderReference, "1-PDC"],
            };
            let order = new Array(seller, orderReference.toString())
            
            orderReferencesWithSellers.push(order)


            await this.sutAdapter.sendRequests(myArgs1);
        }
        
    }
    
    async submitTransaction(){
        console.log(orderReferencesWithSellers.length);

        var randomIndex = Math.floor(Math.random()*orderReferencesWithSellers.length)
        var pick = orderReferencesWithSellers[randomIndex]
        orderReferencesWithSellers.splice(randomIndex, 1);
        var orderReferenceGlobal = pick[1]
        var orderSellerGlobal = pick[0]

    
        const asset_properties = {
            orderReference: String(orderReferenceGlobal),
            value: String('100'),
            status: String('PENDING')
        };

        const asset_properties_string = JSON.stringify(asset_properties);
	console.log(asset_properties_string);
        const myArgs = {
            contractId: 'basic',
            contractFunction: 'checkOrderPrivateP1',
            transientMap: {'asset_properties': Buffer.from(asset_properties_string)}, 
            contractArguments: [orderSellerGlobal, orderReferenceGlobal],
        };
        await this.sutAdapter.sendRequests(myArgs);
    }

    async cleanupWorkloadModule() {
        for (let i=0; i<drugsNames.length; i++) {
            const request = {
                contractId: 'basic',
                contractFunction: 'deleteAllDrugsFromSeller',
                contractArguments: [drugsNames[i], "0"],
                readOnly: false
            };
    
            await this.sutAdapter.sendRequests(request);
        }
        const request = {
            contractId: 'basic',
            contractFunction: 'deleteAllOrdersFromSeller',
            contractArguments: [this.workerIndex],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
    }

 
   
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
