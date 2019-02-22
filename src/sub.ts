import FizzBuzz from '@/FizzBuzz';
import * as _ from 'lodash';

import * as fs from 'fs';

/**
 * 担当しているnumbersのfizzbuzzを実行
 */
process.on('message', (message: { workerId: number, nums: number[] }) => {
    const fizzbuzz = message.nums.map((index, i) => {
        return FizzBuzz.checkFizzbuzz(index);
    });

    fs.writeFileSync(`./temp/page${message.workerId}.csv`, JSON.stringify(fizzbuzz).replace(/\[|\]|"/g, ''));
    process.send!({ workerId: message.workerId });
});
