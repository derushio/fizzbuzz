/**
 * `yarn start` で起動
 * --num: 生成数
 * --num-processes: プロセス数
 */

import * as nodeExternals from 'webpack-node-externals';
import * as sourceMapSupport from 'source-map-support';

import * as yargs from 'yargs';
import * as readlineSync from 'readline-sync';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

import * as _ from 'lodash';
import * as os from 'os';
const NUM_CPUS = os.cpus().length;

import FizzBuzz from '@/FizzBuzz';

function initSourceMap() {
    if (process.env.NODE_ENV === 'development') {
        sourceMapSupport.install();
        console.log('ENV_LOG:', 'SOURCE MAP ENABLED');
    }
}

/**
 * 引数を入力から読み込み
 */
function input() {
    let num = parseInt(yargs.argv.num as string, 10);
    let count = 0;
    while (true) {
        if (Number.isNaN(num)) {
            if (1 <= count) {
                console.error('不正な値です');
            }

            num = parseInt(readlineSync.question('生成数？: '), 10);
        } else {
            console.info('生成数:', num);
            break;
        }

        count++;
    }

    let numProcesses = parseInt(yargs.argv.numProcesses as string, 10);
    count = 0;
    while (true) {
        if (Number.isNaN(numProcesses)) {
            if (1 <= count) {
                console.error('不正な値です');
            }

            let read = readlineSync.question('プロセス数(空白でコア数)?: ');
            if (read === '') {
                read = NUM_CPUS.toString();
            }

            numProcesses = parseInt(read, 10);
        } else {
            console.info('プロセス数:', numProcesses);
            break;
        }

        count++;
    }

    return { num, numProcesses };
}

async function main() {
    initSourceMap();
    const { num, numProcesses } = input();

    // clean
    mkdirp.sync('./temp');
    rimraf.sync('./temp/*');
    mkdirp.sync('./result');
    rimraf.sync('./result/*');

    const start = _.now();
    // FizzBuzzを実行
    await FizzBuzz.exec(num, numProcesses);
    const execTime = _.now() - start;

    console.log('結果:', `\`./result/result.csv\` に書き出しました`);
    console.log('実行時間:', `${execTime}[ms]`);
}
main();
