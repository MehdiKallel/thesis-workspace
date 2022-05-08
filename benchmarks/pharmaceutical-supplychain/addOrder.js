'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
let companiesData;
let drugsData = require('./drugs.json');
let ids;
var fs = require('fs');
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
		//pick random to order
		let randomDrugIndex = Math.floor(Math.random() * drugsData.length);
		const drug = drugsData[randomDrugIndex];
		//order should at least have 2 units / at most 5
		const drugsToOrder = 1;
		const orderReference = ids[this.txIndex].id.toString();
		console.log(orderReference);
		console.log(this.txIndex);
		//console.log(`Worker ${this.workerIndex}: buyer ${buyer.companyName} ordering from : ${seller.companyName} ${drugsToOrder} of ${drug.name}`);
		const myArgs2 = {
			contractId: this.roundArguments.contractId,
			contractFunction: 'createPrivateOrder',
			contractArguments: ["KADIAN", String("1"), String("63bb67d7-f653-4b93-8637-141f1334e473"), String("63bb67d7-f653-4b93-8637-141f1334e473"), String("nothing"), "1-PDC"],
		};
		await this.sutAdapter.sendRequests(myArgs2);
	}
}
function createWorkloadModule() {
	return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
