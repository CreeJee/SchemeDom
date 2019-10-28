
# SchemeDom

> 이 저장소는 [Tagged Templates](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates) 의 문법을 보고 "dom재어도 저런식으로 골라서 상태만 뽑아내는 형태로 하면 괜찮을것같다" 라는 아이디어에 기인한 프로젝트입니다.

## VNode
### VNode.create(templateGroup, ...mutationVariable) 
- Tagged Templates 의 형식으로 html을 단순 생성해줍니다
- example)
```javascript
import { create, bind, update, remove, Effect } from "core/VNode.js";
document.body.appendChild(create`<span>Hello World</span>`);
```
### VNode.bind(vNode)
- 이미 생성된 vNode중에서 유동적인 값이 있는경우 변이를 바인딩 하기위해 사용됩니다.
```javascript
    import { create, bind, update, remove, Effect } from "core/VNode.js";
    const $ref = bind(create`<span>${'Hello World'}</span>`);
    document.body.appendChild($ref);
```
### VNode.update(vNode)(templateGroup, ...mutationVariable)
- 이미 생성된 vNode의 유동적인 값을 변이 시키기 위해 사용됩니다.
- 다만 유의사항은 placeholder 의 갯수가 create할 당시랑 동일해야합니다.
```javascript
    import { create, bind, update, remove, Effect } from "core/VNode.js";
    const $ref = create`<span>${'Lorem Ipsum'}</span>`;
    const $$mutation = update($ref);
    document.body.appendChild($ref);
    $$mutation`<span>${'Hello World'}</span>`;
```
### VNode.remove(vNode)
- 생성된 vNode를 삭제하기 위해 사용됩니다.
```javascript
import { create, bind, update, remove, Effect } from "core/VNode.js";
const $ref = create`<span>${'Lorem Ipsum'}</span>`;
const $$mutation = update($ref);
document.body.appendChild($ref);
$$mutation`<span>${'Hello World'}</span>`;
remove($ref);
```