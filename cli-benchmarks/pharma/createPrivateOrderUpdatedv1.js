'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
let companiesData;
let drugsData = require('./drugs.json');
let orderReferencesWithSellers = new Array();
var fs = require('fs');
let myCompanies = [];
class MyWorkload extends WorkloadModuleBase {

	constructor() {
		super();
	}

	async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
		await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
		companiesData = require(`./companies${this.workerIndex}.json`);	
	}

	async submitTransaction(){
		let seller;
		let buyer;
		//pick two different companies
		while ( true ){
			let sellerIndex = Math.floor(Math.random() * companiesData.length);
			let buyerIndex = Math.floor(Math.random() * companiesData.length);
			seller = companiesData[sellerIndex];
			buyer = companiesData[buyerIndex];
			if ( seller.companyMat != buyer.companyMat){
				break;
			}
		}
		//pick random to order
		let randomDrugIndex = Math.floor(Math.random() * drugsData.length);
		const drug = drugsData[randomDrugIndex];
		//order should at least have 2 units / at most 5 
		const drugsToOrder = 1;
		const orderReference = Date.now().toString();
		console.log(`Worker ${this.workerIndex}: buyer ${buyer.companyName} ordering from : ${seller.companyName} ${drugsToOrder} of ${drug.name}`);
		const myArgs1 = {
			contractId: this.roundArguments.contractId,
			contractFunction: 'createPrivateOrder',
			contractArguments: [String(drug.name), String(drugsToOrder), String(buyer.companyMat), String(seller.companyMat), String(orderReference), "1-PDC"],
		};
		const  order = new Array(seller.companyMat, orderReference.toString());
		orderReferencesWithSellers.push(order);
		await this.sutAdapter.sendRequests(myArgs1);
	} 
}

function createWorkloadModule() {
	return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
