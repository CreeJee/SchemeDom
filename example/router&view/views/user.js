import Component from "../../../src/Component.js"
import Fragment from "../../../src/Fragment.js"
export class User extends Component{
    render(u){
        return Fragment(
            u("nav",{},
                u("ul",{},
                    u("li",{},
                        u("a",{text : "main"})
                    )
                )
            ),
            u("h1",{text : "userPage"})
        ) 
    }
}