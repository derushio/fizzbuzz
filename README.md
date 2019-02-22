# derushioのFizzBuzz
## どんなFizzBuzz
* `yarn start --num=100000000 --num-processes=4` で実行できる
    * オプション無し起動で対話式で入力可能
* `./result/result.csv` に結果が書き出される
* マルチスレッドで動く
    * 結構早い
* `CPU: i7 5557U` `Memory: 16GB` 環境で1億以上のFizzBuzzを実行できる
    * 4プロセス起動で1分以内に完了

## 必要物
* Bash
* Node.js v10+
* yarn

## 前準備
* このプロジェクトを `clone`
* このプロジェクトまで `cd`
* `yarn install`

## 実行方法
* `yarn start --num=100000000 --num-processes=4`
    * `--num`
        * optional
        * 生成数
    * `--num-processes`
        * optional
        * プロセス数(CPUと同値が最適)

## 感想などあればissueまで
* ペコリ
