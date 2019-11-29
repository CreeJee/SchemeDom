# SchemeDom

> 이 저장소는 [Tagged Templates](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates) 의 문법을 보고 "dom재어도 저런식으로 골라서 상태만 뽑아내는 형태로 하면 괜찮을것같다" 라는 아이디어에 기인한 프로젝트입니다.

> SchemeDom is js library when light data binding for dom
## Info
Component Pattern is Now legacy
## Installation

Use the package manager [npm](https://www.npmjs.com/) to install schemedom.

```bash
npm install schemedom
```

## Usage

```javascript
import { View } from "schemedom";
const { create, bind, update, remove, generate, Effect } = View;

let $ref = null;
let $$mutation = null;
//createNode
document.body.appendChild(create`<span>Hello World</span>`); 

//crate and mutation bind node
$ref = bind(create`<span>${'Hello World'}</span>`);
document.body.appendChild($ref);

//crate,bind and update
$ref = create`<span>${'Lorem Ipsum'}</span>`;
$$mutation = update($ref);
document.body.appendChild($ref);
$$mutation`<span>${'Hello World'}</span>`;


//crate,bind and update and remove
$ref = create`<span>${'Lorem Ipsum'}</span>`;
$$mutation = update($ref);
document.body.appendChild($ref);
$$mutation`<span>${'Hello World'}</span>`;
remove($ref);

//experiment feature
//view-binding

const store = {value: 10};
const render = (u)=>u`<span>${store.value}</span>`;

$ref = generate(store,render);
document.body.appendChild($ref);
store.value = 20; 
//will output <span>20</span>
remove($ref);
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://github.com/CreeJee/SchemeDom/blob/master/LICENSE)