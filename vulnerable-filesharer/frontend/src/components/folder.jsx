import { AiOutlineFolder } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export default function Folder(props){
    const nav = useNavigate()

    const redirect = () => {
        nav(`/storage${props.path}`);
        return
    }
    return (
        <div className='pt-1 ps-1 col-6 col-md-4' onClick={redirect}>
            <div className="border border-dark rounded p-1 d-flex" >
                <div className="align-self-center">
                    <AiOutlineFolder size={30} />
                </div>
                <h4 className="align-self-center ms-auto mb-0">{props.name}</h4>
            </div>
        </div>
    )
}