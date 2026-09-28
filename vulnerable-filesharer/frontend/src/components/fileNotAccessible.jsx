import { useEffect, useState } from "react";
import { TbFaceIdError } from "react-icons/tb";

export default function FileNotAccessible({ error=1 }){
    const [text, setText] = useState("We're very sorry. Something went wrong. Please try again later")

    useEffect(() => {
        if (error === 401){
            setText('You do not have access to this resource.')
        } else if (error === 404) {
            setText('This resource does not exist.')
        } else if (Math.floor(error / 100) === 5) {
            setText('Something went wrong. The good news is that it is on our end, and we are doing our best to fix it. Please try again later.')
        }
    })

    return(
            <div class="container">
                <div class="row">
                    <div class="col">
                    
                    </div>
                    <div class="col">
                        <div className="text-center">
                            <TbFaceIdError size={150}/>
                        </div>
                        <p className="text-center"></p>
                    </div>
                    <div class="col">
                        {text}
                    </div>
                </div>
            </div>
    )
}