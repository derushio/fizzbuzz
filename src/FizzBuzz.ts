// tslint:disable:member-ordering
import * as cps from 'child_process';
import * as os from 'os';
const NUM_CPUS = os.cpus().length;

import * as _ from 'lodash';

/**
 * fizzbuzzをマルチプロセスで処理するクラス
 */
export default class FizzBuzz {
    // 25000000以上1つのプロセスで処理するとメッセージングサイズをオーバーする
    public static maxNumPerProcess = 25000000;

    /**
     * fizzbuzzを評価する
     * @param index
     */
    public static checkFizzbuzz(index: number) {
        return index % 15 === 0 ? 'FizzBuzz'
            : index % 5 === 0 ? 'Buzz'
            : index % 3 === 0 ? 'Fizz'
            : index.toString();
    }

    // -----------------------------------------------------------------------------------

    /**
     * fizzbuzzを実行する
     * @param num
     * @param numProcesses
     */
    public static async exec(num: number, numProcesses = NUM_CPUS) {
        const numPerProcess = Math.ceil(num / numProcesses);
        if (FizzBuzz.maxNumPerProcess < numPerProcess) {
            throw new Error(`1プロセスあたりの処理数を${FizzBuzz.maxNumPerProcess}以上にすることはできません`);
        }

        console.log(`${num} / ${numProcesses} => ${numPerProcess}/process`);

        // プロセスごとの数配列を生成
        const numsList = this.sliceNumbers(num, numProcesses, numPerProcess);

        // 子プロセスを生成
        const workers = this.createProcesses(numProcesses);
        // 子プロセスのリスナを作成
        const processesListener = this.listenProcesses(workers);
        // 子プロセス呼び出し
        this.callProcesses(workers, numsList);
        // 答えを待つ
        await processesListener;
        // tempをマージする
        await this.mergeTemp(numProcesses);
    }

    /**
     * プロセスごとに担当するnumbersを生成する
     * @param num
     * @param numProcesses
     * @param numPerProcess
     * @return numbersList
     */
    protected static sliceNumbers(num: number, numProcesses: number, numPerProcess: number) {
        let point = 1;
        return _.range(numProcesses).map(() => {
            let nextPoint = point + numPerProcess;
            if (num <= nextPoint) {
                // 最後だったら num + 1 する
                // rangeはその数を含まない
                nextPoint = num + 1;
            }

            const list = _.range(point, nextPoint);
            point = nextPoint;
            return list;
        });
    }

    /**
     * プロセスを起動
     * @param numProcesses
     * @return workers
     */
    protected static createProcesses(numProcesses: number) {
        const workers = [] as cps.ChildProcess[];
        for (const i of _.range(numProcesses)) {
            const worker = cps.fork('./dist/sub.bundle.js');
            workers.push(worker);
        }

        return workers;
    }

    /**
     * プロセスにリスナを設置
     * @param workers
     * @return promise リスナのプロミスを返す
     */
    protected static async listenProcesses(workers: cps.ChildProcess[]) {
        const resolvers = [] as any[];
        const listener = (message: { workerId: number, fizzbuzzList: string }) => {
            workers[message.workerId].kill();
            resolvers[message.workerId]();
        };

        const promises = workers.map(() =>
                new Promise<void>((resolve) => {
            resolvers.push(resolve);
        }));

        for (const worker of workers) {
            worker.on('message', listener);
        }

        await Promise.all(promises);

        for (const worker of workers) {
            worker.removeListener('message', listener);
        }
    }

    /**
     * プロセスのタスクを実行
     * @param workers
     * @param numsList
     */
    protected static callProcesses(workers: cps.ChildProcess[], numsList: number[][]) {
        workers.forEach((worker, workerId) => {
            worker.send({ workerId, nums: numsList[workerId] });
        });
    }

    /**
     * プロセスで生成した結果をmerge
     * @param numProcesses
     */
    protected static mergeTemp(numProcesses: number) {
        return new Promise<void>((resolve, reject) => {
            cps.exec(`cat ${
                _.range(numProcesses).map((i) => {
                    return `./temp/page${i}.csv`;
                }).join(' ')
            } > ./result/result.csv`, (e) => {
                if (e != null) {
                    reject(e);
                    return;
                }

                resolve();
            });
        });
    }

    private constructor() { return; }
}
