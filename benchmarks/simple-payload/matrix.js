'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
	constructor() {
		super();
	}
	async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
		await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
	}	
	async submitTransaction() {
		const myArgs = {
			contractId: 'simple-payload',
			contractVersion: 'v1',
			contractFunction: 'multiplyMatrix',
			contractArguments: [this.roundArguments.size.toString()]
		};
		await this.sutAdapter.sendRequests(myArgs);
	}

}

function createWorkloadModule() {
	return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
