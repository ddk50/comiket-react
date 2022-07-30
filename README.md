# UPFGのWebCSV変換システム

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
これでnginxがあがってくる
