/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');


class TumhashContract extends Contract {
    async multiplyMatrix(ctx, target) {
	let newTarget = parseInt(target);
	let a = Array(newTarget).fill(3).map(()=>Array(newTarget).fill(3));
        let b = Array(newTarget).fill(3).map(()=>Array(newTarget).fill(3));
	if (!Array.isArray(a) || !Array.isArray(b) || !a.length || !b.length) {
              throw new Error('2-dimensional array format');
           }
           let x = a.length,
           z = a[0].length,
           y = b[0].length;
           console.log(b.length)
           console.log(z)
           if (b.length !== z) {
              // XxZ & ZxY => XxY
              throw new Error('not possible');
           }
           let productRow = Array.apply(null, new Array(y)).map(Number.prototype.valueOf, 0);
           let product = new Array(x);
           for (let p = 0; p < x; p++) {
              product[p] = productRow.slice();
           }
           for (let i = 0; i < x; i++) {
              for (let j = 0; j < y; j++) {
                 for (let k = 0; k < z; k++) {
                    product[i][j] += a[i][k] * b[k][j];
                 }
              }
           }
	   console.log(product);
           return product;
    }
}

module.exports = TumhashContract;
