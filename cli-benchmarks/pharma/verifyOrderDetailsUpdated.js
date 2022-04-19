'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
let companiesData;
let drugsData = require('./drugs.json');
let orderReferencesWithSellers = new Array();
let ids;
var fs = require('fs');
let myCompanies = [];
class MyWorkload extends WorkloadModuleBase {

	constructor() {
		super();
		this.txIndex=0;
	}

	async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
		await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
		companiesData = require(`./companies${this.workerIndex}.json`);
		ids = require(`./ids${this.workerIndex}.json`);
	}

	async submitTransaction(){
		
		this.txIndex++;
		let place = this.txIndex % 900;
		const asset_properties = {
			orderReference: String(ids[this.txIndex].id),
			value: String('100'),
			status: String('PENDING')
		};
		const asset_properties_string = JSON.stringify(asset_properties);
		console.log(asset_properties);
		const myArgs = {
			contractId: 'basic',
			contractFunction: 'checkOrderPrivateP1',
			transientMap: {'asset_properties': Buffer.from(asset_properties_string)}, 
			contractArguments: [companiesData[0].companyMat.toString(), ids[place].id.toString()],
		};
		await this.sutAdapter.sendRequests(myArgs);
	} 
}
function createWorkloadModule() {
	return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
