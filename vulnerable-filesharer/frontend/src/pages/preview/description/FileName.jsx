
export default function FileName(props){
    if (props.file){
        return(
            <>
                {props.file.split('/')[props.file.split('/').length -1].replaceAll('%20', ' ')}
            </>
        )
    }
    return(
        <>
            Loading...
        </>
    )

}