import React,{useEffect,useState} from 'react'
import './Rowpost.css'
import axios from '../../axios'
import {imageUrl,API_KEY } from '../../constants/constants'
import YouTube from 'react-youtube'



function Rowpost(props) {
const[movies,setMovies]= useState([])
const [urlid,setUrlId]= useState('')
useEffect(() => {
 axios.get(props.url).then(response=>{
console.log('rowpost',response.data);
setMovies(response.data.results)
 }).catch(err=>{
  //alert('network error')
 })
  
}, [])

const opts = {
  height: '390',
  width: '100%',
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
  },
};

const handleMovieTailor=(id)=>{
console.log(id);  
axios.get(`movie/${id}/videos?language=en-US&api_key=${API_KEY}`).then((response)=>{
  console.log(response.data);
if(response.data.results!==0){
  setUrlId(response.data.results[0])
}
else{
  console.log('trailor not available');
}
})

}


  return (
    <div className='row'>
<h2>{props.title}</h2>
<div className="posters">
  
{movies.map((obj) => {
  return(
<div className="card" onClick={()=>handleMovieTailor(obj.id)}>
<img  className='cards__img' src={`${imageUrl+obj.backdrop_path}`} alt="" />


<div className="cards__overlay">
                    <div className="card__title">{obj?obj.original_title:""}</div>
                    <div className="card__runtime">
                        {obj?obj.release_date:""}
                        <span className="card__rating">{obj?obj.vote_average:""}<i className="fas fa-star" /></span>
                    </div>
                    <div className="card__description">{obj ? obj.overview.slice(0,118)+"..." : ""}</div>
                </div>

</div>


  )
}

  

)}
      
</div>
{ urlid && <YouTube  opts={opts}  videoId={urlid.key}  />}
    </div>
  );

}

export default Rowpost