## フロントエンド

### yarnをつかえ
```
$ yarn start
$ yarn test
$ yarn build
```

### eslintをつかえ
eslintでairbnbスタイル

### production環境
dockerですぐつくれる
```
$ yarn build
$ docker-compose -f docker-compose.yml up -d
```
これでnginxがあがってきて、`./build`ディレクトリにあるbuild済みのフロントエンドが公開される。
