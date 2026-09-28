import File from '../../components/file'
import Folder from '../../components/folder';

export default function Contents({content}){

    return(
        <div className="container">
            <div className='row'>
                {content.directories &&
                    content.directories.map(d => (
                        d.show ? (
                            <Folder key={d.id} name={d.directory_name} path={d.path}/>
                        ) : null
                    ))
                }
            </div>
            <div className='row'>
                {content.files &&
                    content.files.map(d => (
                        d.show ? (
                            <File key={d.id} filename={d.filename} fileid={d.id} />
                        ) : null  
                    ))
                }      
            </div>     
        </div>
    );
};
