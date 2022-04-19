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
		//each worker registers his companies (each worker has a serpeate companies.json file)
		while (this.roundArguments.counter < companiesData.length ){
			let company = companiesData[this.roundArguments.counter];
			console.log(`Worker ${this.workerIndex}: registering company ${company.companyMat}`);
			const myArgs = {
				contractId: this.roundArguments.contractId,
				channel: "mychannel",
				contractVersion: 'v1',
				contractFunction: 'registerCompany',
				contractArguments: [company.companyName.toString(), company.companyMat.toString(), company.country.toString(), company.city.toString(), company.reputation.toString(), company.role.toString()]
			};
			this.roundArguments.counter = this.roundArguments.counter + 1;
			this.sutAdapter.sendRequests(myArgs);
		}

		/**
		 *  let drug structure {
		 *     name
		 *     manuf_date
		 *     expiration_date     
		 * }
		 */

		//each worker adds drugs to the ledger 
		let minNumberOfDrugs = this.roundArguments.assets / companiesData.length;
		for ( let i = 0 ; i < companiesData.length ; i++ ){

			const numberOfDrugsToBeAdded = Math.floor(Math.random() * (minNumberOfDrugs+4 - minNumberOfDrugs))+ minNumberOfDrugs; 
			//const numberOfDrugsToBeAdded = Math.floor(Math.random() * (minNumberOfDrugs+4 - minNumberOfDrugs)+minNumberOfDrugs);
			console.log(`Worker ${this.workerIndex}: registering ${numberOfDrugsToBeAdded} drugs as company: ${companiesData[i].companyMat}`);
			for ( let j = 0 ; j < numberOfDrugsToBeAdded ; j++ ){
				let index = Math.floor(Math.random() * drugsData.length);
				const drug = drugsData[index];
				let drugId = Date.now();
				console.log(`Worker ${this.workerIndex}: adding ${drug.name} drugs as company: ${companiesData[i].companyMat}`);
				const myArgs1 = {
					contractId: this.roundArguments.contractId,
					channel: "mychannel",
					contractVersion: 'v1',
					contractFunction: 'addDrug',
					contractArguments: [String(drug.name), String(drug.manuf_date), String(drug.expiration_date), String(companiesData[i].companyMat), String(drugId)],
					timeout: 30

				};
				await this.sutAdapter.sendRequests(myArgs1);
			}
		}

		for ( let  i = 0 ; i < this.roundArguments.assets ; i++ ){
			let seller;
			let buyer;
			//pick two different companies
			const shuffled = [...companiesData].sort(() => 0.5 - Math.random());
			const result = shuffled.slice(0,2);
			seller = result[0];
			buyer = result[1];

			//pick random to order
			let randomDrugIndex = Math.floor(Math.random() * drugsData.length);
			const drug = drugsData[randomDrugIndex];
			//order should at least have 2 units / at most 5 
			const drugsToOrder = Math.floor(Math.random() * (5 - 2 ) + 2 );
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

	async submitTransaction(){
		var randomIndex = Math.floor(Math.random()*orderReferencesWithSellers.length)
		var pick = orderReferencesWithSellers[randomIndex]
		//remove the order from the list
		orderReferencesWithSellers.splice(randomIndex, 1);
		var orderReferenceGlobal = pick[1].toString();
		var orderSellerGlobal = pick[0].toString();
		//supposing that we agreed on a price: 100 euros for the order
		const asset_properties = {
			orderReference: String(orderReferenceGlobal),
			value: String('100'),
			status: String('PENDING')
		};
		const asset_properties_string = JSON.stringify(asset_properties);
		const myArgs = {
			contractId: 'basic',
			contractFunction: 'checkOrderPrivateP1',
			transientMap: {'asset_properties': Buffer.from(asset_properties_string)}, 
			contractArguments: [orderSellerGlobal, orderReferenceGlobal],
		};
		await this.sutAdapter.sendRequests(myArgs);
	}
	async cleanupWorkloadModule() {
		for (let i=0; i<drugsData.length; i++) {
			for ( let j = 0; j < companiesData.length ; j++ ){
				const request = {
					contractId: this.roundArguments.contractId,
					contractFunction: 'deleteAllDrugsFromSeller',
					contractArguments: [String(drugsData[i].name), String(companiesData[j].companyMat) ],
					readOnly: false
				};
				await this.sutAdapter.sendRequests(request);
			}
		}
		for ( let i = 0 ; i < companiesData.length ; i++ ){
			const request = {
				contractId: this.roundArguments.contractId,
				contractFunction: 'deleteAllOrdersFromSeller',
				contractArguments: [String(companiesData[i].companyMat)],
				readOnly: false
			};

			await this.sutAdapter.sendRequests(request);
		}
	} 
}

function createWorkloadModule() {
	return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
