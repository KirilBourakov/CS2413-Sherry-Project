

export default function Tags(props){
    if (props.tags) {
        let tags = props.tags.split(' ');
        return(
            <>
                {tags.map(t => {
                    return(
                        <div key={t} className="badge bg-secondary ms-1 text-wrap align-self-center">
                            {t}
                        </div>     
                    )
                })}
                
            </>
        );
    };
    return(
        <div className="badge bg-secondary text-wrap align-self-center">
            None
        </div>
    );
    
};