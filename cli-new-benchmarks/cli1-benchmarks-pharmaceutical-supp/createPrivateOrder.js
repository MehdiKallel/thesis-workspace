'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

let companiesRoles = ['Manufacturer', 'Distributor', 'Transporter', 'Retailer']
let drugsNames = ['PAR232']

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
            contractId: "basic",
            channel: "mychannel",
            contractVersion: 'v1',
            contractFunction: 'registerCompany',
            contractArguments: [companyName, companyMat, "Germany", "Munich", 0, role],
            timeout: 30
        };
        await this.sutAdapter.sendRequests(myArgs);

        for (let i=0; i<40; i++){
            console.log(`Worker ${this.workerIndex}: adding drug`);
            const drug = drugsNames[Math.floor(Math.random() * drugsNames.length)]
            let myArgs = {
                contractId: "basic",
                channel: "mychannel",
                contractVersion: 'v1',
                contractFunction: 'addDrug',
                contractArguments: [drug, "01/03/2022", "01/03/2022", companyName],
                timeout: 30
            };
            await this.sutAdapter.sendRequests(myArgs);

        }
    }
    
    async submitTransaction() {
        let seller = (this.workerIndex+1) % this.totalWorkers
        const myArgs = {
            contractId: "basic",
            contractFunction: 'createPrivateOrder',
            contractArguments: ["PAR232", "1", `${this.workerIndex}`, seller, "1-PDC"],
        };
        await this.sutAdapter.sendRequests(myArgs);
    }

    async cleanupWorkloadModule() {

        for (let i=0; i<drugsNames.length; i++) {
            const request = {
                contractId: "basic",
                contractFunction: 'deleteAllDrugsFromSeller',
                contractArguments: [drugsNames[i], this.workerIndex],
                readOnly: false
            };
    
            await this.sutAdapter.sendRequests(request);
        }
        const request = {
            contractId: "basic",
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
