import '../css/box.css'
import Cards from "./Cards";
import NewC from "./NewC";

export default function Box({ files, onFileSelect }) {
  if(files != null){
    console.log("files is : "+files);
    console.log("files length is : "+files.length);
    console.log(files[0]);
  }

  return (
    <div className="box1">
      <Cards/>

      {files && files.length > 0 ? (
        files.map((file, index) => (
          <div key={index} className="file-card">
            <NewC 
              name={(file["course_name"]) || file.filename || "Unknown Course"} 
              num={index}
              onView={() => onFileSelect(index)}
            /> 
          </div>
        ))
      ) : (
        <p>No files available.</p>
      )}     
    </div>
  )
}