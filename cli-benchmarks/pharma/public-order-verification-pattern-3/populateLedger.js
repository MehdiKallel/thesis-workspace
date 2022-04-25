'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
let companiesData;
let drugsData = require('./drugs.json');
var fs = require('fs');
class MyWorkload extends WorkloadModuleBase {
	constructor() {
		super();
	}
	async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
		await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
		companiesData = require(`./companies${this.workerIndex}.json`);
		//each worker registers his companies (each worker has a serpeate companies.json file)
		while (this.roundArguments.counter < companiesData.length ){
			let company = companiesData[this.roundArguments.counter];
			console.log(`Worker ${this.workerIndex}: registering company ${company.companyMat}`);
			const myArgs = {
				contractId: 'basic',
				channel: "mychannel",
				contractVersion: 'v1',
				contractFunction: 'registerCompany',
				contractArguments: [company.companyName.toString(), company.companyMat.toString(), company.country.toString(), company.city.toString(), company.reputation.toString(), company.role.toString()]
			};
			this.roundArguments.counter = this.roundArguments.counter + 1;
			await this.sutAdapter.sendRequests(myArgs);
		}	
	}
	async submitTransaction(){
		//picking random drug from the list
		let index = Math.floor(Math.random() * drugsData.length);
		const drug = drugsData[index];
		let companyIndex = Math.floor(Math.random() * companiesData.length);
		const company = companiesData[companyIndex];
		let drugId = this.workerIndex + Date.now().toString();
		console.log(`Worker ${this.workerIndex}: adding ${drug.name} drugs as company: ${company.companyMat}`);
		const myArgs1 = {
			contractId: 'basic',
			channel: "mychannel",
			contractVersion: 'v1',
			contractFunction: 'addDrug',
			contractArguments: [String(drug.name), String(drug.manuf_date), String(drug.expiration_date), String(company.companyMat), String(drugId)],

		};
		await this.sutAdapter.sendRequests(myArgs1);
	}
}
function createWorkloadModule() {
	return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
